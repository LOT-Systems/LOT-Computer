import { Resend } from 'resend';
import { verificationEmailTemplate } from './emailTemplates';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, code: string) {
  try {
    console.log('Sending verification email to:', email);

    const { data, error } = await resend.emails.send({
      from: 'auth@lot-systems.com', // Your verified domain
      to: [email],
      subject: 'LOT - Verification Code',
      text: verificationEmailTemplate(code)
    });

    if (error) {
      console.error('Email sending error:', error);
      throw new Error('Failed to send verification email');
    }

    console.log('Email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Detailed error:', error);
    throw error;
  }
}
