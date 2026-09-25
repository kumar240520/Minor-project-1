import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Mail, Send, Users, Calendar, FileText, BarChart3, Plus, Edit2, Trash2, Eye, 
    Clock, CheckCircle, AlertCircle, Loader2, Sparkles, Smartphone, Monitor, 
    Palette, MousePointer, Copy, Check, ExternalLink, RefreshCw, X, Search, 
    ShieldCheck, GraduationCap, ChevronRight, Inbox, ArrowRight, Sun, Moon,
    BookOpen, Bold, Italic, Underline, Strikethrough, Heading1, Heading2, Heading3,
    Quote, Code, Link as LinkIcon, List, ListOrdered, Minus, Award, AlertTriangle,
    Info, HelpCircle, Gift, CheckSquare, CornerDownLeft
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '../../supabaseClient';
import ResponsiveAdminSidebar from '../../components/admin/ResponsiveAdminSidebar';
import ResponsiveAdminHeader from '../../components/admin/ResponsiveAdminHeader';

// ─── Theme Palettes ──────────────────────────────────────────────────────────
const THEME_PALETTES = [
    { id: 'indigo', name: 'Royal Indigo', color: '#4f46e5', secondary: '#7c3aed', gradient: 'from-indigo-600 to-purple-600', chip: 'bg-indigo-600' },
    { id: 'emerald', name: 'Emerald Growth', color: '#059669', secondary: '#10b981', gradient: 'from-emerald-600 to-teal-600', chip: 'bg-emerald-600' },
    { id: 'amber', name: 'Sunset Amber', color: '#ea580c', secondary: '#f59e0b', gradient: 'from-orange-600 to-amber-500', chip: 'bg-orange-600' },
    { id: 'cyan', name: 'Ocean Cyan', color: '#0284c7', secondary: '#06b6d4', gradient: 'from-sky-600 to-cyan-600', chip: 'bg-sky-600' },
    { id: 'rose', name: 'Rose Luxury', color: '#e11d48', secondary: '#f43f5e', gradient: 'from-rose-600 to-pink-600', chip: 'bg-rose-600' },
    { id: 'slate', name: 'Obsidian Slate', color: '#1e293b', secondary: '#334155', gradient: 'from-slate-900 to-slate-700', chip: 'bg-slate-900' },
];

// ─── Header Style Presets ────────────────────────────────────────────────────
const HEADER_STYLES = [
    { id: 'gradient', name: 'Vibrant Gradient', desc: 'Eye-catching branded banner with subtle gradient' },
    { id: 'dark', name: 'Sleek Dark Modern', desc: 'Executive luxury contrast with crisp typography' },
    { id: 'minimal', name: 'Clean Minimalist', desc: 'Refined white card with accent tag badge' },
];

// ─── Badge Options ───────────────────────────────────────────────────────────
const BADGE_PRESETS = [
    'Official Announcement',
    'Feature Update',
    'Academic Alert',
    'Event & Workshop',
    'Weekly Digest',
    'System Notice'
];

// ─── Designer Preset Templates ────────────────────────────────────────────────
const PRESET_TEMPLATES = [
    {
        id: 'welcome_onboarding',
        name: 'Welcome to EduSure',
        category: 'Onboarding',
        subject: 'Welcome to EduSure — Your Learning Journey Starts Here! 🎓',
        themeColor: '#4f46e5',
        badgeText: 'Official Welcome',
        headerStyle: 'gradient',
        ctaText: 'Access Student Portal',
        ctaUrl: 'https://edusure.vercel.app/dashboard',
        content: `Hi {name},

Welcome to the **EduSure Platform**! We are thrilled to have you as part of our academic community.

EduSure is designed to provide you with seamless access to high-quality *study materials*, *exam prep resources*, *verified notes*, and *academic updates*.

💡 **Pro Tip:** Complete your profile and explore the materials repository to get started with **100 free learning credits**!

### What You Can Do Right Now:
✓ Browse approved course notes and past examination papers
✓ Bookmark high-yield topics for your upcoming semesters
✓ Connect with student peers and share curated notes

---

❓ Need help or have questions? Contact our student support desk at [support@edusure.com](mailto:support@edusure.com).

Best regards,
The EduSure Academic Team`
    },
    {
        id: 'platform_update',
        name: 'Platform Feature Announcement',
        category: 'Announcement',
        subject: 'Exciting News: Discover New Interactive Tools on EduSure 🚀',
        themeColor: '#059669',
        badgeText: 'Feature Update',
        headerStyle: 'gradient',
        ctaText: 'Explore New Features',
        ctaUrl: 'https://edusure.vercel.app/materials',
        content: `Hi {name},

We have been working hard behind the scenes to make your learning experience **faster**, **smoother**, and more rewarding!

### 🚀 What's New in Version 2.4:
✓ **Ultra-Fast Material Search** with instant filters by subject and branch
✓ **Clean Interactive PDF Previews** with dark and light reading modes
✓ **Seamless Credit Rewards** whenever your uploaded materials get approved
✓ **Enhanced Mobile Experience** optimized for studying on the go

💡 These features are live today for all students and faculty members worldwide.

Check out the updated platform and let us know what you think!

Warm regards,
EduSure Product & Engineering Team`
    },
    {
        id: 'exam_alert',
        name: 'Exam Schedule & Notes Alert',
        category: 'Academic Alert',
        subject: 'Important: Semester Examination Timetable & Verified Notes 📚',
        themeColor: '#ea580c',
        badgeText: 'Academic Alert',
        headerStyle: 'minimal',
        ctaText: 'View Exam Resources',
        ctaUrl: 'https://edusure.vercel.app/materials?category=exam-prep',
        content: `Hi {name},

As mid-term and semester examinations approach, we want to ensure you have all the essential resources to prepare effectively.

Our academic community has recently contributed over **200+ verified notes** and solved past papers specifically curated for the current syllabus.

⚠️ **Urgent Exam Checklist:**
1. Download official subject syllabus and question banks
2. Save offline revision sheets before the preparation leave
3. Double-check your examination hall ticket registration

📌 **Note:** Library study rooms and collaborative virtual lounges will remain open 24/7 during exam weeks.

Wishing you the very best in your examinations!

Best of luck,
EduSure Examination Cell`
    },
    {
        id: 'maintenance_notice',
        name: 'System Maintenance Notice',
        category: 'System Notice',
        subject: 'Scheduled System Maintenance: Service Availability Notice ⚙️',
        themeColor: '#1e293b',
        badgeText: 'System Notice',
        headerStyle: 'dark',
        ctaText: 'Check System Status',
        ctaUrl: 'https://edusure.vercel.app',
        content: `Dear Member,

Please be advised that EduSure will be performing scheduled infrastructure maintenance and database performance optimizations.

### ⚙️ Maintenance Schedule:
- **Date:** Sunday, Upcoming Weekend
- **Duration:** 02:00 AM – 05:00 AM UTC *(approx. 3 hours)*
- **Expected Impact:** Brief intermittent access during serverless upgrades

⚠️ **What this means for you:**
During this brief window, file downloads and login sessions may be temporarily paused. Normal service will resume immediately following completion.

We apologize for any inconvenience caused and thank you for your patience as we make EduSure faster and more resilient.

Sincerely,
EduSure Technical Operations`
    },
    {
        id: 'weekly_digest',
        name: 'Weekly Community Spotlight',
        category: 'Newsletter',
        subject: 'EduSure Weekly Digest: Top Uploads, Discussions & Trends 🌟',
        themeColor: '#0284c7',
        badgeText: 'Weekly Digest',
        headerStyle: 'gradient',
        ctaText: 'Explore Community Feed',
        ctaUrl: 'https://edusure.vercel.app',
        content: `Hi {name},

Here is your weekly recap of what happened in the EduSure student community this week:

### 🌟 Weekly Highlights:
✓ Over **1,500 students** accessed revision materials this week
✓ **45 new peer-reviewed study packages** were published
✓ Top contributor badge awarded to active community moderators

🎉 **Bonus Challenge:** Upload your lecture notes this week to earn **double platform coins**!

> "Sharing knowledge is the most effective way to master any subject."

Have a productive week ahead!

Warmly,
The EduSure Community Team`
    }
];

