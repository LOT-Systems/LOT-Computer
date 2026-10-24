/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */
import crypto from 'crypto';
import dayjs from 'dayjs';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { sendEmail } from '../utils/email.js';
import { verificationEmailTemplate } from '../../utils/emailTemplates.js';
import config from '../config.js';
import { sync } from '../sync.js';
import { auditFromRequest, AuditEvent, trackMultiEmailAttempt, generateRequestFingerprint, SESSION_MAX_AGE_MS, } from '../utils/security.js';
const EMAIL_CODE_VALID_MINUTES = 10;
const MAX_FAILED_ATTEMPTS = 5;
// Get version from package.json
const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8'));
const VERSION = packageJson.version || '0.0.4';
// ============================================================================
// Input Validation Schemas
// ============================================================================
const sendCodeSchema = z.object({
    email: z.string().email('Invalid email address').max(254).toLowerCase().trim(),
});
const verifyCodeSchema = z.object({
    email: z.string().email('Invalid email address').max(254).toLowerCase().trim(),
    code: z.string().trim().min(5).max(6).regex(/^\d+$/, 'Code must be numeric'),
    token: z.string().trim().min(16).max(64).regex(/^[a-f0-9]+$/, 'Invalid token format'),
});
// ============================================================================
// Brute-force protection: track failed verification attempts per IP
// ============================================================================
const failedAttempts = new Map();
// Clean up stale entries every 15 minutes
setInterval(() => {
    const cutoff = Date.now() - 15 * 60 * 1000;
    for (const [key, value] of failedAttempts) {
        if (value.lastAttempt < cutoff)
            failedAttempts.delete(key);
    }
}, 15 * 60 * 1000);
function isBlocked(ip) {
    const record = failedAttempts.get(ip);
    if (!record)
        return false;
    // Block for 15 minutes after MAX_FAILED_ATTEMPTS
    if (record.count >= MAX_FAILED_ATTEMPTS) {
        const elapsed = Date.now() - record.lastAttempt;
        if (elapsed < 15 * 60 * 1000)
            return true;
        failedAttempts.delete(ip);
    }
    return false;
}
function recordFailedAttempt(ip) {
    const record = failedAttempts.get(ip) || { count: 0, lastAttempt: 0 };
    record.count++;
    record.lastAttempt = Date.now();
    failedAttempts.set(ip, record);
}
function clearFailedAttempts(ip) {
    failedAttempts.delete(ip);
}
export default function (fastify, opts, done) {
    // Stricter rate limit on auth routes: 10 requests per minute per IP
    fastify.addHook('onRequest', async (request, reply) => {
        // Log auth requests without sensitive data
        if (config.env === 'development') {
            console.log(`[auth] ${request.method} ${request.url} from ${request.ip}`);
        }
    });
    fastify.post('/send-code', async (request, reply) => {
        // Validate input
        const parsed = sendCodeSchema.safeParse(request.body);
        if (!parsed.success) {
            return reply.status(400).send({
                statusCode: 400,
                message: 'Invalid email address',
            });
        }
        const { email } = parsed.data;
        // Check brute-force protection
        const clientIp = request.ip;
        if (isBlocked(clientIp)) {
            auditFromRequest(request, AuditEvent.LOGIN_BLOCKED, { email });
            return reply.status(429).send({
                statusCode: 429,
                message: 'Too many attempts. Please try again later.',
            });
        }
        try {
            const code = crypto.randomInt(1e5, 1e6 - 1).toString();
            const token = crypto.randomBytes(16).toString('hex');
            const magicLinkToken = crypto.randomBytes(32).toString('hex');
            await fastify.models.EmailCode.create({
                code,
                token,
                email,
                magicLinkToken,
                validUntil: dayjs()
                    .add(EMAIL_CODE_VALID_MINUTES, 'minutes')
                    .toDate(),
            });
            const currentDate = dayjs().format('MMMM D, YYYY');
            const emailResult = await sendEmail({
                to: email,
                text: verificationEmailTemplate(code, VERSION, currentDate),
                subject: 'LOT – Verification Code',
            });
            if (!emailResult.success) {
                throw new Error(`Failed to send email: ${emailResult.error || 'unknown reason'}`);
            }
            return { token };
        }
        catch (err) {
            const debugInfo = err?.message || 'Unknown error';
            console.error('[auth] send-code error:', debugInfo);
            return reply.status(500).send({
                statusCode: 500,
                message: 'Unable to send sign up code. The problem was reported. Please try again later.',
                // Only expose debug info in development (never in production)
                ...(config.env === 'development' ? { debug: debugInfo } : {}),
            });
        }
    });
    // Verify code and create session
    fastify.post('/email/code', async (request, reply) => {
        // Validate input
        const parsed = verifyCodeSchema.safeParse(request.body);
        if (!parsed.success) {
            return reply.status(400).send({
                statusCode: 400,
                message: 'Invalid input. Please check your code and try again.',
            });
        }
        const { email, code, token } = parsed.data;
        // Check brute-force protection
        const clientIp = request.ip;
        if (isBlocked(clientIp)) {
            return reply.status(429).send({
                statusCode: 429,
                message: 'Too many failed attempts. Please try again in 15 minutes.',
            });
        }
        try {
            // Find the email code record
            const emailCode = await fastify.models.EmailCode.findOne({
                where: { email, token }
            });
            if (!emailCode) {
                recordFailedAttempt(clientIp);
                auditFromRequest(request, AuditEvent.LOGIN_FAILED, {
                    email,
                    reason: 'invalid_token',
                });
                // Detect credential stuffing (many different emails from same IP)
                if (trackMultiEmailAttempt(clientIp, email)) {
                    auditFromRequest(request, AuditEvent.SUSPICIOUS_ACTIVITY, {
                        reason: 'credential_stuffing',
                        email,
                    });
                }
                return reply.status(400).send({
                    statusCode: 400,
                    message: 'Invalid or expired code'
                });
            }
            // Check if expired
            if (dayjs().isAfter(emailCode.validUntil)) {
                // Delete expired code
                await emailCode.destroy();
                return reply.status(400).send({
                    statusCode: 400,
                    message: 'Code has expired. Please request a new one.'
                });
            }
            // Constant-time comparison to prevent timing attacks
            const codeMatch = crypto.timingSafeEqual(Buffer.from(emailCode.code.padEnd(6)), Buffer.from(code.padEnd(6)));
            if (!codeMatch) {
                recordFailedAttempt(clientIp);
                auditFromRequest(request, AuditEvent.LOGIN_FAILED, {
                    email,
                    reason: 'invalid_code',
                });
                return reply.status(400).send({
                    statusCode: 400,
                    message: 'Invalid code'
                });
            }
            // Clear failed attempts on success
            clearFailedAttempts(clientIp);
            // Find or create user
            let user = await fastify.models.User.findOne({ where: { email } });
            let isNewUser = false;
            if (!user) {
                user = await fastify.models.User.create({
                    email,
                    joinedAt: new Date()
                });
                isNewUser = true;
            }
            // Create session with security metadata
            const sessionToken = crypto.randomBytes(32).toString('hex');
            const fingerprint = generateRequestFingerprint(request);
            await fastify.models.Session.create({
                token: sessionToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + SESSION_MAX_AGE_MS),
                createdFromIp: clientIp,
                fingerprint,
            });
            // Audit log: successful login
            auditFromRequest(request, AuditEvent.LOGIN_SUCCESS, {
                email,
                isNewUser,
                userId: user.id,
            });
            // Increment total site visitors counter
            try {
                let systemUser = await fastify.models.User.findOne({
                    where: { email: 'system@lot' }
                });
                if (!systemUser) {
                    systemUser = await fastify.models.User.create({
                        email: 'system@lot',
                        firstName: 'System',
                        lastName: 'Stats',
                        metadata: {
                            totalSiteVisitors: 0
                        }
                    });
                }
                const currentVisitors = systemUser.metadata?.totalSiteVisitors || 0;
                await systemUser.update({
                    metadata: {
                        ...systemUser.metadata,
                        totalSiteVisitors: currentVisitors + 1
                    }
                });
            }
            catch (error) {
                console.error('[auth] Error incrementing visitor stats');
            }
            // Broadcast updated user count if new user joined
            if (isNewUser) {
                const usersTotal = await fastify.models.User.countJoined();
                sync.emit('users_total', { value: usersTotal });
            }
            // Set cookie with security flags
            reply.setCookie(config.jwt.cookieKey, sessionToken, {
                path: '/',
                httpOnly: true,
                secure: config.env === 'production',
                sameSite: 'lax',
                maxAge: 30 * 24 * 60 * 60 // 30 days in seconds
            });
            // Delete the used email code
            await emailCode.destroy();
            return { success: true };
        }
        catch (err) {
            console.error('[auth] verify-code error:', err?.message || 'Unknown error');
            return reply.status(500).send({
                statusCode: 500,
                message: 'Unable to verify code. Please try again.'
            });
        }
    });
    // Logout route
    fastify.get('/logout', async (request, reply) => {
        try {
            const token = request.cookies[config.jwt.cookieKey];
            if (token) {
                auditFromRequest(request, AuditEvent.LOGOUT, {});
                await fastify.models.Session.destroy({
                    where: { token }
                });
            }
            reply.clearCookie(config.jwt.cookieKey, {
                path: '/',
            });
            return reply.redirect('/');
        }
        catch (err) {
            console.error('[auth] logout error:', err?.message || 'Unknown error');
            reply.clearCookie(config.jwt.cookieKey, { path: '/' });
            return reply.redirect('/');
        }
    });
    done();
}
