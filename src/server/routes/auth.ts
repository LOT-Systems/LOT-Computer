import { FastifyInstance } from 'fastify';
import crypto from 'crypto';
import dayjs from 'dayjs';
import fs from 'fs';
import path from 'path';
import { sendEmail } from '../utils/email.js';
import { verificationEmailTemplate } from '../../utils/emailTemplates.js';
import config from '../config.js';
import { sync } from '../sync.js';

const EMAIL_CODE_VALID_MINUTES = 10;

// Get version from package.json
const packageJson = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8')
);
const VERSION = packageJson.version || '0.0.4';

export default function (fastify: FastifyInstance, opts: any, done: () => void) {
  // Add request logging
  fastify.addHook('onRequest', async (request) => {
    console.log('Auth route request:', {
      method: request.method,
      url: request.url,
      body: request.body,
      timestamp: new Date().toISOString()
    });
  });

  // Add error logging
  fastify.addHook('onError', async (request, reply, error) => {
    console.error('Auth route error:', {
      method: request.method,
      url: request.url,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  });

  fastify.post('/send-code', async (request, reply) => {
    const { email } = request.body as { email: string };
    
    try {
      console.log('Generating verification code for:', email);
      const code = crypto.randomInt(1e5, 1e6 - 1).toString()
      const token = crypto.randomBytes(16).toString('hex')
      const magicLinkToken = crypto.randomBytes(32).toString('hex')
      
      console.log('Creating email code record');
      const emailCode = await fastify.models.EmailCode.create({
        code,
        token,
        email,
        magicLinkToken,
        validUntil: dayjs()
          .add(EMAIL_CODE_VALID_MINUTES, 'minutes')
          .toDate(),
      })
      
      console.log('Email code record created:', emailCode.id);
      console.log('Sending verification email');

      const currentDate = dayjs().format('MMMM D, YYYY');
      const emailResult = await sendEmail({
        to: email,
        text: verificationEmailTemplate(code, VERSION, currentDate),
        subject: 'LOT – Verification Code',
      });
      
      if (!emailResult.success) {
        console.error('Email send failed:', emailResult);
        throw new Error('Failed to send email');
      }
      
      console.log('Email sent successfully to:', email);
      return { token }
    } catch (err: any) {
      console.error('Email sending error:', {
        error: err?.message || 'Unknown error',
        stack: err?.stack || 'No stack trace',
        email,
        timestamp: new Date().toISOString()
      });
      return reply.throw.internalError(
        'Unable to send sign up code. The problem was reported. Please try again later.'
      )
    }
  });

  // NEW: Verify code and create session
  fastify.post('/email/code', async (request, reply) => {
    const { email, code, token } = request.body as { 
      email: string; 
      code: string; 
      token: string;
    };
    
    try {
      console.log('Verifying code for:', email);
      
      // Find the email code record
      const emailCode = await fastify.models.EmailCode.findOne({
        where: { email, token }
      });
      
      if (!emailCode) {
        console.log('Invalid token for email:', email);
        return reply.status(400).send({ 
          statusCode: 400,
          message: 'Invalid or expired code' 
        });
      }
      
      // Check if expired
      if (dayjs().isAfter(emailCode.validUntil)) {
        console.log('Expired code for email:', email);
        return reply.status(400).send({ 
          statusCode: 400,
          message: 'Code has expired. Please request a new one.' 
        });
      }
      
      // Verify the code
      if (emailCode.code !== code) {
        console.log('Invalid code provided for email:', email);
        return reply.status(400).send({ 
          statusCode: 400,
          message: 'Invalid code' 
        });
      }
      
      console.log('Code verified successfully for:', email);
      
      // Find or create user
      let user = await fastify.models.User.findOne({ where: { email } });
      let isNewUser = false;

      if (!user) {
        console.log('Creating new user:', email);
        user = await fastify.models.User.create({
          email,
          joinedAt: new Date()
        });
        isNewUser = true;
      }
      
      // Create session
      const sessionToken = crypto.randomBytes(32).toString('hex');
      await fastify.models.Session.create({
        token: sessionToken,
        userId: user.id,
      });

      console.log('Session created for user:', user.id);

      // Increment total site visitors counter
      try {
        const systemUser = await fastify.models.User.findOne({
          where: { email: 'system@lot' }
        })
        if (systemUser) {
          const currentVisitors = systemUser.metadata?.totalSiteVisitors || 0
          await systemUser.update({
            metadata: {
              ...systemUser.metadata,
              totalSiteVisitors: currentVisitors + 1
            }
          })
        }
      } catch (error) {
        console.error('Error incrementing total site visitors:', error)
      }

      // Broadcast updated user count if new user joined
      if (isNewUser) {
        const usersTotal = await fastify.models.User.countJoined();
        sync.emit('users_total', { value: usersTotal });
        console.log('New user joined, broadcasting users_total:', usersTotal);
      }
      
      // Set cookie
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
      
    } catch (err: any) {
      console.error('Code verification error:', {
        error: err?.message || 'Unknown error',
        stack: err?.stack || 'No stack trace',
        email,
        timestamp: new Date().toISOString()
      });
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
        // Delete the session from database
        await fastify.models.Session.destroy({
          where: { token }
        });

        console.log('Session deleted for token:', token);
      }

      // Clear the cookie
      reply.clearCookie(config.jwt.cookieKey, {
        path: '/',
      });

      console.log('User logged out, redirecting to home');
      return reply.redirect('/');

    } catch (err: any) {
      console.error('Logout error:', {
        error: err?.message || 'Unknown error',
        stack: err?.stack || 'No stack trace',
        timestamp: new Date().toISOString()
      });
      // Even if there's an error, clear the cookie and redirect
      reply.clearCookie(config.jwt.cookieKey, { path: '/' });
      return reply.redirect('/');
    }
  });

  done();
}