const AdminBulkEmail = () => {
    const [activeTab, setActiveTab] = useState('compose');
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    
    // Core Email Compose State
    const [emailData, setEmailData] = useState({
        subject: '',
        content: '',
        template: '',
        themeColor: '#4f46e5',
        badgeText: 'Official Announcement',
        headerStyle: 'gradient',
        hasCta: true,
        ctaText: 'Access Student Portal',
        ctaUrl: 'https://edusure.vercel.app'
    });

    // Custom templates & history
    const [templates, setTemplates] = useState([]);
    const [emailHistory, setEmailHistory] = useState([]);
    
    // Audience Targeting
    const [targetAudience, setTargetAudience] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [displayedUsers, setDisplayedUsers] = useState([]);
    
    // Sending & Progress
    const [isSending, setIsSending] = useState(false);
    const [sendProgress, setSendProgress] = useState(0);
    const [sendingStepText, setSendingStepText] = useState('');

    // Preview Controls
    const [previewDevice, setPreviewDevice] = useState('desktop'); // 'desktop' | 'mobile'
    const [previewDarkMode, setPreviewDarkMode] = useState(false);
    
    // Modals
    const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
    const [saveTemplateForm, setSaveTemplateForm] = useState({ name: '', category: 'General' });
    const [showTestEmailModal, setShowTestEmailModal] = useState(false);
    const [testEmailAddress, setTestEmailAddress] = useState('');
    const [isSendingTest, setIsSendingTest] = useState(false);
    const [testEmailSuccess, setTestEmailSuccess] = useState('');
    
    // Link Insert Modal
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [linkFormData, setLinkFormData] = useState({ text: '', url: 'https://' });

    // History View Modal
    const [viewingCampaign, setViewingCampaign] = useState(null);

    // Current Admin User
    const [adminUser, setAdminUser] = useState(null);

    const textareaRef = useRef(null);

    const getApiBase = () => {
        if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            return '';
        }
        const configuredBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '';
        if (configuredBase && !configuredBase.includes('your-backend-server') && !configuredBase.includes('your-server-url')) {
            return configuredBase.replace(/\/api\/?$/, '').replace(/\/$/, '');
        }
        return 'http://localhost:5000';
    };

    // Resilient API caller that attempts configuredBase, Vite proxy relative path, and direct localhost:5000
    const callAdminApi = async (endpoint, options = {}) => {
        const configuredBase = getApiBase();
        const candidates = [];
        
        if (configuredBase) {
            candidates.push(`${configuredBase}${endpoint}`);
        }
        // Relative path (forwarded via Vite proxy or Vercel serverless)
        candidates.push(endpoint);
        // Direct localhost:5000 fallback for local environment
        candidates.push(`http://localhost:5000${endpoint}`);

        const uniqueUrls = Array.from(new Set(candidates));

        let lastErr = null;
        for (const url of uniqueUrls) {
            try {
                const res = await fetch(url, options);
                return res;
            } catch (err) {
                lastErr = err;
                if (err.name === 'AbortError') throw err;
            }
        }

        throw new Error(
            `Cannot connect to backend server. Please make sure the backend is running on port 5000 (run 'npm run server' in a terminal). Details: ${lastErr?.message || 'Failed to fetch'}`
        );
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const { data: authData } = await supabase.auth.getUser();
            if (authData?.user) {
                setAdminUser(authData.user);
                setTestEmailAddress(authData.user.email || '');
            }
            await Promise.all([
                fetchUsers(),
                fetchTemplates(),
                fetchEmailHistory()
            ]);
        } catch (err) {
            console.error('Error initializing bulk email data:', err);
        }
    };

    const fetchUsers = async () => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('id, email, full_name, role, created_at')
                .order('created_at', { ascending: false });

            if (error) throw error;
            const fetched = data || [];
            setUsers(fetched);
            // Default audience 'all' selects all user IDs
            setSelectedUsers(fetched.map(u => u.id));
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchTemplates = async () => {
        try {
            const { data, error } = await supabase
                .from('email_templates')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTemplates(data || []);
        } catch (error) {
            console.error('Error fetching templates:', error);
        }
    };

    const fetchEmailHistory = async () => {
        try {
            const { data, error } = await supabase
                .from('email_campaigns')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;
            setEmailHistory(data || []);
        } catch (error) {
            console.error('Error fetching email history:', error);
        }
    };

    // Audience filtering
    useEffect(() => {
        let filtered = users;
        if (targetAudience === 'students') {
            filtered = users.filter(u => u.role === 'student');
        } else if (targetAudience === 'admins') {
            filtered = users.filter(u => u.role === 'admin');
        }

        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(u => 
                (u.full_name && u.full_name.toLowerCase().includes(term)) ||
                (u.email && u.email.toLowerCase().includes(term))
            );
        }

        setDisplayedUsers(filtered);
    }, [users, targetAudience, searchTerm]);

    const handleAudienceChange = (audience) => {
        setTargetAudience(audience);
        setSearchTerm('');
        if (audience === 'all') {
            setSelectedUsers(users.map(u => u.id));
        } else if (audience === 'students') {
            setSelectedUsers(users.filter(u => u.role === 'student').map(u => u.id));
        } else if (audience === 'admins') {
            setSelectedUsers(users.filter(u => u.role === 'admin').map(u => u.id));
        } else {
            setSelectedUsers([]);
        }
    };

    // Preset selection
    const handleSelectPreset = (preset) => {
        setEmailData({
            subject: preset.subject,
            content: preset.content,
            template: preset.id,
            themeColor: preset.themeColor || '#4f46e5',
            badgeText: preset.badgeText || 'EduSure Update',
            headerStyle: preset.headerStyle || 'gradient',
            hasCta: Boolean(preset.ctaText),
            ctaText: preset.ctaText || 'Access Portal',
            ctaUrl: preset.ctaUrl || 'https://edusure.vercel.app'
        });
    };

    // Custom saved template selection
    const handleSelectCustomTemplate = (tmpl) => {
        setEmailData(prev => ({
            ...prev,
            subject: tmpl.subject,
            content: tmpl.content,
            template: tmpl.id,
        }));
    };

    // ── Text Formatting Helpers ───────────────────────────────────────────────
    const insertSnippet = (snippet) => {
        const textarea = textareaRef.current;
        if (!textarea) {
            setEmailData(prev => ({ ...prev, content: prev.content + snippet }));
            return;
        }
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const current = emailData.content;
        const updated = current.substring(0, start) + snippet + current.substring(end);
        setEmailData(prev => ({ ...prev, content: updated }));
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + snippet.length, start + snippet.length);
        }, 30);
    };

    const formatSelection = (prefix, suffix = '', defaultText = '') => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const current = emailData.content;
        const selected = current.substring(start, end);
        const textToWrap = selected || defaultText;
        const replacement = prefix + textToWrap + suffix;
        const updated = current.substring(0, start) + replacement + current.substring(end);
        setEmailData(prev => ({ ...prev, content: updated }));
        setTimeout(() => {
            textarea.focus();
            if (selected) {
                textarea.setSelectionRange(start, start + replacement.length);
            } else {
                textarea.setSelectionRange(start + prefix.length, start + prefix.length + defaultText.length);
            }
        }, 30);
    };

    const formatLinePrefix = (prefix, defaultText = '') => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const current = emailData.content;
        const selected = current.substring(start, end);

        let replacement = '';
        if (selected) {
            replacement = selected.split('\n').map(line => prefix + line).join('\n');
        } else {
            replacement = prefix + defaultText;
        }

        const needsLeadingNewline = start > 0 && current[start - 1] !== '\n';
        const finalInsert = (needsLeadingNewline ? '\n' : '') + replacement;
        const updated = current.substring(0, start) + finalInsert + current.substring(end);
        setEmailData(prev => ({ ...prev, content: updated }));
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + finalInsert.length, start + finalInsert.length);
        }, 30);
    };

    const handleTextareaKeyDown = (e) => {
        if (e.ctrlKey || e.metaKey) {
            if (e.key === 'b' || e.key === 'B') {
                e.preventDefault();
                formatSelection('**', '**', 'bold text');
            } else if (e.key === 'i' || e.key === 'I') {
                e.preventDefault();
                formatSelection('*', '*', 'italic text');
            } else if (e.key === 'u' || e.key === 'U') {
                e.preventDefault();
                formatSelection('<u>', '</u>', 'underlined text');
            }
        }
    };

    const openLinkModal = () => {
        const textarea = textareaRef.current;
        let selected = '';
        if (textarea) {
            selected = emailData.content.substring(textarea.selectionStart, textarea.selectionEnd);
        }
        setLinkFormData({
            text: selected || '',
            url: 'https://'
        });
        setShowLinkModal(true);
    };

    const confirmInsertLink = () => {
        if (!linkFormData.url.trim() || linkFormData.url === 'https://') {
            alert('Please enter a valid link destination URL.');
            return;
        }
        const label = linkFormData.text.trim() || 'Click Here';
        const markdownLink = `[${label}](${linkFormData.url.trim()})`;
        insertSnippet(markdownLink);
        setShowLinkModal(false);
    };

    // Save Template
    const confirmSaveTemplate = async () => {
        if (!saveTemplateForm.name.trim() || !emailData.subject.trim() || !emailData.content.trim()) {
            alert('Please provide a template name, subject, and content.');
            return;
        }

        try {
            const { error } = await supabase
                .from('email_templates')
                .insert({
                    name: saveTemplateForm.name.trim(),
                    subject: emailData.subject,
                    content: emailData.content
                });

            if (error) throw error;
            setShowSaveTemplateModal(false);
            setSaveTemplateForm({ name: '', category: 'General' });
            await fetchTemplates();
            alert('Email template saved successfully to your library!');
        } catch (error) {
            console.error('Error saving template:', error);
            alert('Failed to save template: ' + error.message);
        }
    };

    // Delete Template
    const deleteTemplate = async (templateId) => {
        if (!confirm('Are you sure you want to delete this template from your library?')) return;
        try {
            const { error } = await supabase
                .from('email_templates')
                .delete()
                .eq('id', templateId);

            if (error) throw error;
            fetchTemplates();
        } catch (error) {
            console.error('Error deleting template:', error);
            alert('Failed to delete template: ' + error.message);
        }
    };

    // Send Test Email
    const sendTestEmail = async () => {
        if (!testEmailAddress || !emailData.subject || !emailData.content) {
            alert('Please provide a recipient email address, subject, and content.');
            return;
        }

        setIsSendingTest(true);
        setTestEmailSuccess('');

        try {
            const session = await supabase.auth.getSession();
            const token = session.data?.session?.access_token;
            if (!token) throw new Error('No admin auth token found. Please log in again.');

            const res = await callAdminApi('/api/admin/send-test-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    testEmail: testEmailAddress,
                    subject: emailData.subject,
                    content: emailData.content,
                    themeColor: emailData.themeColor,
                    badgeText: emailData.badgeText,
                    headerStyle: emailData.headerStyle,
                    ctaText: emailData.hasCta ? emailData.ctaText : '',
                    ctaUrl: emailData.hasCta ? emailData.ctaUrl : ''
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to send test email');

            setTestEmailSuccess(`✓ Test email delivered to ${testEmailAddress}! Check your inbox.`);
            setTimeout(() => {
                setShowTestEmailModal(false);
                setTestEmailSuccess('');
            }, 3000);
        } catch (err) {
            console.error('Error sending test email:', err);
            if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError') || err.name === 'TypeError') {
                alert(`Cannot connect to backend server:\n\nPlease make sure the backend server is running on port 5000.\nOpen a terminal and run:\n\n  npm run server\n\n(or npm run dev:all to start both frontend & backend together).`);
            } else {
                alert(`Test email failed: ${err.message}`);
            }
        } finally {
            setIsSendingTest(false);
        }
    };

    // ─── Helper: Parse failure reason from campaign content ───────────────────────
    const parseCampaignContent = (rawContent = '') => {
        if (!rawContent) return { body: '', reason: null };
        const marker = '--- FAILURE REASON ---';
        const index = rawContent.indexOf(marker);
        if (index !== -1) {
            return {
                body: rawContent.substring(0, index).trim(),
                reason: rawContent.substring(index + marker.length).trim()
            };
        }
        return { body: rawContent, reason: null };
    };

    // Send Bulk Email
    const sendBulkEmail = async () => {
        if (!emailData.subject.trim() || !emailData.content.trim() || selectedUsers.length === 0) {
            alert('Please provide a subject, message content, and select at least 1 recipient.');
            return;
        }

        if (!confirm(`Are you sure you want to send this bulk email to ${selectedUsers.length} recipients?`)) {
            return;
        }

        setIsSending(true);
        setSendProgress(15);
        setSendingStepText('Preparing email dispatch campaign...');

        let campaign = null;

        try {
            const recipients = users.filter(user => selectedUsers.includes(user.id));
            const allEmails = recipients.map(user => user.email);

            // 1. Create campaign record
            const { data: campaignData, error: campaignError } = await supabase
                .from('email_campaigns')
                .insert({
                    subject: emailData.subject,
                    content: emailData.content,
                    recipient_count: selectedUsers.length,
                    status: 'sending'
                })
                .select()
                .single();

            if (campaignError) throw campaignError;
            campaign = campaignData;

            setSendProgress(35);
            setSendingStepText('Connecting to SMTP mail relay...');

            const session = await supabase.auth.getSession();
            const token = session.data?.session?.access_token;
            if (!token) throw new Error('No authentication token available. Please log in again.');

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 60000);

            setSendProgress(65);
            setSendingStepText(`Delivering formatted emails to ${allEmails.length} recipients...`);

            const response = await callAdminApi('/api/admin/bulk-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    campaignId: campaign.id,
                    recipients: allEmails,
                    subject: emailData.subject,
                    content: emailData.content,
                    themeColor: emailData.themeColor,
                    badgeText: emailData.badgeText,
                    headerStyle: emailData.headerStyle,
                    ctaText: emailData.hasCta ? emailData.ctaText : '',
                    ctaUrl: emailData.hasCta ? emailData.ctaUrl : ''
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            setSendProgress(90);
            setSendingStepText('Finalizing delivery logs...');

            if (!response.ok) {
                let errorData;
                try { errorData = await response.json(); }
                catch { errorData = { message: `Server error (${response.status})` }; }
                
                const failureMsg = errorData.message || `Server returned ${response.status}`;

                // Mark failed in Supabase so it does NOT stay as sending
                if (campaign?.id) {
                    await supabase
                        .from('email_campaigns')
                        .update({
                            status: 'failed',
                            sent_count: 0,
                            failed_count: allEmails.length,
                            updated_at: new Date().toISOString(),
                            content: `${emailData.content}\n\n--- FAILURE REASON ---\n${failureMsg}`
                        })
                        .eq('id', campaign.id);
                }
                throw new Error(failureMsg);
            }

            const responseData = await response.json();
            setSendProgress(100);

            const sentCount = responseData.data?.sentCount ?? allEmails.length;
            const failedCount = responseData.data?.failedCount ?? 0;
            const finalStatus = responseData.data?.status || (sentCount === 0 ? 'failed' : (failedCount > 0 ? 'partial' : 'sent'));

            setSendingStepText(sentCount === 0 ? 'Delivery failed' : 'Campaign completed successfully!');

            // Ensure campaign status matches reality
            await supabase
                .from('email_campaigns')
                .update({ 
                    status: finalStatus, 
                    sent_at: new Date().toISOString(),
                    sent_count: sentCount,
                    failed_count: failedCount
                })
                .eq('id', campaign.id);

            setTimeout(() => {
                setIsSending(false);
                setSendProgress(0);
                if (sentCount === 0) {
                    alert(`Email delivery failed for all ${failedCount} recipient(s).\n\nReason: Check the Campaign History tab for failure details.`);
                } else if (failedCount > 0) {
                    alert(`Campaign finished with partial delivery:\n\nDelivered: ${sentCount}\nFailed: ${failedCount}`);
                } else {
                    alert(`Campaign finished!\n\nDelivered: ${sentCount}\nFailed: ${failedCount}`);
                }
                fetchEmailHistory();
            }, 600);

        } catch (error) {
            console.error('Error sending bulk email:', error);
            setIsSending(false);
            setSendProgress(0);

            // Ensure campaign record in Supabase is marked 'failed' so it NEVER stays 'sending'
            if (campaign?.id) {
                try {
                    const failReason = error.message || 'Unknown network or dispatch failure';
                    await supabase
                        .from('email_campaigns')
                        .update({
                            status: 'failed',
                            sent_count: 0,
                            failed_count: selectedUsers.length,
                            updated_at: new Date().toISOString(),
                            content: `${emailData.content}\n\n--- FAILURE REASON ---\n${failReason}`
                        })
                        .eq('id', campaign.id);
                } catch (dbErr) {
                    console.error('Failed to update campaign to failed state in Supabase:', dbErr);
                }
            }

            await fetchEmailHistory();

            if (error.name === 'AbortError') {
                alert('Request timed out. The campaign has been logged in history. Check the History tab for status.');
            } else if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError') || error.name === 'TypeError') {
                alert(`Cannot connect to backend server:\n\nPlease make sure the backend server is running on port 5000.\nCampaign has been marked as FAILED in history.`);
            } else {
                alert(`Failed to send email: ${error.message}`);
            }
        }
    };

    // Calculate Analytics Metrics
    const analyticsMetrics = useMemo(() => {
        const totalSent = emailHistory.reduce((sum, c) => sum + (c.sent_count != null ? c.sent_count : (c.status === 'sent' ? (c.recipient_count || 0) : 0)), 0);
        const successful = emailHistory.filter(c => c.status === 'sent').length;
        const totalCampaigns = emailHistory.length;
        const avgAudience = totalCampaigns > 0 ? Math.round(totalSent / totalCampaigns) : 0;
        const successRate = totalCampaigns > 0 ? Math.round((successful / totalCampaigns) * 100) : 100;
        
        // Chart data: Last 7 campaigns
        const chartData = [...emailHistory].reverse().slice(-7).map((c, idx) => ({
            name: `Campaign #${idx + 1}`,
            subject: c.subject.length > 18 ? c.subject.substring(0, 18) + '...' : c.subject,
            recipients: c.recipient_count || 0
        }));

        const roleDistribution = [
            { name: 'Students', value: users.filter(u => u.role === 'student').length, color: '#4f46e5' },
            { name: 'Admins', value: users.filter(u => u.role === 'admin').length, color: '#10b981' },
            { name: 'Others', value: users.filter(u => u.role !== 'student' && u.role !== 'admin').length, color: '#f59e0b' }
        ].filter(d => d.value > 0);

        return {
            totalSent,
            successful,
            totalCampaigns,
            avgAudience,
            successRate,
            chartData,
            roleDistribution
        };
    }, [emailHistory, users]);

    // ── Markdown Parser Helper for Live Client Preview ────────────────────────
    const renderFormattedText = (rawText, themeColor, isDark) => {
        if (!rawText) return null;

        // Clean any stray / broken surrogate code points or replacement characters (defense against corrupt unicode)
        const sanitized = rawText
            .replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, '')
            .replace(/\uFFFD/g, '');

        let safe = sanitized
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        safe = safe
            .replace(/\*\*(.*?)\*\*/g, `<strong style="font-weight: 700; color: ${isDark ? '#f8fafc' : '#0f172a'};">$1</strong>`)
            .replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em style="font-style: italic;">$1</em>')
            .replace(/_(.*?)_/g, '<em style="font-style: italic;">$1</em>')
            .replace(/&lt;u&gt;(.*?)&lt;\/u&gt;/gi, '<span style="text-decoration: underline;">$1</span>')
            .replace(/~~(.*?)~~/g, '<del style="text-decoration: line-through; opacity: 0.6;">$1</del>')
            .replace(/`([^`]+)`/g, `<code style="background-color: ${isDark ? '#334155' : '#f1f5f9'}; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 12px; color: ${isDark ? '#f1f5f9' : '#0f172a'}; border: 1px solid ${isDark ? '#475569' : '#e2e8f0'};">$1</code>`)
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, `<a href="$2" target="_blank" rel="noopener noreferrer" style="color: ${themeColor}; text-decoration: underline; font-weight: 600;">$1</a>`)
            .replace(/\n/g, '<br/>');

        return <span dangerouslySetInnerHTML={{ __html: safe }} />;
    };

    // Parse email body paragraphs and special callouts for live preview
    const renderLivePreviewContent = () => {
        const content = emailData.content || 'Start typing in the composer to see your email come alive here...';
        const blocks = content.split(/\n\s*\n/).filter(b => b.trim());

        return blocks.map((block, idx) => {
            const trimmed = block.trim();

            // Headings (### or ## or #)
            if (trimmed.startsWith('### ') || trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
                const headingText = trimmed.replace(/^#+\s*/, '');
                return (
                    <h3 
                        key={idx} 
                        className={`text-base font-bold my-4 pb-1 border-b ${
                            previewDarkMode ? 'text-white border-slate-800' : 'text-slate-900 border-slate-100'
                        }`}
                    >
                        {renderFormattedText(headingText, emailData.themeColor, previewDarkMode)}
                    </h3>
                );
            }

            // Horizontal Rule (--- or ***)
            if (trimmed === '---' || trimmed === '***') {
                return (
                    <hr key={idx} className={`my-4 border-t ${previewDarkMode ? 'border-slate-800' : 'border-slate-200'}`} />
                );
            }

            // Warning Alert Box (⚠️ or [WARNING])
            if (trimmed.startsWith('⚠️') || trimmed.startsWith('\u26A0') || trimmed.toUpperCase().startsWith('[WARNING]')) {
                const text = trimmed.replace(/^(?:⚠️|\u26A0\uFE0F?|\[WARNING\])\s*/iu, '');
                return (
                    <div key={idx} className="my-3 p-3.5 rounded-lg border-l-4 border-amber-500 bg-amber-50 text-amber-900 text-sm leading-relaxed">
                        <div className="flex items-start gap-2">
                            <span className="text-base shrink-0">⚠️</span>
                            <div className="font-medium">{renderFormattedText(text, emailData.themeColor, false)}</div>
                        </div>
                    </div>
                );
            }

            // Achievement / Reward Box (🏆 or 🎉)
            if (trimmed.startsWith('🏆') || trimmed.startsWith('🎉') || trimmed.toUpperCase().startsWith('[REWARD]')) {
                const text = trimmed.replace(/^(?:🏆|🎉|\[REWARD\])\s*/iu, '');
                return (
                    <div key={idx} className="my-3 p-3.5 rounded-lg border-l-4 border-purple-500 bg-purple-50 text-purple-900 text-sm leading-relaxed">
                        <div className="flex items-start gap-2">
                            <span className="text-base shrink-0">🎉</span>
                            <div className="font-semibold">{renderFormattedText(text, emailData.themeColor, false)}</div>
                        </div>
                    </div>
                );
            }

            // Important Note (📌 or [NOTE])
            if (trimmed.startsWith('📌') || trimmed.toUpperCase().startsWith('[NOTE]')) {
                const text = trimmed.replace(/^(?:📌|\[NOTE\])\s*/iu, '');
                return (
                    <div key={idx} className="my-3 p-3.5 rounded-lg border-l-4 border-sky-500 bg-sky-50 text-sky-900 text-sm leading-relaxed">
                        <div className="flex items-start gap-2">
                            <span className="text-base shrink-0">📌</span>
                            <div className="font-medium">{renderFormattedText(text, emailData.themeColor, false)}</div>
                        </div>
                    </div>
                );
            }

            // Support Help (❓ or [HELP])
            if (trimmed.startsWith('❓') || trimmed.toUpperCase().startsWith('[HELP]')) {
                const text = trimmed.replace(/^(?:❓|\[HELP\])\s*/iu, '');
                return (
                    <div key={idx} className={`my-3 p-3.5 rounded-lg border-l-4 border-slate-400 text-sm leading-relaxed ${
                        previewDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                    }`}>
                        <div className="flex items-start gap-2">
                            <span className="text-base shrink-0">❓</span>
                            <div>{renderFormattedText(text, emailData.themeColor, previewDarkMode)}</div>
                        </div>
                    </div>
                );
            }

            // Pro Tip / Quote (💡 or > or [TIP])
            if (trimmed.startsWith('>') || trimmed.startsWith('💡') || trimmed.toUpperCase().startsWith('[TIP]')) {
                const text = trimmed.replace(/^(?:>|💡|\[TIP\])\s*/iu, '');
                return (
                    <div 
                        key={idx} 
                        className="my-3 p-3.5 rounded-lg border-l-4 text-sm leading-relaxed"
                        style={{
                            borderLeftColor: emailData.themeColor,
                            backgroundColor: previewDarkMode ? '#1e293b' : '#f8fafc',
                            color: previewDarkMode ? '#cbd5e1' : '#334155'
                        }}
                    >
                        <div className="flex items-start gap-2">
                            <span className="text-base shrink-0">💡</span>
                            <div>{renderFormattedText(text, emailData.themeColor, previewDarkMode)}</div>
                        </div>
                    </div>
                );
            }

            // Numbered List (1. 2.)
            if (/^\d+\.\s/.test(trimmed)) {
                const items = trimmed.split('\n').filter(Boolean);
                return (
                    <ol key={idx} className="my-3 space-y-1.5 pl-5 text-sm list-decimal">
                        {items.map((item, itemIdx) => (
                            <li key={itemIdx} className="leading-relaxed" style={{ color: previewDarkMode ? '#cbd5e1' : '#374151' }}>
                                {renderFormattedText(item.replace(/^\d+\.\s*/, ''), emailData.themeColor, previewDarkMode)}
                            </li>
                        ))}
                    </ol>
                );
            }

            // Bullet List (- or • or * or ✓)
            if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ') || trimmed.startsWith('✓ ')) {
                const items = trimmed.split('\n').filter(Boolean);
                return (
                    <ul key={idx} className="my-3 space-y-1.5 pl-2 text-sm">
                        {items.map((item, itemIdx) => (
                            <li key={itemIdx} className="flex items-start gap-2" style={{ color: previewDarkMode ? '#cbd5e1' : '#374151' }}>
                                <span className="text-xs mt-1 font-bold shrink-0" style={{ color: emailData.themeColor }}>✓</span>
                                <span className="leading-relaxed">
                                    {renderFormattedText(item.replace(/^(?:[-•*✓])\s*/u, ''), emailData.themeColor, previewDarkMode)}
                                </span>
                            </li>
                        ))}
                    </ul>
                );
            }

            // Normal paragraph
            return (
                <p 
                    key={idx} 
                    className="mb-3.5 text-sm leading-relaxed whitespace-pre-wrap"
                    style={{ color: previewDarkMode ? '#cbd5e1' : '#374151' }}
                >
                    {renderFormattedText(trimmed, emailData.themeColor, previewDarkMode)}
                </p>
            );
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans overflow-x-hidden">
            <ResponsiveAdminSidebar />

            <div className="flex-1 flex flex-col lg:ml-64 xl:ml-72 min-w-0">
                <ResponsiveAdminHeader 
                    title="Bulk Email Studio" 
                    subtitle="Craft stunning, branded email broadcasts with live interactive preview"
                    onMobileMenuToggle={() => {}}
                />

                <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
                    {/* Top Stats Overview Ribbon */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm flex items-center gap-3.5"
                        >
                            <div className="w-11 h-11 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Audience</p>
                                <p className="text-xl font-bold text-slate-900">{users.length} <span className="text-xs font-normal text-slate-500">users</span></p>
                            </div>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 }}
                            className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm flex items-center gap-3.5"
                        >
                            <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                                <Send className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Delivered</p>
                                <p className="text-xl font-bold text-slate-900">{analyticsMetrics.totalSent} <span className="text-xs font-normal text-slate-500">emails</span></p>
                            </div>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm flex items-center gap-3.5"
                        >
                            <div className="w-11 h-11 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
                                <CheckCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Success Rate</p>
                                <p className="text-xl font-bold text-slate-900">{analyticsMetrics.successRate}%</p>
                            </div>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm flex items-center gap-3.5"
                        >
                            <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Templates</p>
                                <p className="text-xl font-bold text-slate-900">{PRESET_TEMPLATES.length + templates.length} <span className="text-xs font-normal text-slate-500">ready</span></p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Main Workspace Container */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        {/* Tabs Header */}
                        <div className="border-b border-slate-200 bg-slate-50/70 px-6 pt-3 flex flex-wrap items-center justify-between gap-4">
                            <nav className="flex space-x-2">
                                {[
                                    { id: 'compose', label: 'Email Studio', icon: Sparkles },
                                    { id: 'templates', label: 'Template Gallery', icon: BookOpen },
                                    { id: 'history', label: 'Campaign History', icon: Clock },
                                    { id: 'analytics', label: 'Analytics & Insights', icon: BarChart3 },
                                ].map(tab => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-all ${
                                                isActive
                                                    ? 'border-violet-600 text-violet-700 bg-white shadow-xs rounded-t-lg -mb-[1px]'
                                                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 rounded-t-lg'
                                            }`}
                                        >
                                            <Icon className={`w-4 h-4 ${isActive ? 'text-violet-600' : 'text-slate-400'}`} />
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </nav>

                            {/* Quick Action Buttons in Top Header */}
                            {activeTab === 'compose' && (
                                <div className="flex items-center gap-2 pb-2.5">
                                    <button
                                        onClick={() => setShowTestEmailModal(true)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs"
                                    >
                                        <Mail className="w-3.5 h-3.5 text-violet-600" />
                                        Send Test Email
                                    </button>
                                    <button
                                        onClick={() => setShowSaveTemplateModal(true)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs"
                                    >
                                        <Plus className="w-3.5 h-3.5 text-slate-500" />
                                        Save as Template
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* TAB 1: COMPOSE / EMAIL STUDIO */}
                        {activeTab === 'compose' && (
                            <div className="p-6">
                                {/* Audience Targeting Ribbon */}
                                <div className="mb-6 p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-3">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-violet-600" />
                                            <h3 className="text-sm font-semibold text-slate-900">Target Audience</h3>
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 font-medium">
                                                {selectedUsers.length} Selected Recipients
                                            </span>
                                        </div>
                                        {selectedUsers.length === 0 && (
                                            <span className="text-xs text-amber-600 flex items-center gap-1 font-medium">
                                                <AlertCircle className="w-3.5 h-3.5" /> Please select at least one recipient
                                            </span>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {[
                                            { id: 'all', label: 'All Registered Users', count: users.length, icon: Users },
                                            { id: 'students', label: 'Students Only', count: users.filter(u => u.role === 'student').length, icon: GraduationCap },
                                            { id: 'admins', label: 'Admins Only', count: users.filter(u => u.role === 'admin').length, icon: ShieldCheck },
                                            { id: 'custom', label: 'Custom Targeted', count: selectedUsers.length, icon: CheckSquare },
                                        ].map(aud => {
                                            const Icon = aud.icon;
                                            const isSelected = targetAudience === aud.id;
                                            return (
                                                <button
                                                    key={aud.id}
                                                    onClick={() => handleAudienceChange(aud.id)}
                                                    className={`p-3 rounded-xl border text-left transition-all relative ${
                                                        isSelected
                                                            ? 'border-violet-600 bg-violet-50/50 shadow-xs'
                                                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between mb-1">
                                                        <Icon className={`w-4 h-4 ${isSelected ? 'text-violet-600' : 'text-slate-500'}`} />
                                                        <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${
                                                            isSelected ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600'
                                                        }`}>
                                                            {aud.count}
                                                        </span>
                                                    </div>
                                                    <p className={`text-xs font-semibold ${isSelected ? 'text-violet-900' : 'text-slate-800'}`}>{aud.label}</p>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Targeted Search / Selection Panel */}
                                    {(targetAudience === 'custom' || searchTerm.trim()) && (
                                        <div className="pt-2 border-t border-slate-200/80 space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="relative flex-1">
                                                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                                                    <input
                                                        type="text"
                                                        value={searchTerm}
                                                        onChange={e => setSearchTerm(e.target.value)}
                                                        placeholder="Search user by name or email to add/remove..."
                                                        className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        const matchingIds = displayedUsers.map(u => u.id);
                                                        setSelectedUsers(Array.from(new Set([...selectedUsers, ...matchingIds])));
                                                    }}
                                                    className="px-3 py-2 text-xs font-medium bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                                                >
                                                    Select All Matching ({displayedUsers.length})
                                                </button>
                                                <button
                                                    onClick={() => setSelectedUsers([])}
                                                    className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                                                >
                                                    Clear All
                                                </button>
                                            </div>

                                            {/* User Selection List */}
                                            <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg bg-white p-2 divide-y divide-slate-100">
                                                {displayedUsers.length === 0 ? (
                                                    <p className="text-center py-4 text-xs text-slate-400">No users match your criteria.</p>
                                                ) : (
                                                    displayedUsers.slice(0, 50).map(u => {
                                                        const isChecked = selectedUsers.includes(u.id);
                                                        return (
                                                            <div 
                                                                key={u.id}
                                                                onClick={() => {
                                                                    if (isChecked) {
                                                                        setSelectedUsers(selectedUsers.filter(id => id !== u.id));
                                                                    } else {
                                                                        setSelectedUsers([...selectedUsers, u.id]);
                                                                    }
                                                                }}
                                                                className="flex items-center justify-between py-1.5 px-2 hover:bg-slate-50 cursor-pointer rounded text-xs transition-colors"
                                                            >
                                                                <div className="flex items-center gap-2 min-w-0">
                                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${isChecked ? 'bg-violet-600 border-violet-600 text-white' : 'border-slate-300'}`}>
                                                                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                                                    </div>
                                                                    <span className="font-medium text-slate-800 truncate">{u.full_name || 'User'}</span>
                                                                    <span className="text-slate-400 truncate">&lt;{u.email}&gt;</span>
                                                                </div>
                                                                <span className="text-[10px] uppercase font-bold text-slate-400 px-1.5 py-0.5 rounded bg-slate-100 shrink-0">
                                                                    {u.role}
                                                                </span>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Studio Two-Column Grid (Editor Left, Live Interactive Preview Right) */}
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                                    
                                    {/* ── LEFT COLUMN: Composer & Customizer ────────────────────────── */}
                                    <div className="lg:col-span-6 space-y-6">
                                        
                                        {/* Creative Styling Bar (Color & Header Style) */}
                                        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Palette className="w-4 h-4 text-violet-600" />
                                                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Design & Color Theme</span>
                                                </div>
                                                <span className="text-xs text-slate-500 font-mono">{emailData.themeColor}</span>
                                            </div>

                                            {/* Palette Swatches */}
                                            <div className="flex flex-wrap items-center gap-2.5">
                                                {THEME_PALETTES.map(p => (
                                                    <button
                                                        key={p.id}
                                                        onClick={() => setEmailData(prev => ({ ...prev, themeColor: p.color }))}
                                                        className={`group relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                                                            emailData.themeColor === p.color
                                                                ? 'border-slate-900 bg-white text-slate-900 shadow-xs'
                                                                : 'border-slate-200 bg-white/80 text-slate-600 hover:border-slate-300'
                                                        }`}
                                                    >
                                                        <span className={`w-3 h-3 rounded-full ${p.chip} shrink-0`} />
                                                        <span>{p.name}</span>
                                                    </button>
                                                ))}

                                                {/* Custom Hex input */}
                                                <div className="flex items-center gap-1.5 px-2 py-1 bg-white rounded-lg border border-slate-200">
                                                    <input
                                                        type="color"
                                                        value={emailData.themeColor}
                                                        onChange={e => setEmailData(prev => ({ ...prev, themeColor: e.target.value }))}
                                                        className="w-5 h-5 cursor-pointer rounded border-0 p-0 bg-transparent"
                                                        title="Pick custom color"
                                                    />
                                                    <span className="text-[11px] text-slate-400 font-mono uppercase">Custom</span>
                                                </div>
                                            </div>

                                            {/* Header Style & Badge Category */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/80">
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-700 mb-1">Header Style</label>
                                                    <select
                                                        value={emailData.headerStyle}
                                                        onChange={e => setEmailData(prev => ({ ...prev, headerStyle: e.target.value }))}
                                                        className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
                                                    >
                                                        {HEADER_STYLES.map(hs => (
                                                            <option key={hs.id} value={hs.id}>{hs.name}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-medium text-slate-700 mb-1">Badge Tag</label>
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            value={emailData.badgeText}
                                                            onChange={e => setEmailData(prev => ({ ...prev, badgeText: e.target.value }))}
                                                            placeholder="e.g. Important Notice"
                                                            className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Quick Badge Chips */}
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <span className="text-[11px] text-slate-400">Presets:</span>
                                                {BADGE_PRESETS.map(b => (
                                                    <button
                                                        key={b}
                                                        onClick={() => setEmailData(prev => ({ ...prev, badgeText: b }))}
                                                        className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-colors"
                                                    >
                                                        {b}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Subject Line & Quick Preset Loader */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">Email Subject</label>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => setEmailData(prev => ({ ...prev, subject: prev.subject + ' 🎓' }))}
                                                        className="text-xs px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                                                        title="Insert Emoji"
                                                    >
                                                        🎓
                                                    </button>
                                                    <button
                                                        onClick={() => setEmailData(prev => ({ ...prev, subject: prev.subject + ' 🚀' }))}
                                                        className="text-xs px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                                                        title="Insert Emoji"
                                                    >
                                                        🚀
                                                    </button>
                                                    <button
                                                        onClick={() => setEmailData(prev => ({ ...prev, subject: prev.subject + ' 📢' }))}
                                                        className="text-xs px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                                                        title="Insert Emoji"
                                                    >
                                                        📢
                                                    </button>
                                                    <button
                                                        onClick={() => setEmailData(prev => ({ ...prev, subject: prev.subject + ' ⚠️' }))}
                                                        className="text-xs px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                                                        title="Insert Emoji"
                                                    >
                                                        ⚠️
                                                    </button>
                                                </div>
                                            </div>
                                            <input
                                                type="text"
                                                value={emailData.subject}
                                                onChange={e => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                                                placeholder="Enter an engaging, clear subject line..."
                                                className="w-full px-3.5 py-2.5 text-sm font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:outline-none text-slate-900"
                                            />
                                        </div>

                                        {/* ── RICH TEXT FORMATTING TOOLBAR ─────────────────────────────── */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-xs text-slate-500">
                                                <label className="font-bold text-slate-900 uppercase tracking-wider">Email Message Body</label>
                                                <span>{emailData.content.length} characters • {emailData.content.trim().split(/\s+/).filter(Boolean).length} words</span>
                                            </div>

                                            {/* Primary Markdown Style Toolbar */}
                                            <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-100/90 rounded-t-xl border border-slate-200 text-slate-700 text-xs shadow-2xs">
                                                {/* Text Formats */}
                                                <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5 shadow-2xs">
                                                    <button
                                                        onClick={() => formatSelection('**', '**', 'bold text')}
                                                        className="p-1.5 hover:bg-slate-100 rounded hover:text-slate-900 transition-colors"
                                                        title="Bold (Ctrl+B)"
                                                    >
                                                        <Bold className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => formatSelection('*', '*', 'italic text')}
                                                        className="p-1.5 hover:bg-slate-100 rounded hover:text-slate-900 transition-colors"
                                                        title="Italic (Ctrl+I)"
                                                    >
                                                        <Italic className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => formatSelection('<u>', '</u>', 'underlined text')}
                                                        className="p-1.5 hover:bg-slate-100 rounded hover:text-slate-900 transition-colors"
                                                        title="Underline (Ctrl+U)"
                                                    >
                                                        <Underline className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => formatSelection('~~', '~~', 'strikethrough')}
                                                        className="p-1.5 hover:bg-slate-100 rounded hover:text-slate-900 transition-colors"
                                                        title="Strikethrough"
                                                    >
                                                        <Strikethrough className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => formatSelection('`', '`', 'code')}
                                                        className="p-1.5 hover:bg-slate-100 rounded hover:text-slate-900 transition-colors"
                                                        title="Inline Code"
                                                    >
                                                        <Code className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>

                                                <div className="w-[1px] h-5 bg-slate-300 mx-0.5" />

                                                {/* Headings */}
                                                <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5 shadow-2xs">
                                                    <button
                                                        onClick={() => formatLinePrefix('# ', 'Main Heading')}
                                                        className="px-2 py-1 hover:bg-slate-100 rounded font-bold text-xs hover:text-slate-900 transition-colors"
                                                        title="Heading 1"
                                                    >
                                                        H1
                                                    </button>
                                                    <button
                                                        onClick={() => formatLinePrefix('## ', 'Section Heading')}
                                                        className="px-2 py-1 hover:bg-slate-100 rounded font-bold text-xs hover:text-slate-900 transition-colors"
                                                        title="Heading 2"
                                                    >
                                                        H2
                                                    </button>
                                                    <button
                                                        onClick={() => formatLinePrefix('### ', 'Subheading')}
                                                        className="px-2 py-1 hover:bg-slate-100 rounded font-bold text-xs hover:text-slate-900 transition-colors"
                                                        title="Heading 3"
                                                    >
                                                        H3
                                                    </button>
                                                </div>

                                                <div className="w-[1px] h-5 bg-slate-300 mx-0.5" />

                                                {/* Lists & Structural Elements */}
                                                <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5 shadow-2xs">
                                                    <button
                                                        onClick={() => insertSnippet('\n• Point 1\n• Point 2\n• Point 3\n')}
                                                        className="p-1.5 hover:bg-slate-100 rounded hover:text-slate-900 transition-colors"
                                                        title="Bullet List"
                                                    >
                                                        <List className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => insertSnippet('\n1. First step\n2. Second step\n3. Third step\n')}
                                                        className="p-1.5 hover:bg-slate-100 rounded hover:text-slate-900 transition-colors"
                                                        title="Numbered List"
                                                    >
                                                        <ListOrdered className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => formatLinePrefix('> ', 'Quote or advice text')}
                                                        className="p-1.5 hover:bg-slate-100 rounded hover:text-slate-900 transition-colors"
                                                        title="Blockquote"
                                                    >
                                                        <Quote className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={openLinkModal}
                                                        className="p-1.5 hover:bg-slate-100 rounded hover:text-slate-900 transition-colors flex items-center gap-1"
                                                        title="Insert Link"
                                                    >
                                                        <LinkIcon className="w-3.5 h-3.5 text-violet-600" />
                                                    </button>
                                                    <button
                                                        onClick={() => insertSnippet('\n---\n\n')}
                                                        className="p-1.5 hover:bg-slate-100 rounded hover:text-slate-900 transition-colors"
                                                        title="Horizontal Line Divider"
                                                    >
                                                        <Minus className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Content Textarea */}
                                            <textarea
                                                ref={textareaRef}
                                                rows={11}
                                                value={emailData.content}
                                                onChange={e => setEmailData(prev => ({ ...prev, content: e.target.value }))}
                                                onKeyDown={handleTextareaKeyDown}
                                                placeholder="Write your email here. Format with Bold (**text**), Italic (*text*), Underline (<u>text</u>), Headings (### ), or use the quick insert options below..."
                                                className="w-full p-3.5 text-sm border-x border-b border-slate-200 rounded-b-xl focus:ring-2 focus:ring-violet-500 focus:outline-none text-slate-800 leading-relaxed font-sans bg-white shadow-inner"
                                            />

                                            {/* ── EXPANDED CREATIVE INSERT OPTIONS ─────────────────────── */}
                                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                                                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                                    <span>Quick Insert Library</span>
                                                    <span className="text-[10px] text-slate-400 lowercase font-normal">Click to insert at cursor</span>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                                                    <button
                                                        onClick={() => insertSnippet('Hi {name},\n\n')}
                                                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-violet-300 hover:text-violet-700 font-medium text-slate-700 shadow-2xs transition-colors flex items-center gap-1"
                                                    >
                                                        <span>👤</span> Hi &#123;name&#125;,
                                                    </button>
                                                    <button
                                                        onClick={() => insertSnippet('\n💡 Pro Tip: Enter helpful academic advice or study tip here.\n\n')}
                                                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-amber-300 hover:text-amber-700 font-medium text-slate-700 shadow-2xs transition-colors flex items-center gap-1"
                                                    >
                                                        <span>💡</span> Tip Box
                                                    </button>
                                                    <button
                                                        onClick={() => insertSnippet('\n⚠️ Urgent Notice: Please verify your examination registration before the deadline.\n\n')}
                                                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-red-300 hover:text-red-700 font-medium text-slate-700 shadow-2xs transition-colors flex items-center gap-1"
                                                    >
                                                        <span>⚠️</span> Warning Box
                                                    </button>
                                                    <button
                                                        onClick={() => insertSnippet('\n📌 Important Note: Exam hall tickets and verified notes are available now on the portal.\n\n')}
                                                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-sky-300 hover:text-sky-700 font-medium text-slate-700 shadow-2xs transition-colors flex items-center gap-1"
                                                    >
                                                        <span>📌</span> Note Box
                                                    </button>
                                                    <button
                                                        onClick={() => insertSnippet('\n🎉 Reward Alert: Earn 50 EduSure Coins by uploading verified notes this week!\n\n')}
                                                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-purple-300 hover:text-purple-700 font-medium text-slate-700 shadow-2xs transition-colors flex items-center gap-1"
                                                    >
                                                        <span>🎉</span> Coins & Rewards
                                                    </button>
                                                    <button
                                                        onClick={() => insertSnippet('\n📅 Date: Friday, Oct 24, 2026\n⏰ Time: 10:00 AM – 12:30 PM\n📍 Venue: Online & Main Campus\n\n')}
                                                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-emerald-300 hover:text-emerald-700 font-medium text-slate-700 shadow-2xs transition-colors flex items-center gap-1"
                                                    >
                                                        <span>📅</span> Event Date & Time
                                                    </button>
                                                    <button
                                                        onClick={() => insertSnippet('\n✓ Step 1: Download verified notes & syllabus\n✓ Step 2: Bookmark high-yield exam topics\n✓ Step 3: Attend revision mock test\n\n')}
                                                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-violet-300 hover:text-violet-700 font-medium text-slate-700 shadow-2xs transition-colors flex items-center gap-1"
                                                    >
                                                        <span>✓</span> Action Checklist
                                                    </button>
                                                    <button
                                                        onClick={() => insertSnippet('\n❓ Need Assistance? Contact student support at support@edusure.com or visit the Help Center.\n\n')}
                                                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-slate-400 font-medium text-slate-700 shadow-2xs transition-colors flex items-center gap-1"
                                                    >
                                                        <span>❓</span> Help Desk Box
                                                    </button>
                                                    <button
                                                        onClick={() => insertSnippet('\nBest regards,\nThe EduSure Academic Operations Team')}
                                                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-slate-400 font-medium text-slate-700 shadow-2xs transition-colors flex items-center gap-1"
                                                    >
                                                        <span>✍️</span> Formal Sign-off
                                                    </button>
                                                    <button
                                                        onClick={() => insertSnippet('\n📚 Material: Computer Networks & Security [Course Code: CS-402]\n\n')}
                                                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-700 font-medium text-slate-700 shadow-2xs transition-colors flex items-center gap-1"
                                                    >
                                                        <span>📚</span> Subject Mention
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Interactive Call-To-Action (CTA) Builder */}
                                        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <MousePointer className="w-4 h-4 text-violet-600" />
                                                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Call to Action (CTA) Button</span>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={emailData.hasCta}
                                                        onChange={e => setEmailData(prev => ({ ...prev, hasCta: e.target.checked }))}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-violet-600"></div>
                                                </label>
                                            </div>

                                            {emailData.hasCta && (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                                    <div>
                                                        <label className="block text-xs font-medium text-slate-700 mb-1">Button Text</label>
                                                        <input
                                                            type="text"
                                                            value={emailData.ctaText}
                                                            onChange={e => setEmailData(prev => ({ ...prev, ctaText: e.target.value }))}
                                                            placeholder="e.g. Access Portal"
                                                            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-slate-700 mb-1">Button Link URL</label>
                                                        <input
                                                            type="url"
                                                            value={emailData.ctaUrl}
                                                            onChange={e => setEmailData(prev => ({ ...prev, ctaUrl: e.target.value }))}
                                                            placeholder="https://..."
                                                            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions Row */}
                                        <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setShowTestEmailModal(true)}
                                                    className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs"
                                                >
                                                    <Mail className="w-3.5 h-3.5 text-violet-600" />
                                                    Send Test Email
                                                </button>
                                                <button
                                                    onClick={() => setShowSaveTemplateModal(true)}
                                                    className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs"
                                                >
                                                    <Plus className="w-3.5 h-3.5 text-slate-500" />
                                                    Save Template
                                                </button>
                                            </div>

                                            <button
                                                onClick={sendBulkEmail}
                                                disabled={isSending || !emailData.subject.trim() || !emailData.content.trim() || selectedUsers.length === 0}
                                                className="px-6 py-2.5 text-sm font-bold text-white rounded-xl transition-all shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                style={{
                                                    backgroundColor: emailData.themeColor,
                                                    boxShadow: `0 4px 14px ${emailData.themeColor}40`
                                                }}
                                            >
                                                {isSending ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        <span>Sending ({sendProgress}%)</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send className="w-4 h-4" />
                                                        <span>Send to {selectedUsers.length} Recipients</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        {/* Sending Progress Bar */}
                                        {isSending && (
                                            <div className="p-4 rounded-xl bg-violet-50 border border-violet-100 space-y-2">
                                                <div className="flex items-center justify-between text-xs text-violet-900 font-medium">
                                                    <span>{sendingStepText}</span>
                                                    <span>{sendProgress}%</span>
                                                </div>
                                                <div className="w-full bg-violet-200 rounded-full h-2 overflow-hidden">
                                                    <div 
                                                        className="h-full bg-violet-600 transition-all duration-300 rounded-full"
                                                        style={{ width: `${sendProgress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* ── RIGHT COLUMN: Live Interactive Device Preview ────────────── */}
                                    <div className="lg:col-span-6 sticky top-24 space-y-3">
                                        {/* Preview Toolbar */}
                                        <div className="flex items-center justify-between p-3 bg-slate-900 text-white rounded-t-2xl">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                                                <span className="text-xs font-bold uppercase tracking-wider">Live Preview</span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {/* Device View Toggles */}
                                                <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
                                                    <button
                                                        onClick={() => setPreviewDevice('desktop')}
                                                        className={`p-1.5 rounded text-xs transition-colors flex items-center gap-1 ${
                                                            previewDevice === 'desktop' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
                                                        }`}
                                                        title="Desktop View"
                                                    >
                                                        <Monitor className="w-3.5 h-3.5" />
                                                        <span className="hidden sm:inline text-[10px]">Desktop</span>
                                                    </button>
                                                    <button
                                                        onClick={() => setPreviewDevice('mobile')}
                                                        className={`p-1.5 rounded text-xs transition-colors flex items-center gap-1 ${
                                                            previewDevice === 'mobile' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
                                                        }`}
                                                        title="Mobile View"
                                                    >
                                                        <Smartphone className="w-3.5 h-3.5" />
                                                        <span className="hidden sm:inline text-[10px]">Mobile</span>
                                                    </button>
                                                </div>

                                                {/* Dark / Light Toggle */}
                                                <button
                                                    onClick={() => setPreviewDarkMode(!previewDarkMode)}
                                                    className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
                                                    title={previewDarkMode ? 'Switch to Light Preview' : 'Switch to Dark Preview'}
                                                >
                                                    {previewDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Realistic Email Client Frame */}
                                        <div className={`rounded-b-2xl border-x border-b border-slate-200 transition-all overflow-hidden ${
                                            previewDarkMode ? 'bg-slate-900' : 'bg-slate-100'
                                        } p-3 sm:p-5 flex justify-center`}>
                                            
                                            {/* Outer Device Mockup Container */}
                                            <div 
                                                className={`transition-all duration-300 ${
                                                    previewDevice === 'mobile'
                                                        ? 'w-[360px] max-w-full rounded-[36px] p-2 bg-slate-950 shadow-2xl border-4 border-slate-800'
                                                        : 'w-full max-w-[620px] rounded-xl shadow-xl'
                                                }`}
                                            >
                                                {/* Mobile Notch Mockup */}
                                                {previewDevice === 'mobile' && (
                                                    <div className="relative pb-2">
                                                        <div className="flex justify-between items-center px-6 pt-2 text-[10px] text-white font-medium">
                                                            <span>9:41</span>
                                                            <div className="w-20 h-4 bg-slate-900 rounded-full mx-auto" />
                                                            <span>5G</span>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Email Client Wrapper */}
                                                <div className={`overflow-hidden rounded-xl border ${
                                                    previewDarkMode 
                                                        ? 'bg-slate-900 border-slate-800 text-slate-200' 
                                                        : 'bg-white border-slate-200 text-slate-900 shadow-xs'
                                                }`}>
                                                    
                                                    {/* Email Client Header (Meta info) */}
                                                    <div className={`p-3.5 border-b text-xs space-y-1 ${
                                                        previewDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-100'
                                                    }`}>
                                                        <div className="flex items-center justify-between text-slate-400 text-[11px]">
                                                            <span className="font-semibold text-slate-500">From: EduSure &lt;noreply@edusure.com&gt;</span>
                                                            <span>Today, {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                        <div className="text-[11px] text-slate-400">
                                                            <span>To: </span>
                                                            <span className="font-medium text-slate-600 dark:text-slate-300">
                                                                {targetAudience === 'all' ? 'All Registered Users' : `${selectedUsers.length} Selected Recipients`}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Rendered Email Content View */}
                                                    <div className="p-0 overflow-hidden">
                                                        {/* Header Style Render */}
                                                        {emailData.headerStyle === 'dark' ? (
                                                            <div className="bg-slate-950 p-7 text-center">
                                                                <span className="inline-block text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-white/10 text-slate-200 border border-white/15 mb-2">
                                                                    {emailData.badgeText || 'EduSure Update'}
                                                                </span>
                                                                <h1 className="text-xl font-extrabold text-white tracking-tight">EduSure</h1>
                                                                <p className="text-xs text-slate-400 mt-1">Next-Gen Student Learning Platform</p>
                                                            </div>
                                                        ) : emailData.headerStyle === 'minimal' ? (
                                                            <div className={`p-5 border-b flex items-center justify-between ${
                                                                previewDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
                                                            }`}>
                                                                <div>
                                                                    <h1 className="text-lg font-extrabold tracking-tight" style={{ color: emailData.themeColor }}>EduSure</h1>
                                                                    <p className="text-[10px] text-slate-400">Official Communication</p>
                                                                </div>
                                                                <span 
                                                                    className="text-[10px] font-bold px-2.5 py-1 rounded-full border"
                                                                    style={{ 
                                                                        color: emailData.themeColor, 
                                                                        backgroundColor: `${emailData.themeColor}15`, 
                                                                        borderColor: `${emailData.themeColor}30` 
                                                                    }}
                                                                >
                                                                    {emailData.badgeText || 'Notice'}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            /* Default Vibrant Gradient */
                                                            <div 
                                                                className="p-7 text-center text-white"
                                                                style={{
                                                                    background: `linear-gradient(135deg, ${emailData.themeColor} 0%, #1e1b4b 100%)`
                                                                }}
                                                            >
                                                                <span className="inline-block text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-white/20 text-white border border-white/25 mb-2">
                                                                    {emailData.badgeText || 'Official Announcement'}
                                                                </span>
                                                                <h1 className="text-2xl font-black tracking-tight text-white drop-shadow-xs">EduSure</h1>
                                                                <p className="text-xs text-white/80 mt-1 font-medium">Excellence in Learning & Academic Success</p>
                                                            </div>
                                                        )}

                                                        {/* Email Body Card */}
                                                        <div className="p-6">
                                                            {/* Subject Header */}
                                                            <h2 className={`text-lg font-bold mb-4 leading-snug tracking-tight ${
                                                                previewDarkMode ? 'text-white' : 'text-slate-900'
                                                            }`}>
                                                                {emailData.subject || 'Your Email Subject Appears Here'}
                                                            </h2>

                                                            {/* Content Paragraphs & Callouts */}
                                                            <div className="min-h-[120px]">
                                                                {renderLivePreviewContent()}
                                                            </div>

                                                            {/* Rendered CTA Button */}
                                                            {emailData.hasCta && (
                                                                <div className="my-6 text-center">
                                                                    <a
                                                                        href="#preview-link"
                                                                        onClick={e => e.preventDefault()}
                                                                        className="inline-block px-7 py-3 rounded-lg text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.02]"
                                                                        style={{
                                                                            backgroundColor: emailData.themeColor,
                                                                            boxShadow: `0 4px 14px ${emailData.themeColor}40`
                                                                        }}
                                                                    >
                                                                        {emailData.ctaText || 'Access Portal'} &rarr;
                                                                    </a>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Email Footer */}
                                                        <div className={`p-5 border-t text-center space-y-2 text-xs ${
                                                            previewDarkMode ? 'bg-slate-950/60 border-slate-800 text-slate-500' : 'bg-slate-50 border-slate-100 text-slate-400'
                                                        }`}>
                                                            <p className="font-semibold text-slate-500">EduSure Learning & Examination Platform</p>
                                                            <p className="text-[11px] leading-relaxed max-w-sm mx-auto">
                                                                This email was sent to you as a registered member of the EduSure community.
                                                            </p>
                                                            <div className="w-8 h-0.5 bg-slate-200 mx-auto my-2" />
                                                            <p className="text-[10px]">
                                                                &copy; {new Date().getFullYear()} EduSure. All rights reserved.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        )}

                        {/* TAB 2: TEMPLATES GALLERY */}
                        {activeTab === 'templates' && (
                            <div className="p-6 space-y-6">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900">Email Template Library</h2>
                                        <p className="text-xs text-slate-500">Pick from ready-made designer templates or use your custom saved designs</p>
                                    </div>
                                    <button
                                        onClick={() => setShowSaveTemplateModal(true)}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 text-white rounded-xl text-xs font-semibold hover:bg-violet-700 transition-colors shadow-xs"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Create Custom Template
                                    </button>
                                </div>

                                {/* Preset Designer Templates */}
                                <div className="space-y-3">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Curated Designer Presets</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {PRESET_TEMPLATES.map(preset => (
                                            <div 
                                                key={preset.id}
                                                className="bg-white rounded-xl border border-slate-200 hover:border-violet-300 hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
                                            >
                                                {/* Mini banner header */}
                                                <div 
                                                    className="p-4 text-white relative"
                                                    style={{
                                                        background: `linear-gradient(135deg, ${preset.themeColor} 0%, #1e1b4b 100%)`
                                                    }}
                                                >
                                                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/20 border border-white/20">
                                                        {preset.category}
                                                    </span>
                                                    <h4 className="text-sm font-bold text-white mt-2 truncate">{preset.name}</h4>
                                                </div>

                                                <div className="p-4 space-y-2 flex-1">
                                                    <p className="text-xs font-semibold text-slate-800 line-clamp-1">{preset.subject}</p>
                                                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed whitespace-pre-wrap">
                                                        {preset.content}
                                                    </p>
                                                </div>

                                                <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                                                    <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                                                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: preset.themeColor }} />
                                                        <span>{preset.badgeText}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            handleSelectPreset(preset);
                                                            setActiveTab('compose');
                                                        }}
                                                        className="px-3 py-1.5 text-xs font-semibold bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors flex items-center gap-1 shadow-2xs"
                                                    >
                                                        <span>Load in Editor</span>
                                                        <ArrowRight className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Custom Saved Templates */}
                                <div className="space-y-3 pt-4 border-t border-slate-200">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        Your Custom Saved Templates ({templates.length})
                                    </h3>
                                    {templates.length === 0 ? (
                                        <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                            <p className="text-xs text-slate-500 font-medium">No custom templates saved yet.</p>
                                            <p className="text-[11px] text-slate-400 mt-1">Design an email in the studio and click "Save as Template" to save it here.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {templates.map(tmpl => (
                                                <div 
                                                    key={tmpl.id}
                                                    className="bg-white rounded-xl border border-slate-200 hover:shadow-md transition-all p-4 flex flex-col justify-between space-y-3"
                                                >
                                                    <div>
                                                        <div className="flex items-start justify-between gap-2 mb-1">
                                                            <h4 className="font-bold text-sm text-slate-900 truncate">{tmpl.name}</h4>
                                                            <div className="flex items-center gap-1 shrink-0">
                                                                <button
                                                                    onClick={() => deleteTemplate(tmpl.id)}
                                                                    className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                                                                    title="Delete Template"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs font-medium text-slate-700 truncate">{tmpl.subject}</p>
                                                        <p className="text-xs text-slate-500 line-clamp-3 mt-2 leading-relaxed whitespace-pre-wrap">
                                                            {tmpl.content}
                                                        </p>
                                                    </div>

                                                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                                                        <span className="text-[10px] text-slate-400">
                                                            {new Date(tmpl.created_at).toLocaleDateString()}
                                                        </span>
                                                        <button
                                                            onClick={() => {
                                                                handleSelectCustomTemplate(tmpl);
                                                                setActiveTab('compose');
                                                            }}
                                                            className="px-3 py-1 text-xs font-semibold text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                                                        >
                                                            Use Template &rarr;
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* TAB 3: CAMPAIGN HISTORY */}
                        {activeTab === 'history' && (
                            <div className="p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900">Email Campaign History</h2>
                                        <p className="text-xs text-slate-500">Review past broadcasts, status, and recipient reach</p>
                                    </div>
                                    <button 
                                        onClick={fetchEmailHistory}
                                        className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
                                        title="Refresh History"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="overflow-x-auto rounded-xl border border-slate-200">
                                    <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
                                        <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold">
                                            <tr>
                                                <th className="px-5 py-3">Subject & Preview</th>
                                                <th className="px-5 py-3">Recipients</th>
                                                <th className="px-5 py-3">Status</th>
                                                <th className="px-5 py-3">Date Dispatched</th>
                                                <th className="px-5 py-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 bg-white">
                                            {emailHistory.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                                                        No email campaigns sent yet. Send your first broadcast from the Email Studio!
                                                    </td>
                                                </tr>
                                            ) : (
                                                emailHistory.map(c => {
                                                    const { body, reason } = parseCampaignContent(c.content);
                                                    const isFailed = c.status === 'failed';
                                                    const isPartial = c.status === 'partial';
                                                    const isSending = c.status === 'sending';

                                                    return (
                                                        <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                                                            <td className="px-5 py-3.5 max-w-sm">
                                                                <p className="font-bold text-slate-900 truncate">{c.subject}</p>
                                                                {isFailed && reason ? (
                                                                    <div className="mt-1 flex items-start gap-1.5 text-[11px] font-medium text-rose-700 bg-rose-50 border border-rose-200/80 rounded-lg px-2.5 py-1 max-w-sm">
                                                                        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500 mt-0.5" />
                                                                        <div className="min-w-0">
                                                                            <span className="font-bold text-rose-800">Reason: </span>
                                                                            <span className="line-clamp-2 break-words text-rose-700">{reason}</span>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                                                        {body || c.content}
                                                                    </p>
                                                                )}
                                                            </td>
                                                            <td className="px-5 py-3.5 font-semibold text-slate-700">
                                                                <div>{c.recipient_count || 0} users</div>
                                                                {(c.failed_count > 0 || isFailed) && (
                                                                    <div className="text-[10px] text-rose-600 font-medium mt-0.5">
                                                                        {c.failed_count || c.recipient_count || 0} failed
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="px-5 py-3.5">
                                                                {isFailed ? (
                                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200 shadow-xs">
                                                                        <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                                                        FAILED
                                                                    </span>
                                                                ) : isPartial ? (
                                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                                                                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                                                        PARTIAL
                                                                    </span>
                                                                ) : isSending ? (
                                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800 border border-sky-200 animate-pulse">
                                                                        <Loader2 className="w-3.5 h-3.5 text-sky-600 animate-spin shrink-0" />
                                                                        SENDING...
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                                                        DELIVERED
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-5 py-3.5 text-slate-500">
                                                                {new Date(c.sent_at || c.created_at).toLocaleDateString(undefined, { 
                                                                    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                                                                })}
                                                            </td>
                                                            <td className="px-5 py-3.5 text-right">
                                                                <button
                                                                    onClick={() => setViewingCampaign(c)}
                                                                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                                                                        isFailed 
                                                                            ? 'text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200' 
                                                                            : 'text-violet-600 bg-violet-50 hover:bg-violet-100 border border-violet-150'
                                                                    }`}
                                                                >
                                                                    {isFailed ? 'View Error' : 'View Email'}
                                                                </button>
                                                            </td>
                                                    </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* TAB 4: ANALYTICS & INSIGHTS */}
                        {activeTab === 'analytics' && (
                            <div className="p-6 space-y-6">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">Email Analytics & Insights</h2>
                                    <p className="text-xs text-slate-500">Performance metrics and delivery trends over recent campaigns</p>
                                </div>

                                {/* Recharts Visualizations */}
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                    {/* Campaign Volume BarChart */}
                                    <div className="lg:col-span-8 bg-white p-5 rounded-xl border border-slate-200 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Recipients Reached (Recent Campaigns)</h3>
                                            <span className="text-xs text-slate-400">Past 7 broadcasts</span>
                                        </div>
                                        <div className="h-64 w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={analyticsMetrics.chartData}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                    <XAxis dataKey="subject" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                                                    <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                                                    <Tooltip 
                                                        contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px', border: 'none' }}
                                                    />
                                                    <Bar dataKey="recipients" fill="#6366f1" radius={[6, 6, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* Audience Distribution Donut */}
                                    <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-slate-200 space-y-3 flex flex-col justify-between">
                                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Audience Role Breakdown</h3>
                                        <div className="h-48 w-full flex items-center justify-center">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={analyticsMetrics.roleDistribution}
                                                        dataKey="value"
                                                        nameKey="name"
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={45}
                                                        outerRadius={70}
                                                        paddingAngle={4}
                                                    >
                                                        {analyticsMetrics.roleDistribution.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip 
                                                        contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px', border: 'none' }}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>

                                        <div className="space-y-1.5 pt-2 border-t border-slate-100">
                                            {analyticsMetrics.roleDistribution.map(role => (
                                                <div key={role.name} className="flex items-center justify-between text-xs">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: role.color }} />
                                                        <span className="text-slate-600">{role.name}</span>
                                                    </div>
                                                    <span className="font-bold text-slate-800">{role.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </main>
            </div>

            {/* ─── MODAL: Insert Hyperlink ────────────────────────────────────────── */}
            <AnimatePresence>
                {showLinkModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-100"
                        >
                            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div className="flex items-center gap-2">
                                    <LinkIcon className="w-4 h-4 text-violet-600" />
                                    <h3 className="font-bold text-slate-900 text-xs">Insert Link</h3>
                                </div>
                                <button 
                                    onClick={() => setShowLinkModal(false)}
                                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="p-4 space-y-3 text-xs">
                                <div>
                                    <label className="block font-medium text-slate-700 mb-1">Display Text</label>
                                    <input
                                        type="text"
                                        value={linkFormData.text}
                                        onChange={e => setLinkFormData(prev => ({ ...prev, text: e.target.value }))}
                                        placeholder="e.g. View Exam Schedule"
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none"
                                        autoFocus
                                    />
                                </div>

                                <div>
                                    <label className="block font-medium text-slate-700 mb-1">Target URL <span className="text-red-500">*</span></label>
                                    <input
                                        type="url"
                                        value={linkFormData.url}
                                        onChange={e => setLinkFormData(prev => ({ ...prev, url: e.target.value }))}
                                        placeholder="https://..."
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                                <button
                                    onClick={() => setShowLinkModal(false)}
                                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmInsertLink}
                                    className="px-3 py-1.5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors shadow-xs"
                                >
                                    Insert Link
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ─── MODAL: Save Custom Template ────────────────────────────────────── */}
            <AnimatePresence>
                {showSaveTemplateModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100"
                        >
                            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-violet-600" />
                                    <h3 className="font-bold text-slate-900 text-sm">Save Email as Template</h3>
                                </div>
                                <button 
                                    onClick={() => setShowSaveTemplateModal(false)}
                                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="p-5 space-y-4 text-xs">
                                <div>
                                    <label className="block font-medium text-slate-700 mb-1">Template Name <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={saveTemplateForm.name}
                                        onChange={e => setSaveTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="e.g. Monthly Newsletter, Payment Reminder..."
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block font-medium text-slate-700 mb-1">Subject</label>
                                    <input
                                        type="text"
                                        readOnly
                                        value={emailData.subject || '(Subject from composer)'}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-600"
                                    />
                                </div>

                                <div>
                                    <label className="block font-medium text-slate-700 mb-1">Content Preview</label>
                                    <textarea
                                        readOnly
                                        rows={4}
                                        value={emailData.content || '(Content from composer)'}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-600 resize-none font-sans"
                                    />
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                                <button
                                    onClick={() => setShowSaveTemplateModal(false)}
                                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmSaveTemplate}
                                    className="px-4 py-2 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-colors shadow-xs"
                                >
                                    Save Template
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ─── MODAL: Send Test Email ────────────────────────────────────────── */}
            <AnimatePresence>
                {showTestEmailModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100"
                        >
                            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div className="flex items-center gap-2">
                                    <Mail className="w-5 h-5 text-violet-600" />
                                    <h3 className="font-bold text-slate-900 text-sm">Send Sample Test Email</h3>
                                </div>
                                <button 
                                    onClick={() => setShowTestEmailModal(false)}
                                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="p-5 space-y-4 text-xs">
                                <p className="text-slate-500 leading-relaxed">
                                    Send a single live test email directly to your inbox to inspect the formatting, design, and buttons before launching to everyone.
                                </p>

                                <div>
                                    <label className="block font-medium text-slate-700 mb-1">Recipient Test Email Address <span className="text-red-500">*</span></label>
                                    <input
                                        type="email"
                                        value={testEmailAddress}
                                        onChange={e => setTestEmailAddress(e.target.value)}
                                        placeholder="admin@example.com"
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none"
                                    />
                                </div>

                                {testEmailSuccess && (
                                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-medium">
                                        {testEmailSuccess}
                                    </div>
                                )}
                            </div>

                            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                                <button
                                    onClick={() => setShowTestEmailModal(false)}
                                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={sendTestEmail}
                                    disabled={isSendingTest || !testEmailAddress}
                                    className="px-4 py-2 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-colors shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                                >
                                    {isSendingTest ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            <span>Sending Test...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-3.5 h-3.5" />
                                            <span>Send Test Now</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ─── MODAL: View Historic Campaign ─────────────────────────────────── */}
            <AnimatePresence>
                {viewingCampaign && (() => {
                    const { body, reason } = parseCampaignContent(viewingCampaign.content);
                    const isFailed = viewingCampaign.status === 'failed';
                    const isPartial = viewingCampaign.status === 'partial';
                    const isSending = viewingCampaign.status === 'sending';

                    return (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 flex flex-col max-h-[88vh]"
                            >
                                <div className={`p-5 border-b flex items-center justify-between ${
                                    isFailed ? 'bg-rose-50/70 border-rose-100' : 'bg-slate-50/50 border-slate-100'
                                }`}>
                                    <div className="min-w-0 pr-4">
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                            isFailed 
                                                ? 'text-rose-700 bg-rose-100 border border-rose-200' 
                                                : isPartial
                                                ? 'text-amber-700 bg-amber-100 border border-amber-200'
                                                : 'text-violet-600 bg-violet-50'
                                        }`}>
                                            {isFailed ? 'Campaign Failed' : isPartial ? 'Partial Delivery' : 'Campaign Review'}
                                        </span>
                                        <h3 className="font-bold text-slate-900 text-sm truncate mt-1">{viewingCampaign.subject}</h3>
                                    </div>
                                    <button 
                                        onClick={() => setViewingCampaign(null)}
                                        className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="p-6 overflow-y-auto space-y-4 text-xs">
                                    {/* Campaign Stats Overview */}
                                    <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                                        <div>
                                            <span className="text-slate-400 block text-[10px] uppercase font-semibold">RECIPIENTS</span>
                                            <span className="font-bold text-slate-800 text-sm">{viewingCampaign.recipient_count || 0} users</span>
                                            {viewingCampaign.failed_count > 0 && (
                                                <span className="block text-[10px] text-rose-600 font-medium">({viewingCampaign.failed_count} failed)</span>
                                            )}
                                        </div>
                                        <div>
                                            <span className="text-slate-400 block text-[10px] uppercase font-semibold">DISPATCHED</span>
                                            <span className="font-medium text-slate-700 text-xs">
                                                {new Date(viewingCampaign.sent_at || viewingCampaign.created_at).toLocaleDateString(undefined, {
                                                    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 block text-[10px] uppercase font-semibold">STATUS</span>
                                            {isFailed ? (
                                                <span className="font-bold text-rose-600 uppercase flex items-center gap-1 mt-0.5">
                                                    <AlertCircle className="w-3.5 h-3.5" /> FAILED
                                                </span>
                                            ) : isPartial ? (
                                                <span className="font-bold text-amber-600 uppercase flex items-center gap-1 mt-0.5">
                                                    <AlertTriangle className="w-3.5 h-3.5" /> PARTIAL
                                                </span>
                                            ) : isSending ? (
                                                <span className="font-bold text-sky-600 uppercase flex items-center gap-1 mt-0.5">
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> SENDING
                                                </span>
                                            ) : (
                                                <span className="font-bold text-emerald-600 uppercase flex items-center gap-1 mt-0.5">
                                                    <CheckCircle className="w-3.5 h-3.5" /> DELIVERED
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Dedicated Failure Reason Box */}
                                    {(isFailed || reason) && (
                                        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-2">
                                            <div className="flex items-center gap-1.5 font-bold text-rose-800 text-xs uppercase tracking-wider">
                                                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                                                <span>Failure Diagnostic Details</span>
                                            </div>
                                            <div className="bg-white border border-rose-200 rounded-lg p-3 font-mono text-[11px] text-rose-800 leading-relaxed break-words whitespace-pre-wrap">
                                                {reason || 'Delivery failed. No specific error text was captured by the mailer.'}
                                            </div>
                                            <p className="text-[10px] text-rose-600 leading-normal">
                                                To fix SMTP issues, ensure the 16-character Google App Password in <code className="font-bold bg-rose-100/70 px-1 py-0.5 rounded">SMTP_PASS</code> is valid and active.
                                            </p>
                                        </div>
                                    )}

                                    {/* Email Content Draft */}
                                    <div className="space-y-2">
                                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Drafted Email Message</span>
                                        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 whitespace-pre-wrap leading-relaxed text-slate-700 text-xs max-h-56 overflow-y-auto font-sans">
                                            {body || viewingCampaign.content}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                                    <span className="text-[10px] text-slate-400 font-mono">ID: {viewingCampaign.id}</span>
                                    <button
                                        onClick={() => setViewingCampaign(null)}
                                        className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    );
                })()}
            </AnimatePresence>
        </div>
    );
};

export default AdminBulkEmail;
