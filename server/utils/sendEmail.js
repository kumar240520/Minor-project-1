const nodemailer = require('nodemailer');

// Create a transporter using environment variables
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendEmail = async ({ email, subject, otp }) => {
    try {
        // Validate environment variables
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn('Email credentials not configured. Please set EMAIL_USER and EMAIL_PASS in .env');
            // For development, return success without sending email
            return true;
        }

        const mailOptions = {
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: email,
            subject: subject,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; color: white;">
                        <h1 style="margin: 0; font-size: 32px;">EduSure</h1>
                        <p style="margin: 10px 0; font-size: 18px;">Your Verification Code</p>
                    </div>
                    <div style="background: #f9f9f9; padding: 30px; border-radius: 10px; margin-top: 20px;">
                        <h2 style="color: #333; margin-bottom: 20px;">Your OTP Code</h2>
                        <div style="background: #fff; border: 2px solid #e0e0e0; border-radius: 8px; padding: 20px; margin: 20px 0;">
                            <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #667eea; text-align: center;">
                                ${otp}
                            </div>
                        </div>
                        <p style="color: #666; margin-top: 20px;">
                            This code will expire in 5 minutes. Please do not share this code with anyone.
                        </p>
                        <p style="color: #999; font-size: 14px; margin-top: 30px;">
                            If you didn't request this code, please ignore this email.
                        </p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${email}`);
        return true;
    } catch (error) {
        console.error('Email sending error:', error);
        throw error;
    }
};

module.exports = sendEmail;