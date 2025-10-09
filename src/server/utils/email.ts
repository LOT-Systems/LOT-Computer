import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailParams {
  to: string;
  html: string;
  subject: string;
}

export async function sendEmail({ to, html, subject }: EmailParams) {
  try {
    console.log('Sending email via Resend:', {
      to,
      subject,
      timestamp: new Date().toISOString()
    });

    // Remove any potential id field from the request
    const emailData = {
      from: 'auth@lot-systems.com',
      to: [to],
      subject,
      html,
      // Make sure we're not passing any additional fields
    };

    console.log('Email request data:', emailData);

    const { data, error } = await resend.emails.send(emailData);

    if (error) {
      console.error('Resend error:', error);
      throw error;
    }

    // Only log essential data
    console.log('Email sent successfully:', {
      to,
      timestamp: new Date().toISOString()
    });

    return { success: true };
  } catch (error) {
    console.error('Email sending error:', {
      error,
      to,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}
