const nodemailer = require('nodemailer');

const getCredentials = () => {
    let user = (process.env.EMAIL_USER || process.env.SMTP_USER || '').trim();
    let pass = (process.env.EMAIL_PASS || process.env.SMTP_PASS || '').trim().replace(/\s+/g, '');
    if (user === 'edusure24@gmail.com' || pass.startsWith('goj') || !user) {
        user = 'edusure2026@gmail.com';
        pass = 'senzctejkqizuxod';
    }
    return { user, pass };
};

/**
 * Generate standard, RFC-compliant, deliverability-optimized HTML & Plain-Text templates for OTP emails.
 * High text-to-HTML ratio, valid HTML5 doctype, preheader preview, responsive layout, security footer.
 */
const generateOtpEmailTemplates = ({ otp, userEmail }) => {
    const currentYear = new Date().getFullYear();

    const plainText = [
        `EduSure Verification Code`,
        `=========================`,
        ``,
        `Your verification code is: ${otp}`,
        ``,
        `This single-use code is valid for 10 minutes.`,
        `For your security, never share this code with anyone. EduSure will never ask for your verification code.`,
        ``,
        `If you did not request this verification code, please ignore this email. Your account remains secure.`,
        ``,
        `---`,
        `EduSure Learning & Examination Platform`,
        `Official Institutional Communication`,
        `© ${currentYear} EduSure. All rights reserved.`
    ].join('\n');

    const html = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>EduSure Verification Code: ${otp}</title>
    <!--[if mso]>
    <style type="text/css">
        body, table, td { font-family: Arial, Helvetica, sans-serif !important; }
    </style>
    <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%;">
    <!-- Hidden preheader text to optimize inbox preview and prevent spam filtering -->
    <div style="display: none; max-height: 0px; overflow: hidden; mso-hide: all; font-size: 1px; line-height: 1px; max-width: 0px; opacity: 0;">
        Your EduSure verification code is ${otp}. Valid for 10 minutes. Never share this code.
    </div>

    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; padding: 32px 12px;">
        <tr>
            <td align="center">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #4f46e5 0%, #312e81 100%); padding: 32px 28px; text-align: center;">
                            <div style="display: inline-block; background-color: rgba(255, 255, 255, 0.18); border: 1px solid rgba(255, 255, 255, 0.25); border-radius: 9999px; padding: 4px 14px; margin-bottom: 12px;">
                                <span style="color: #ffffff; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">Identity Verification</span>
                            </div>
                            <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">EduSure</h1>
                            <p style="color: rgba(255, 255, 255, 0.85); margin: 6px 0 0 0; font-size: 13px;">Learning &amp; Academic Platform</p>
                        </td>
                    </tr>
                    
                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 32px 28px;">
                            <h2 style="color: #0f172a; margin: 0 0 12px 0; font-size: 20px; font-weight: 700;">Account Verification</h2>
                            <p style="margin: 0 0 20px 0; color: #475569; font-size: 14.5px; line-height: 1.6;">
                                Please use the following 6-digit one-time verification code to verify your identity and access your EduSure account:
                            </p>
                            
                            <!-- OTP Box -->
                            <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 24px 16px; text-align: center; margin: 24px 0;">
                                <span style="display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 1.2px; margin-bottom: 8px;">Single-Use Verification Code</span>
                                <div style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #4f46e5; user-select: all; line-height: 1.2;">
                                    ${otp}
                                </div>
                                <span style="display: block; font-size: 12px; color: #94a3b8; margin-top: 10px; font-weight: 500;">Expires in 10 minutes</span>
                            </div>

                            <!-- Security Alert Callout -->
                            <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; border-radius: 6px; padding: 12px 16px; margin: 24px 0;">
                                <p style="margin: 0; color: #166534; font-size: 13px; line-height: 1.5;">
                                    <strong>Security Notice:</strong> EduSure staff will never ask for this code or your password. Never share this code with anyone.
                                </p>
                            </div>

                            <p style="margin: 20px 0 0 0; color: #64748b; font-size: 13px; line-height: 1.5;">
                                If you did not make this request, you can safely ignore this email. No changes will be made to your account.
                            </p>
                        </td>
                    </tr>

                    <!-- Institutional Footer -->
                    <tr>
                        <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 28px; text-align: center;">
                            <p style="margin: 0 0 6px 0; color: #475569; font-size: 12px; font-weight: 600;">
                                EduSure Learning &amp; Examination Portal
                            </p>
                            <p style="margin: 0 0 8px 0; color: #94a3b8; font-size: 11px; line-height: 1.4;">
                                This is an automated transactional message sent to ${userEmail || 'your email'}.
                            </p>
                            <p style="margin: 0; color: #cbd5e1; font-size: 11px;">
                                &copy; ${currentYear} EduSure. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

    return { html, plainText };
};

const sendEmail = async ({ email, subject, otp }) => {
    try {
        const { user, pass } = getCredentials();
        const port = parseInt(process.env.SMTP_PORT) || 465;

        // Create transporter on demand
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: port,
            secure: port === 465,
            auth: { user, pass },
            tls: { rejectUnauthorized: false }
        });

        // Use verified sender address with friendly institutional display name
        const fromAddress = {
            name: 'EduSure',
            address: user
        };

        // Deliverability-optimized subject line:
        // Placing the OTP code directly in the subject line triggers Gmail and iOS/Android
        // native 2FA recognition algorithms, placing it in Primary Inbox and enabling "Copy Code"
        const optimizedSubject = otp 
            ? `${otp} is your EduSure verification code`
            : (subject || 'EduSure Verification Code');

        const { html, plainText } = generateOtpEmailTemplates({
            otp: otp || '------',
            userEmail: email
        });

        const mailOptions = {
            from: fromAddress,
            to: email,
            replyTo: user,
            subject: optimizedSubject,
            text: plainText,
            html: html,
            // RFC 3834 / transactional deliverability headers
            priority: 'high',
            headers: {
                'X-Priority': '1',
                'X-MSMail-Priority': 'High',
                'Importance': 'High',
                'Auto-Submitted': 'auto-generated',
                'X-Auto-Response-Suppress': 'All'
            }
        };

        await transporter.sendMail(mailOptions);
        console.log(`[SMTP] ✓ OTP verification email delivered to ${email}`);
        return true;
    } catch (error) {
        console.error('[SMTP] ✗ Email dispatch failed:', error);
        throw error;
    }
};

module.exports = sendEmail;