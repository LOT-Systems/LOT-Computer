require('dotenv').config();
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function testProduction() {
  try {
    console.log('Testing production email...');
    const { data, error } = await resend.emails.send({
      from: 'auth@lot-systems.com',
      to: 'vadikmarmeladov@gmail.com',
      subject: 'Lot Systems - Production Test',
      html: `
        <h2>Production Test Email</h2>
        <p>This is a test from the verified domain lot-systems.com</p>
        <p>Time: ${new Date().toISOString()}</p>
      `
    });

    if (error) {
      console.error('Error:', error);
    } else {
      console.log('Success:', data);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testProduction();
