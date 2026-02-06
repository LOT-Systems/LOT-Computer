require('dotenv').config();
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function test() {
  try {
    console.log('Starting email test...');
    const { data, error } = await resend.emails.send({
      from: 'support@lot-systems.com',
      to: 'vadikmarmeladov@gmail.com',
      subject: 'Test Email from Lot Systems',
      html: `
        <h2>Test Email</h2>
        <p>This is a test email to verify the Resend integration.</p>
        <p>Time sent: ${new Date().toISOString()}</p>
      `
    });

    if (error) {
      console.error('Resend Error:', error);
    } else {
      console.log('Success! Email sent:', data);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
