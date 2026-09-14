const nodemailer = require('nodemailer');
const { supabase } = require('../supabaseClient');
 
// ─── Gmail SMTP Transporter ───────────────────────────────────────────────────
// Uses Nodemailer with Gmail's SMTP relay (~500 free emails/day)
// Configure SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in server/.env
const getSmtpCredentials = () => {
    let user = (process.env.SMTP_USER || process.env.EMAIL_USER || '').trim();
    let pass = (process.env.SMTP_PASS || process.env.EMAIL_PASS || '').trim().replace(/\s+/g, '');
    
    // Auto-resolve stale edusure24 credentials if provided by environment
    if (user === 'edusure24@gmail.com' || pass.startsWith('goj') || !user) {
        user = 'edusure2026@gmail.com';
        pass = 'senzctejkqizuxod';
    }
    return { user, pass };
};

const createTransporter = () => {
    const { user, pass } = getSmtpCredentials();
    const port = parseInt(process.env.SMTP_PORT) || 465;
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: port,
        secure: port === 465, // Port 465 requires secure: true
        auth: {
            user: user,
            pass: pass
        },
        tls: {
            rejectUnauthorized: false
        }
    });
};
 
const isSmtpConfigured = () => {
    const { user, pass } = getSmtpCredentials();
    return !!user && !!pass;
};

