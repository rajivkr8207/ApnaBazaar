import Config from '../config/Config.js';
import MailTranspoter from '../config/mail.js';

const getEmailTemplate = (
  title,
  name,
  message,
  buttonText,
  buttonUrl,
  expirationText,
  isOtp = false,
  otpValue,
) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 40px 20px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }
        .content { padding: 40px 30px; color: #374151; line-height: 1.6; }
        .content h2 { color: #111827; font-size: 22px; margin-top: 0; font-weight: 600; }
        .content p { margin: 15px 0; font-size: 16px; color: #4b5563; }
        .action-container { text-align: center; margin: 40px 0; }
        .btn { display: inline-block; background-color: #4f46e5; color: #ffffff !important; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; transition: all 0.3s ease; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2); }
        .btn:hover { background-color: #4338ca; transform: translateY(-1px); box-shadow: 0 6px 8px -1px rgba(79, 70, 229, 0.3); }
        .otp-box { background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 24px; font-size: 36px; font-weight: 800; color: #4f46e5; letter-spacing: 8px; margin: 30px auto; max-width: 240px; text-align: center; }
        .expiration { color: #ef4444; font-size: 14px; text-align: center; padding: 10px; background: #fef2f2; border-radius: 6px; margin-top: 30px; font-weight: 500; }
        .footer { background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #f3f4f6; font-size: 14px; color: #9ca3af; }
        .footer p { margin: 5px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${title}</h1>
        </div>
        <div class="content">
            <h2>Hello ${name},</h2>
            <p>${message}</p>
            
            ${
              isOtp
                ? `
            <div class="otp-box">${otpValue}</div>
            <p style="text-align: center; color: #6b7280; font-size: 14px; margin-top: -10px;">Use the code above or click the button below to proceed.</p>
            `
                : ''
            }

            <div class="action-container">
                <a href="${buttonUrl}" class="btn">${buttonText}</a>
            </div>
            
            <div class="expiration">
                ${expirationText}
            </div>
            
            <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">If you didn't request this email, you can safely ignore it. Your account remains secure.</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

export class MailService {
  async SendRegisterMail(email, otp, name) {
    const url = `${Config.frontend_url}/api/v1/users/verify-email?email=${email}`;
    try {
      const mailoptions = {
        from: `${Config.smtp_user}`,
        to: email,
        subject: 'Verify your email address',
        html: getEmailTemplate(
          'Verify Your Email',
          name,
          "Welcome to our platform! We're excited to have you on board. Before we get started, please verify your email address to ensure your account's security.",
          'Verify Email Now',
          url,
          '⏱️ This verification link and OTP will expire in 15 minutes.',
          true,
          otp,
        ),
      };
      const mailresponse = await MailTranspoter.sendMail(mailoptions);
      return mailresponse;
    } catch (error) {
      console.error('Verify Email Error:', error);
    }
    console.log(`Sending email to ${email} with subject and text "${otp}"`);
  }
  async SendAgainRegisterMail(email, otp, name) {
    const url = `${Config.frontend_url}/verify-email?email=${email}`;
    try {
      const mailoptions = {
        from: `${Config.smtp_user}`,
        to: email,
        subject: 'Verify your email address',
        html: getEmailTemplate(
          'Verify Your Email',
          name,
          "Welcome to our platform! We're excited to have you on board. Before we get started, please verify your email address to ensure your account's security.",
          'Verify Email Now',
          url,
          '⏱️ This verification link and OTP will expire in 15 minutes.',
          true,
          otp,
        ),
      };
      const mailresponse = await MailTranspoter.sendMail(mailoptions);
      return mailresponse;
    } catch (error) {
      console.error('Resend Verify Email Error:', error);
    }
  }
}
