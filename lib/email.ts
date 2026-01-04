import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface ContactSubmission {
  name: string;
  email: string;
  company?: string;
  role?: string;
  intent: string;
  message?: string;
  timestamp: string;
}

export async function sendLeadNotification(data: ContactSubmission) {
  const intentLabels: Record<string, string> = {
    'try-app': 'Try the app',
    'feedback': 'Share feedback',
    'pain-points': 'Discuss pain points',
    'connect': 'Just connect',
  };

  try {
    await resend.emails.send({
      from: 'MuniFlow Leads <leads@muniflow.io>', // Update with your verified domain
      to: process.env.NOTIFICATION_EMAIL || 'steve@muniflow.io', // Your email
      subject: `🎯 New MuniFlow Lead: ${data.name} wants to ${intentLabels[data.intent] || data.intent}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #580067;">New Contact Form Submission</h2>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Contact Details</h3>
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
            ${data.company ? `<p><strong>Company:</strong> ${data.company}</p>` : ''}
            ${data.role ? `<p><strong>Role:</strong> ${data.role}</p>` : ''}
            <p><strong>Intent:</strong> ${intentLabels[data.intent] || data.intent}</p>
          </div>

          ${data.message ? `
            <div style="background: #fff; padding: 20px; border-left: 4px solid #66ffcc; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #333;">Message</h3>
              <p style="white-space: pre-wrap;">${data.message}</p>
            </div>
          ` : ''}

          <p style="color: #666; font-size: 12px;">
            Submitted: ${new Date(data.timestamp).toLocaleString('en-US', { 
              dateStyle: 'full', 
              timeStyle: 'short' 
            })}
          </p>
        </div>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send lead notification:', error);
    return { success: false, error };
  }
}

export async function sendConfirmationEmail(email: string, name: string, intent: string) {
  try {
    const greetings: Record<string, string> = {
      'try-app': 'We\'ll send you access details within 24 hours.',
      'feedback': 'We\'d love to hear your thoughts on municipal bond workflows.',
      'pain-points': 'Let\'s talk about what\'s broken and how we can fix it.',
      'connect': 'Looking forward to connecting with you.',
    };

    await resend.emails.send({
      from: 'MuniFlow <hello@muniflow.io>', // Update with your verified domain
      to: email,
      subject: 'Thanks for reaching out to MuniFlow',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #580067;">Thanks for reaching out, ${name}!</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            We received your message and will get back to you soon.
          </p>

          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            ${greetings[intent] || 'We\'ll be in touch shortly.'}
          </p>

          <div style="margin: 30px 0; padding: 20px; background: linear-gradient(135deg, #580067 0%, #0095ff 100%); border-radius: 8px;">
            <p style="color: white; margin: 0; font-size: 14px;">
              In the meantime, feel free to reply to this email if you have any questions.
            </p>
          </div>

          <p style="color: #666; font-size: 14px;">
            — The MuniFlow team
          </p>
        </div>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
    return { success: false, error };
  }
}