// ─── Modern Email Template Generator ──────────────────────────────────────────
const generateEmailTemplate = ({
    subject = '',
    content = '',
    themeColor = '#4f46e5',
    badgeText = 'EduSure Announcement',
    headerStyle = 'gradient',
    ctaText = '',
    ctaUrl = ''
}) => {
    // 1. Sanitize & format content
    const formattedContent = (content || '').trim();
    const escapedContent = formattedContent
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    // Inline Markdown / formatting parser
    const formatInlineMarkdown = (text, primaryColor = '#4f46e5') => {
        if (!text) return '';
        const clean = text
            .replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, '')
            .replace(/\uFFFD/g, '');
        return clean
            // Bold: **text**
            .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 700; color: #0f172a;">$1</strong>')
            // Italic: *text* or _text_
            .replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em style="font-style: italic;">$1</em>')
            .replace(/_(.*?)_/g, '<em style="font-style: italic;">$1</em>')
            // Underline: &lt;u&gt;text&lt;/u&gt;
            .replace(/&lt;u&gt;(.*?)&lt;\/u&gt;/gi, '<span style="text-decoration: underline;">$1</span>')
            // Strikethrough: ~~text~~
            .replace(/~~(.*?)~~/g, '<del style="text-decoration: line-through; color: #94a3b8;">$1</del>')
            // Inline code: `code`
            .replace(/`([^`]+)`/g, '<code style="background-color: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px; color: #0f172a; border: 1px solid #e2e8f0;">$1</code>')
            // Links: [text](url)
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, `<a href="$2" target="_blank" style="color: ${primaryColor}; text-decoration: underline; font-weight: 600;">$1</a>`);
    };

    // Parse paragraphs and special blocks (headings, dividers, callouts, lists)
    const blocks = escapedContent.split(/\n\s*\n/).filter(p => p.trim());
    
    const htmlBody = blocks.map(block => {
        const trimmed = block.trim();
        
        // Headings: ### or ## or #
        if (trimmed.startsWith('### ') || trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
            const headingText = trimmed.replace(/^#+\s*/, '');
            return `<h3 style="color: #0f172a; font-size: 18px; font-weight: 700; margin: 24px 0 10px 0; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px;">${formatInlineMarkdown(headingText, themeColor)}</h3>`;
        }

        // Horizontal Rule: --- or ***
        if (trimmed === '---' || trimmed === '***') {
            return `<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />`;
        }

        // Warning Alert Box: ⚠️ or [WARNING]
        if (trimmed.startsWith('⚠️') || trimmed.startsWith('\u26A0') || trimmed.toUpperCase().startsWith('[WARNING]')) {
            const text = trimmed.replace(/^(?:⚠️|\u26A0\uFE0F?|\[WARNING\])\s*/iu, '').replace(/\n/g, '<br>');
            return `
            <div style="margin: 20px 0; padding: 16px 20px; background-color: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; color: #92400e; font-size: 14px; line-height: 1.6;">
                <p style="margin: 0; font-weight: 600;">⚠️ ${formatInlineMarkdown(text, themeColor)}</p>
            </div>`;
        }

        // Achievement / Reward: 🏆 or 🎉
        if (trimmed.startsWith('🏆') || trimmed.startsWith('🎉') || trimmed.toUpperCase().startsWith('[REWARD]')) {
            const text = trimmed.replace(/^(?:🏆|🎉|\[REWARD\])\s*/iu, '').replace(/\n/g, '<br>');
            return `
            <div style="margin: 20px 0; padding: 16px 20px; background-color: #f5f3ff; border-left: 4px solid #8b5cf6; border-radius: 8px; color: #5b21b6; font-size: 14px; line-height: 1.6;">
                <p style="margin: 0; font-weight: 600;">🎉 ${formatInlineMarkdown(text, themeColor)}</p>
            </div>`;
        }

        // Important Note: 📌 or [NOTE]
        if (trimmed.startsWith('📌') || trimmed.toUpperCase().startsWith('[NOTE]')) {
            const text = trimmed.replace(/^(?:📌|\[NOTE\])\s*/iu, '').replace(/\n/g, '<br>');
            return `
            <div style="margin: 20px 0; padding: 16px 20px; background-color: #f0f9ff; border-left: 4px solid #0284c7; border-radius: 8px; color: #0369a1; font-size: 14px; line-height: 1.6;">
                <p style="margin: 0; font-weight: 600;">📌 ${formatInlineMarkdown(text, themeColor)}</p>
            </div>`;
        }

        // Support Help: ❓ or [HELP]
        if (trimmed.startsWith('❓') || trimmed.toUpperCase().startsWith('[HELP]')) {
            const text = trimmed.replace(/^(?:❓|\[HELP\])\s*/iu, '').replace(/\n/g, '<br>');
            return `
            <div style="margin: 20px 0; padding: 16px 20px; background-color: #f8fafc; border-left: 4px solid #64748b; border-radius: 8px; color: #334155; font-size: 14px; line-height: 1.6;">
                <p style="margin: 0;">❓ ${formatInlineMarkdown(text, themeColor)}</p>
            </div>`;
        }

        // Quote / Tip: starts with > or 💡
        if (trimmed.startsWith('&gt;') || trimmed.startsWith('💡') || trimmed.toUpperCase().startsWith('[TIP]')) {
            const calloutText = trimmed.replace(/^(?:&gt;|💡|\[TIP\])\s*/iu, '').replace(/\n/g, '<br>');
            return `
            <div style="margin: 20px 0; padding: 16px 20px; background-color: #f8fafc; border-left: 4px solid ${themeColor}; border-radius: 8px; color: #334155; font-size: 14.5px; line-height: 1.6;">
                <p style="margin: 0;">💡 ${formatInlineMarkdown(calloutText, themeColor)}</p>
            </div>`;
        }

        // Numbered List: 1. 2.
        if (/^\d+\.\s/.test(trimmed)) {
            const listItems = trimmed.split('\n').map(line => {
                const clean = line.replace(/^\d+\.\s*/, '').trim();
                return clean ? `<li style="margin-bottom: 8px; line-height: 1.6; color: #374151;">${formatInlineMarkdown(clean, themeColor)}</li>` : '';
            }).join('');
            return `<ol style="margin: 16px 0; padding-left: 24px; color: #374151;">${listItems}</ol>`;
        }

        // Unordered list / bullet items: - or • or * or ✓
        if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ') || trimmed.startsWith('✓ ')) {
            const listItems = trimmed.split('\n').map(line => {
                const clean = line.replace(/^(?:[-•*✓])\s*/u, '').trim();
                return clean ? `<li style="margin-bottom: 8px; line-height: 1.6; color: #374151;"><span style="color: ${themeColor}; font-weight: bold; margin-right: 6px;">✓</span>${formatInlineMarkdown(clean, themeColor)}</li>` : '';
            }).join('');
            return `<ul style="margin: 16px 0; padding-left: 10px; list-style: none; color: #374151;">${listItems}</ul>`;
        }

        // Standard paragraph
        const paragraphHtml = trimmed.replace(/\n/g, '<br>');
        return `<p style="margin: 0 0 16px 0; line-height: 1.7; color: #374151; font-size: 15px;">${formatInlineMarkdown(paragraphHtml, themeColor)}</p>`;
    }).join('');

    // CTA Button block if specified
    const ctaButtonHtml = (ctaText && ctaUrl) ? `
    <div style="margin: 32px 0 24px 0; text-align: center;">
        <!--[if mso]>
        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${ctaUrl}" style="height:48px;v-text-anchor:middle;width:240px;" arcsize="18%" stroke="f" fillcolor="${themeColor}">
        <w:anchorlock/>
        <center style="color:#ffffff;font-family:sans-serif;font-size:16px;font-weight:bold;">${ctaText}</center>
        </v:roundrect>
        <![endif]-->
        <!--[if !mso]><!-->
        <a href="${ctaUrl}" target="_blank" style="background-color: ${themeColor}; border-radius: 8px; color: #ffffff; display: inline-block; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; font-weight: 600; line-height: 48px; text-align: center; text-decoration: none; width: auto; min-width: 200px; padding: 0 32px; -webkit-text-size-adjust: none; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);">
            ${ctaText} &rarr;
        </a>
        <!--<![endif]-->
    </div>
    ` : '';

    // Header styling variants
    let headerHtml = '';
    if (headerStyle === 'dark') {
        headerHtml = `
        <div style="background-color: #0f172a; padding: 36px 32px; text-align: center; border-top-left-radius: 16px; border-top-right-radius: 16px;">
            <div style="display: inline-block; margin-bottom: 12px;">
                <span style="background-color: rgba(255, 255, 255, 0.12); color: #e2e8f0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; padding: 4px 14px; border-radius: 9999px; border: 1px solid rgba(255, 255, 255, 0.15);">
                    ${badgeText}
                </span>
            </div>
            <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">EduSure</h1>
            <p style="color: #94a3b8; font-size: 13px; margin: 6px 0 0 0;">Next-Gen Student Learning Platform</p>
        </div>
        `;
    } else if (headerStyle === 'minimal') {
        headerHtml = `
        <div style="background-color: #ffffff; padding: 32px 32px 20px 32px; border-bottom: 2px solid #f1f5f9; border-top-left-radius: 16px; border-top-right-radius: 16px; text-align: left;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                    <td>
                        <h1 style="color: #0f172a; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">EduSure</h1>
                        <p style="color: #64748b; font-size: 12px; margin: 2px 0 0 0;">Official Communication</p>
                    </td>
                    <td align="right">
                        <span style="background-color: ${themeColor}15; color: ${themeColor}; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 9999px; border: 1px solid ${themeColor}30;">
                            ${badgeText}
                        </span>
                    </td>
                </tr>
            </table>
        </div>
        `;
    } else {
        // Vibrant Gradient
        headerHtml = `
        <div style="background: linear-gradient(135deg, ${themeColor} 0%, #1e1b4b 100%); padding: 38px 32px; text-align: center; border-top-left-radius: 16px; border-top-right-radius: 16px;">
            <div style="display: inline-block; margin-bottom: 12px;">
                <span style="background-color: rgba(255, 255, 255, 0.18); color: #ffffff; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; padding: 5px 14px; border-radius: 9999px; border: 1px solid rgba(255, 255, 255, 0.25);">
                    ${badgeText}
                </span>
            </div>
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">EduSure</h1>
            <p style="color: rgba(255, 255, 255, 0.85); font-size: 13px; margin: 6px 0 0 0; font-weight: 400;">Excellence in Learning & Academic Success</p>
        </div>
        `;
    }

    const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <!--[if mso]>
    <style type="text/css">
        body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
    </style>
    <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; padding: 30px 10px;">
        <tr>
            <td align="center">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04); border: 1px solid #e2e8f0;">
                    <!-- Email Header -->
                    <tr>
                        <td>
                            ${headerHtml}
                        </td>
                    </tr>
                    
                    <!-- Subject Bar -->
                    <tr>
                        <td style="padding: 28px 36px 12px 36px;">
                            <h2 style="color: #0f172a; margin: 0; font-size: 22px; font-weight: 700; line-height: 1.35; letter-spacing: -0.3px;">
                                ${subject}
                            </h2>
                        </td>
                    </tr>

                    <!-- Email Body -->
                    <tr>
                        <td style="padding: 12px 36px 28px 36px;">
                            ${htmlBody}
                            ${ctaButtonHtml}
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8fafc; padding: 28px 36px; border-top: 1px solid #edf2f7; text-align: center; border-bottom-left-radius: 16px; border-bottom-right-radius: 16px;">
                            <p style="margin: 0 0 10px 0; font-size: 13px; font-weight: 600; color: #475569;">
                                EduSure Learning & Examination Platform
                            </p>
                            <p style="margin: 0 0 16px 0; font-size: 12px; color: #94a3b8; line-height: 1.5;">
                                This email was sent to you as a registered member of the EduSure platform. Please do not reply directly to this automated email.
                            </p>
                            <div style="margin: 16px 0 12px 0;">
                                <span style="display: inline-block; width: 40px; height: 2px; background-color: #e2e8f0;"></span>
                            </div>
                            <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                                &copy; ${new Date().getFullYear()} EduSure. All rights reserved. &bull; Empowering Future Leaders
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();

    const plainTextVersion = `
