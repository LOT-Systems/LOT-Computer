import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
  try {
    console.log('Starting test...');
    const result = await resend.emails.send({
      from: 'support@lot-systems.com',
      to: ['your-test-email@example.com'],
      subject: 'Test Email',
      html: '<p>Test email</p>'
    });
    console.log('Result:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

testEmail();
