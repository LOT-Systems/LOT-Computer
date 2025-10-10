import { Resend } from 'resend';
import { NextResponse } from 'next/server';

// Add debug logging
console.log('API Key exists:', !!process.env.RESEND_API_KEY);
console.log('API Key prefix:', process.env.RESEND_API_KEY?.substring(0, 3));

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    console.log('Auth endpoint hit');
    const { email } = await request.json();
    console.log('Attempting to send email to:', email);

    // Test Resend connection
    const result = await resend.emails.send({
      from: 'support@lot-systems.com',
      to: [email],
      subject: 'Test Email',
      html: '<p>Test</p>'
    });

    console.log('Resend response:', result);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Detailed error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
