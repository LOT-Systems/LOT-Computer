import crypto from 'crypto';
import dayjs from 'dayjs';
import { sendEmail } from '../utils/email';
const EMAIL_CODE_VALID_MINUTES = 10;
module.exports = function (fastify, opts, done) {
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
        const { email } = request.body;
        try {
            console.log('Generating verification code for:', email);
            const code = crypto.randomInt(1e5, 1e6 - 1).toString();
            const token = crypto.randomBytes(16).toString('hex');
            const magicLinkToken = crypto.randomBytes(32).toString('hex');
            console.log('Creating email code record');
            const emailCode = await fastify.models.EmailCode.create({
                code,
                token,
                email,
                magicLinkToken,
                validUntil: dayjs()
                    .add(EMAIL_CODE_VALID_MINUTES, 'minutes')
                    .toDate(),
            });
            console.log('Email code record created:', emailCode.id);
            console.log('Sending verification email');
            const emailResult = await sendEmail({
                to: email,
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Welcome to Lot Systems</h2>
            <p>Your verification code is: <strong style="font-size: 24px; color: #4A5568;">${code}</strong></p>
            <p>This code will expire in ${EMAIL_CODE_VALID_MINUTES} minutes.</p>
          </div>
        `,
                subject: `Your Lot Systems Verification Code`,
            });
            if (!emailResult.success) {
                console.error('Email send failed:', emailResult);
                throw new Error('Failed to send email');
            }
            console.log('Email sent successfully to:', email);
            return { token };
        }
        catch (err) {
            console.error('Email sending error:', {
                error: err.message,
                stack: err.stack,
                email,
                timestamp: new Date().toISOString()
            });
            return reply.throw.internalError('Unable to send sign up code. The problem was reported. Please try again later.');
        }
    });
    done();
};
