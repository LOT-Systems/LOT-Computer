import { Resend } from 'resend';
if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set in environment variables');
}
const resend = new Resend(process.env.RESEND_API_KEY);
export async function sendEmail({ to, html, subject }) {
    try {
        console.log('Starting email send process...', {
            to,
            subject,
            apiKeyExists: !!process.env.RESEND_API_KEY,
            timestamp: new Date().toISOString()
        });
        const emailData = {
            from: 'auth@lot-systems.com',
            to: [to],
            subject,
            html,
        };
        console.log('Preparing to send email with data:', {
            ...emailData,
            html: 'HTML content hidden for logging'
        });
        let result;
        try {
            result = await resend.emails.send(emailData);
            console.log('Raw Resend response:', result);
        }
        catch (resendError) {
            console.error('Resend API error:', {
                error: resendError,
                stack: resendError.stack
            });
            throw resendError;
        }
        const { data, error } = result;
        if (error) {
            console.error('Resend returned error:', {
                error,
                errorDetails: error.message,
                errorCode: error.statusCode
            });
            throw error;
        }
        console.log('Email sent successfully:', {
            to,
            messageId: data?.id,
            timestamp: new Date().toISOString()
        });
        return { success: true, messageId: data?.id };
    }
    catch (error) {
        console.error('Email sending failed:', {
            error: error.message,
            stack: error.stack,
            to,
            timestamp: new Date().toISOString()
        });
        return {
            success: false,
            error: error.message || 'Unknown error occurred'
        };
    }
}
