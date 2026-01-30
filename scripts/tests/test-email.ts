import { Resend } from 'resend';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testEmail() {
  try {
    console.log('Starting email test...');
    
    // Initialize Resend
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    // Log API key prefix (safely)
    console.log('Using API key starting with:', process.env.RESEND_API_KEY?.substring(0, 5));

    const { data, error } = await resend.emails.send({
      from: 'auth@lot-systems.com',
      to: ['vadikmarmeladov@gmail.com'],
      subject: 'Test Email from Lot Systems',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Test Email</h2>
          <p>This is a test email sent at: ${new Date().toISOString()}</p>
        </div>
      `
    });

    if (error) {
      console.error('Resend error:', error);
      return;
    }

    console.log('Email sent successfully:', data);
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testEmail();