[${badgeText.toUpperCase()}]
${subject}
${'='.repeat(Math.max(subject.length, 20))}

${formattedContent}

${ctaText && ctaUrl ? `\n>>> ${ctaText}: ${ctaUrl}\n` : ''}
---
© ${new Date().getFullYear()} EduSure Platform. All rights reserved.
    `.trim();

    return { htmlTemplate, plainTextVersion };
};

// @desc    Send bulk email to users
// @route   POST /api/admin/bulk-email
// @access  Private (Admin only)
exports.sendBulkEmail = async (req, res) => {
    try {
        const { campaignId, recipients, subject, content, themeColor, badgeText, headerStyle, ctaText, ctaUrl } = req.body;
 
        if (!campaignId || !Array.isArray(recipients) || recipients.length === 0 || !subject || !content) {
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
        const { data, error: authError } = await supabase.auth.getUser(token);
        const user = data?.user;
        
        if (authError || !user) {
            console.error('[AUTH ERROR] Bulk email verification failed:', authError?.message || authError || 'No user found');
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
 
        const { user: smtpUser } = getSmtpCredentials();
        const transporter = createTransporter();
        const fromAddress = (process.env.EMAIL_FROM && !process.env.EMAIL_FROM.includes('edusure24'))
            ? process.env.EMAIL_FROM
            : `EduSure <${smtpUser}>`;
 
        // Verify SMTP connection before sending
        try {
            await transporter.verify();
        } catch (verifyError) {
            console.error('[SMTP] Connection FAILED:', verifyError.message);
            const isAuthError = verifyError.message.includes('534') || verifyError.message.includes('Invalid login') || verifyError.message.includes('WebLoginRequired');
            const helpfulMsg = isAuthError
                ? `Gmail SMTP authentication failed (534-5.7.9). The 16-character Google App Password for ${smtpUser} in SMTP_PASS is invalid or expired. To fix: update SMTP_USER and SMTP_PASS in Vercel Project Settings (Environment Variables) and Redeploy, or update server/.env if running locally.`
                : `SMTP connection failed: ${verifyError.message}. Check SMTP_USER/SMTP_PASS in environment variables`;
            
            // Mark campaign as failed in Supabase so it does NOT stay as 'sending'
            if (campaignId) {
                try {
                    await supabase
                        .from('email_campaigns')
                        .update({
                            status: 'failed',
                            sent_count: 0,
                            failed_count: recipients.length,
                            updated_at: new Date().toISOString(),
                            content: `${content}\n\n--- FAILURE REASON ---\n${helpfulMsg}`
                        })
                        .eq('id', campaignId);
                } catch (dbErr) {
                    console.error('Failed to update campaign status on SMTP failure:', dbErr);
                }
            }

            return res.status(500).json({
                success: false,
                message: helpfulMsg
            });
        }
 
        // Gmail allows up to ~500/day on free tier — send in batches of 10
        // with a short gap to respect rate limits while staying within serverless timeout
        const batchSize = 10;
        const batches = [];
 
        for (let i = 0; i < recipients.length; i += batchSize) {
            batches.push(recipients.slice(i, i + batchSize));
        }
        const { htmlTemplate, plainTextVersion } = generateEmailTemplate({
            subject,
            content,
            themeColor: themeColor || '#4f46e5',
            badgeText: badgeText || 'EduSure Announcement',
            headerStyle: headerStyle || 'gradient',
            ctaText: ctaText || '',
            ctaUrl: ctaUrl || ''
        });
 
        let sentCount = 0;
        let failedCount = 0;
 
        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i];
 
            // Send all emails in the batch in parallel for speed
            const results = await Promise.allSettled(
                batch.map(recipientEmail =>
                    transporter.sendMail({
                        from: fromAddress,
                        to: recipientEmail,
                        subject: subject,
                        text: plainTextVersion,
                        html: htmlTemplate
                    }).then(() => {
                        console.log(`[SMTP] ✓ Delivered to: ${recipientEmail}`);
                        return { success: true, email: recipientEmail };
                    }).catch(mailError => {
                        console.error(`[SMTP] ✗ Failed for ${recipientEmail}:`, mailError.message);
                        return { success: false, email: recipientEmail, error: mailError.message };
                    })
                )
            );
 
            // Count successes and failures
            for (const result of results) {
                if (result.status === 'fulfilled' && result.value.success) {
                    sentCount++;
                } else {
                    failedCount++;
                }
            }
 
            // Short delay between batches to respect Gmail rate limits
            if (i < batches.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        }
 
        // Accurate status: failed if 0 sent, partial if some failed, sent if all succeeded
        const finalStatus = sentCount === 0 ? 'failed' : (failedCount > 0 ? 'partial' : 'sent');
        let finalContent = content;
        if (failedCount > 0) {
            finalContent = `${content}\n\n--- FAILURE REASON ---\nDelivered: ${sentCount}/${recipients.length}. Failed: ${failedCount}. Check recipient email addresses or SMTP relay limits.`;
        }

        // Update campaign status after sending
        const { error: updateError } = await supabase
            .from('email_campaigns')
            .update({
                status: finalStatus,
                sent_at: new Date().toISOString(),
                sent_count: sentCount,
                failed_count: failedCount,
                updated_at: new Date().toISOString(),
                content: finalContent
            })
            .eq('id', campaignId);
 
        if (updateError) {
            console.error('Error updating campaign status:', updateError);
        }
 
        res.status(200).json({
            success: sentCount > 0,
            message: sentCount === 0 
                ? `All ${failedCount} recipient emails failed to deliver.` 
                : `Bulk email sent successfully to ${sentCount} recipients (${failedCount} failed)`,
            data: {
                campaignId,
                status: finalStatus,
                totalRecipients: recipients.length,
                sentCount,
                failedCount
            }
        });
 
    } catch (error) {
        console.error('Bulk email error:', error);
        if (req.body?.campaignId) {
            try {
                await supabase
                    .from('email_campaigns')
                    .update({
                        status: 'failed',
                        sent_count: 0,
                        failed_count: req.body.recipients?.length || 0,
                        updated_at: new Date().toISOString(),
                        content: `${req.body.content || ''}\n\n--- FAILURE REASON ---\n${error.message || 'Server error occurred during dispatch'}`
                    })
                    .eq('id', req.body.campaignId);
            } catch (dbErr) {
                console.error('Failed to update campaign status on outer error:', dbErr);
            }
        }
        res.status(500).json({
            success: false,
            message: 'Failed to send bulk email',
            error: error.message
        });
    }
};

// @desc    Send test email to admin
// @route   POST /api/admin/send-test-email
// @access  Private (Admin only)
exports.sendTestEmail = async (req, res) => {
    try {
        const { testEmail, subject, content, themeColor, badgeText, headerStyle, ctaText, ctaUrl } = req.body;

        if (!testEmail || !subject || !content) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: testEmail, subject, content'
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
        const { data, error: authError } = await supabase.auth.getUser(token);
        const user = data?.user;
        
        if (authError || !user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: Invalid token'
            });
        }

        // Check if user has admin role
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

        if (!isSmtpConfigured()) {
            return res.status(500).json({
                success: false,
                message: 'SMTP credentials not configured on the server.'
            });
        }

        const { user: smtpUser } = getSmtpCredentials();
        const transporter = createTransporter();
        const fromAddress = (process.env.EMAIL_FROM && !process.env.EMAIL_FROM.includes('edusure24'))
            ? process.env.EMAIL_FROM
            : `EduSure <${smtpUser}>`;

        const { htmlTemplate, plainTextVersion } = generateEmailTemplate({
            subject: `[TEST] ${subject}`,
            content,
            themeColor: themeColor || '#4f46e5',
            badgeText: badgeText ? `TEST • ${badgeText}` : 'TEST PREVIEW',
            headerStyle: headerStyle || 'gradient',
            ctaText: ctaText || '',
            ctaUrl: ctaUrl || ''
        });

        await transporter.sendMail({
            from: fromAddress,
            to: testEmail,
            subject: `[TEST PREVIEW] ${subject}`,
            text: plainTextVersion,
            html: htmlTemplate
        });

        res.status(200).json({
            success: true,
            message: `Test email sent successfully to ${testEmail}`
        });
    } catch (error) {
        console.error('Send test email error:', error);
        const isAuthError = (error.message || '').includes('534') || (error.message || '').includes('Invalid login') || (error.message || '').includes('WebLoginRequired');
        const helpfulMsg = isAuthError
            ? `Gmail SMTP authentication failed (534-5.7.9). The 16-character Google App Password in SMTP_PASS is invalid or expired. To fix: update SMTP_USER and SMTP_PASS in Vercel Project Settings (Environment Variables) and Redeploy, or update server/.env if running locally.`
            : (error.message || 'Failed to send test email');
        res.status(500).json({
            success: false,
            message: helpfulMsg
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
        const { data, error: campaignsAuthError } = await supabase.auth.getUser(token);
        const user = data?.user;
        
        if (campaignsAuthError || !user) {
            console.error('[AUTH ERROR] Campaigns fetch verification failed:', campaignsAuthError?.message || campaignsAuthError || 'No user found');
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
        const { data, error: analyticsAuthError } = await supabase.auth.getUser(token);
        const user = data?.user;
        
        if (analyticsAuthError || !user) {
            console.error('[AUTH ERROR] Analytics fetch verification failed:', analyticsAuthError?.message || analyticsAuthError || 'No user found');
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
        const { data, error: usersAuthError } = await supabase.auth.getUser(token);
        const user = data?.user;
        
        if (usersAuthError || !user) {
            console.error('[AUTH ERROR] Users list fetch verification failed:', usersAuthError?.message || usersAuthError || 'No user found');
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
