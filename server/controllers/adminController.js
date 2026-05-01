const nodemailer = require('nodemailer');
const { supabase } = require('../supabaseClient');
 
// ─── Gmail SMTP Transporter ───────────────────────────────────────────────────
// Uses Nodemailer with Gmail's SMTP relay (~500 free emails/day)
// Configure SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in server/.env
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: parseInt(process.env.SMTP_PORT) === 465, // Port 465 requires true, 587 requires false
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });
};
 
const isSmtpConfigured = () => {
    return !!process.env.SMTP_USER && !!process.env.SMTP_PASS;
};
 
// @desc    Send bulk email to users
// @route   POST /api/admin/bulk-email
// @access  Private (Admin only)
exports.sendBulkEmail = async (req, res) => {
    try {
        const { campaignId, recipients, subject, content } = req.body;
 
        if (!campaignId || !recipients || !subject || !content) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: campaignId, recipients, subject, content'
            });
        }
 
        // Verify admin authorization
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: No Bearer token'
            });
        }
 
        const token = authHeader.split(' ')[1];
        const { data: { user }, authError } = await supabase.auth.getUser(token);
        
        if (authError || !user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: Invalid token'
            });
        }
 
        // Check if user has admin role from database
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();
 
        if (userError || !userData || userData.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: Admin access required'
            });
        }
 
        // ── Gmail SMTP via Nodemailer ────────────────────────────────────────
        if (!isSmtpConfigured()) {
            return res.status(500).json({
                 success: false,
                 message: 'SMTP credentials not configured on the server.'
            });
        }
 
        const transporter = createTransporter();
        const fromAddress = process.env.EMAIL_FROM || `EduSure <${process.env.SMTP_USER}>`;
 
        // Verify SMTP connection before sending
        try {
            await transporter.verify();
        } catch (verifyError) {
            console.error('[SMTP] Connection FAILED:', verifyError.message);
            return res.status(500).json({
                success: false,
                message: `SMTP connection failed: ${verifyError.message}. Check SMTP_USER/SMTP_PASS in server/.env`
            });
        }
 
        // Gmail allows up to ~500/day on free tier — send in batches of 10
        // with a 1-second gap to respect rate limits
        const batchSize = 10;
        const batches = [];
 
        for (let i = 0; i < recipients.length; i += batchSize) {
            batches.push(recipients.slice(i, i + batchSize));
        }
 
        // Debug: Log original content at every step
        console.log('[DEBUG] === CONTENT PIPELINE DEBUG ===');
        console.log('[DEBUG] Raw content from request:', JSON.stringify(content));
        console.log('[DEBUG] Content type:', typeof content);
        console.log('[DEBUG] Content length:', content?.length);
        
        // Preserve all formatting exactly as typed
        let formattedContent = content.trim();
        
        console.log('[DEBUG] After trim:', JSON.stringify(formattedContent));
        console.log('[DEBUG] === END CONTENT PIPELINE DEBUG ===');
        
        // FIXED: Escape HTML entities FIRST, then use the escaped version
        const escapedContent = formattedContent
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
 
        // FIXED: Convert newlines to <br> tags and wrap in proper paragraph structure
        // Split by double newlines for paragraphs, but preserve single newlines within
        const paragraphs = escapedContent.split(/\n\s*\n/).filter(p => p.trim());
        
        const htmlContent = paragraphs.map(paragraph => {
            // Replace single newlines with <br> tags
            const paragraphHtml = paragraph.trim().replace(/\n/g, '<br>');
            return `<p style="margin: 0 0 16px 0; line-height: 1.6; color: #374151; white-space: pre-wrap;">${paragraphHtml}</p>`;
        }).join('');
 
        // FIXED: Enhanced HTML template with better formatting support
        const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #ffffff; padding: 32px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); border-top: 5px solid #4f46e5;">
            <h2 style="color: #111827; margin-top: 0; margin-bottom: 24px; font-size: 24px; font-weight: 600;">${subject}</h2>
            <div style="border-left: 4px solid #4f46e5; margin: 20px 0; padding-left: 20px;">
                ${htmlContent}
            </div>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
            <div style="text-align: center; color: #6b7280; font-size: 14px;">
                <p style="margin: 0;">&copy; ${new Date().getFullYear()} EduSure Platform. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>
        `.trim();
 
        // FIXED: Plain text version with proper line breaks preserved
        const plainTextVersion = `
${subject}
${'='.repeat(subject.length)}
 
${formattedContent}
 
---
© ${new Date().getFullYear()} EduSure Platform. All rights reserved.
        `.trim();
 
        let sentCount = 0;
        let failedCount = 0;
 
        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i];
 
            // Real sending — send to each recipient in the batch
            for (const recipientEmail of batch) {
                try {
                    await transporter.sendMail({
                        from: fromAddress,
                        to: recipientEmail,
                        subject: subject,
                        text: plainTextVersion,
                        html: htmlTemplate
                    });
                    console.log(`[SMTP] ✓ Delivered to: ${recipientEmail}`);
                    sentCount++;
                } catch (mailError) {
                    console.error(`[SMTP] ✗ Failed for ${recipientEmail}:`, mailError.message);
                    console.error(`[SMTP]   Code: ${mailError.responseCode || 'N/A'} | Response: ${mailError.response || 'N/A'}`);
                    if (mailError.responseCode >= 500) {
                        console.error('[SMTP]   → Gmail SMTP error. Make sure you are using an App Password (not your real password) and have 2FA enabled.');
                        console.error('[SMTP]   → Fix: https://myaccount.google.com/apppasswords');
                    }
                    failedCount++;
                }
            }
 
            // 1-second delay between batches to respect rate limits
            if (i < batches.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
 
        // Update campaign status after sending
        const { error: updateError } = await supabase
            .from('email_campaigns')
            .update({
                status: 'sent',
                sent_at: new Date().toISOString(),
                sent_count: sentCount,
                failed_count: failedCount
            })
            .eq('id', campaignId);
 
        if (updateError) {
            console.error('Error updating campaign status:', updateError);
        }
 
        res.status(200).json({
            success: true,
            message: `Bulk email sent successfully to ${sentCount} recipients`,
            data: {
                campaignId,
                totalRecipients: recipients.length,
                sentCount,
                failedCount
            }
        });
 
    } catch (error) {
        console.error('Bulk email error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send bulk email',
            error: error.message
        });
    }
};
 
// @desc    Get email campaigns
// @route   GET /api/admin/email-campaigns
// @access  Private (Admin only)
exports.getEmailCampaigns = async (req, res) => {
    try {
        // Verify admin authorization
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: Admin access required'
            });
        }
 
        const token = authHeader.split(' ')[1];
        const { data: { user }, error: campaignsAuthError } = await supabase.auth.getUser(token);
        
        if (campaignsAuthError || !user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: Invalid token'
            });
        }
 
        // Check if user has admin role from database
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();
 
        if (userError || !userData || userData.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: Admin access required'
            });
        }
 
        const { data: campaigns, error: campaignsFetchError } = await supabase
            .from('email_campaigns')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);
 
        if (campaignsFetchError) {
            throw campaignsFetchError;
        }
 
        res.status(200).json({
            success: true,
            data: campaigns || []
        });
 
    } catch (error) {
        console.error('Get email campaigns error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
 
// @desc    Get email analytics
// @route   GET /api/admin/email-analytics
// @access  Private (Admin only)
exports.getEmailAnalytics = async (req, res) => {
    try {
        // Verify admin authorization
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: Admin access required'
            });
        }
 
        const token = authHeader.split(' ')[1];
        const { data: { user }, error: analyticsAuthError } = await supabase.auth.getUser(token);
        
        if (analyticsAuthError || !user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: Invalid token'
            });
        }
 
        // Check if user has admin role from database
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();
 
        if (userError || !userData || userData.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: Admin access required'
            });
        }
 
        // Get campaign statistics
        const { data: campaigns, error: analyticsFetchError } = await supabase
            .from('email_campaigns')
            .select('status, recipient_count, sent_count, failed_count, sent_at');
 
        if (analyticsFetchError) {
            throw analyticsFetchError;
        }
 
        const totalCampaigns = campaigns.length;
        const successfulCampaigns = campaigns.filter(c => c.status === 'sent').length;
        const totalRecipients = campaigns.reduce((sum, c) => sum + (c.recipient_count || 0), 0);
        const totalSent = campaigns.reduce((sum, c) => sum + (c.sent_count || 0), 0);
        const totalFailed = campaigns.reduce((sum, c) => sum + (c.failed_count || 0), 0);
 
        res.status(200).json({
            success: true,
            data: {
                totalCampaigns,
                successfulCampaigns,
                totalRecipients,
                totalSent,
                totalFailed,
                averageRecipientsPerCampaign: totalCampaigns > 0 ? Math.round(totalRecipients / totalCampaigns) : 0,
                successRate: totalRecipients > 0 ? Math.round((totalSent / totalRecipients) * 100) : 0
            }
        });
 
    } catch (error) {
        console.error('Get email analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
 
// @desc    Get users list for email targeting
// @route   GET /api/admin/users-list
// @access  Private (Admin only)
exports.getUsersList = async (req, res) => {
    try {
        // Verify admin authorization
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: Admin access required'
            });
        }
 
        const token = authHeader.split(' ')[1];
        const { data: { user }, error: usersAuthError } = await supabase.auth.getUser(token);
        
        if (usersAuthError || !user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: Invalid token'
            });
        }
 
        // Check if user has admin role from database
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();
 
        if (userError || !userData || userData.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: Admin access required'
            });
        }
 
        const { data: users, error: usersFetchError } = await supabase
            .from('users')
            .select('id, email, full_name, role, created_at')
            .order('created_at', { ascending: false });
 
        if (usersFetchError) {
            throw usersFetchError;
        }
 
        const students = users.filter(u => u.role === 'student');
        const admins = users.filter(u => u.role === 'admin');
 
        res.status(200).json({
            success: true,
            data: {
                all: users,
                students,
                admins,
                counts: {
                    total: users.length,
                    students: students.length,
                    admins: admins.length
                }
            }
        });
 
    } catch (error) {
        console.error('Get users list error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};