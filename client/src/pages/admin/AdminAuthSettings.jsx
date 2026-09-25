import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Shield, ShieldCheck, ShieldAlert, Users, Mail, CheckCircle, AlertCircle, 
    Loader2, Save, RefreshCw, Globe, GraduationCap, Lock, Key, Info, HelpCircle,
    Sliders, Check, Sparkles, AlertTriangle
} from 'lucide-react';
import ResponsiveAdminSidebar from '../../components/admin/ResponsiveAdminSidebar';
import ResponsiveAdminHeader from '../../components/admin/ResponsiveAdminHeader';
import { supabase } from '../../supabaseClient';
import { adminAuthAPI } from '../../services/api';

const AdminAuthSettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [statusMsg, setStatusMsg] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    
    // Auth policy state
    const [allowNonCollegeEmails, setAllowNonCollegeEmails] = useState(true);
    const [allowedDomains, setAllowedDomains] = useState(['.ies@ipsacademy.org']);
    const [newDomainInput, setNewDomainInput] = useState('');
    const [lastUpdatedAt, setLastUpdatedAt] = useState(null);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            if (!token) {
                throw new Error('Admin session not found. Please log in again.');
            }

            const res = await adminAuthAPI.getAuthSettings(token);
            if (res && res.data) {
                setAllowNonCollegeEmails(Boolean(res.data.allow_non_college_emails));
                if (Array.isArray(res.data.allowed_domains)) {
                    setAllowedDomains(res.data.allowed_domains);
                }
                setLastUpdatedAt(res.data.updated_at);
            }
        } catch (err) {
            console.error('Failed to load auth settings:', err);
            setErrorMsg(err.message || 'Could not load authentication settings.');
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (newValue) => {
        setAllowNonCollegeEmails(newValue);
        setStatusMsg(null);
        setErrorMsg(null);
    };

    const handleAddDomain = (e) => {
        e.preventDefault();
        const trimmed = newDomainInput.trim().toLowerCase();
        if (!trimmed) return;
        
        const formatted = trimmed.startsWith('@') || trimmed.startsWith('.') ? trimmed : `@${trimmed}`;
        if (!allowedDomains.includes(formatted)) {
            setAllowedDomains([...allowedDomains, formatted]);
        }
        setNewDomainInput('');
    };

    const handleRemoveDomain = (domainToRemove) => {
        if (allowedDomains.length <= 1) {
            setErrorMsg('At least one institutional domain must remain configured.');
            return;
        }
        setAllowedDomains(allowedDomains.filter(d => d !== domainToRemove));
    };

    const handleSave = async () => {
        setSaving(true);
        setStatusMsg(null);
        setErrorMsg(null);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            if (!token) {
                throw new Error('Admin session not found. Please log in again.');
            }

            const res = await adminAuthAPI.updateAuthSettings(token, {
                allow_non_college_emails: allowNonCollegeEmails,
                allowed_domains: allowedDomains
            });

            setStatusMsg(res.message || 'Authentication policy updated successfully!');
            setLastUpdatedAt(new Date().toISOString());

            setTimeout(() => {
                setStatusMsg(null);
            }, 6000);

        } catch (err) {
            console.error('Save error:', err);
            setErrorMsg(err.message || 'Failed to update authentication settings.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex overflow-x-hidden">
            {/* Sidebar */}
            <ResponsiveAdminSidebar />

            {/* Main Content Area */}
            <div className="flex-1 min-w-0 flex flex-col lg:ml-64 xl:ml-72 overflow-hidden">
                <ResponsiveAdminHeader 
                    title="Access Control & Authentication" 
                    subtitle="Configure student registration rules, domain restrictions, and first-year onboarding"
                    onMobileMenuToggle={() => {}}
                />

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div className="max-w-5xl mx-auto space-y-6">

                        {/* Top Notification Alerts */}
                        <AnimatePresence>
                            {statusMsg && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between shadow-sm"
                                >
                                    <div className="flex items-center space-x-3">
                                        <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                                        <span className="font-medium text-sm">{statusMsg}</span>
                                    </div>
                                    <button onClick={() => setStatusMsg(null)} className="text-emerald-600 hover:text-emerald-800 text-xs font-semibold">
                                        Dismiss
                                    </button>
                                </motion.div>
                            )}

                            {errorMsg && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between shadow-sm"
                                >
                                    <div className="flex items-center space-x-3">
                                        <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                                        <span className="font-medium text-sm">{errorMsg}</span>
                                    </div>
                                    <button onClick={() => setErrorMsg(null)} className="text-rose-600 hover:text-rose-800 text-xs font-semibold">
                                        Dismiss
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Overview Metric Banner */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
                                <div className={`p-3 rounded-xl ${allowNonCollegeEmails ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {allowNonCollegeEmails ? <Globe className="w-6 h-6" /> : <GraduationCap className="w-6 h-6" />}
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Mode</p>
                                    <p className="text-base font-bold text-slate-900 mt-0.5">
                                        {allowNonCollegeEmails ? 'All Emails Allowed' : 'College Email Only'}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        {allowNonCollegeEmails ? '1st-Year Friendly (Gmail/Yahoo)' : '.ies@ipsacademy.org strictly required'}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
                                <div className="p-3 rounded-xl bg-violet-100 text-violet-700">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Registration Security</p>
                                    <p className="text-base font-bold text-slate-900 mt-0.5">Mandatory OTP Verification</p>
                                    <p className="text-xs text-slate-400 mt-0.5">6-digit email OTP via Nodemailer SMTP</p>
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
                                <div className="p-3 rounded-xl bg-blue-100 text-blue-700">
                                    <Sparkles className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">SMTP Optimization</p>
                                    <p className="text-base font-bold text-slate-900 mt-0.5">Zero Login Quota Burn</p>
                                    <p className="text-xs text-slate-400 mt-0.5">Sign-in uses direct credentials (no OTP)</p>
                                </div>
                            </div>
                        </div>

                        {/* Main 1-Click Toggle Card */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <Sliders className="w-5 h-5 text-indigo-400" />
                                        <h2 className="text-lg font-bold">Email Domain Restriction Switch</h2>
                                    </div>
                                    <p className="text-sm text-slate-300 mt-1">
                                        Toggle instantly between opening registration for first-year students and restricting to college emails.
                                    </p>
                                </div>
                                <div>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                        allowNonCollegeEmails 
                                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    }`}>
                                        <span className={`w-2 h-2 rounded-full mr-2 ${allowNonCollegeEmails ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                                        {allowNonCollegeEmails ? 'NON-COLLEGE EMAILS PERMITTED' : 'COLLEGE DOMAIN ONLY'}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6 sm:p-8 space-y-6">
                                {/* The Two Modes (Clickable Cards) */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Option 1: Allow Personal Emails */}
                                    <div 
                                        onClick={() => handleToggle(true)}
                                        className={`cursor-pointer rounded-2xl p-6 border-2 transition-all relative ${
                                            allowNonCollegeEmails 
                                                ? 'border-indigo-600 bg-indigo-50/40 shadow-md ring-2 ring-indigo-500/20' 
                                                : 'border-slate-200 hover:border-slate-300 bg-white'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="p-3 rounded-xl bg-emerald-100 text-emerald-700">
                                                <Globe className="w-6 h-6" />
                                            </div>
                                            {allowNonCollegeEmails && (
                                                <span className="flex items-center text-xs font-bold text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-full">
                                                    <Check className="w-3.5 h-3.5 mr-1" /> Active Policy
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-base font-bold text-slate-900 mt-4">
                                            Allow Personal & Non-College Emails
                                        </h3>
                                        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                                            Recommended for <strong>1st-Year Students</strong> who do not yet have their official college email ID. Students can register using personal emails (e.g. Gmail, Yahoo).
                                        </p>
                                        <ul className="mt-4 space-y-1.5 text-xs text-slate-600 border-t border-slate-200/60 pt-3">
                                            <li className="flex items-center text-emerald-700">
                                                <Check className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                                                1st-year students can register immediately
                                            </li>
                                            <li className="flex items-center text-slate-700">
                                                <Check className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                                                Requires 6-digit email OTP verification on sign-up
                                            </li>
                                            <li className="flex items-center text-slate-700">
                                                <Check className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                                                Direct email/username + password login (0 quota waste)
                                            </li>
                                        </ul>
                                    </div>

                                    {/* Option 2: Restrict to College Only */}
                                    <div 
                                        onClick={() => handleToggle(false)}
                                        className={`cursor-pointer rounded-2xl p-6 border-2 transition-all relative ${
                                            !allowNonCollegeEmails 
                                                ? 'border-indigo-600 bg-indigo-50/40 shadow-md ring-2 ring-indigo-500/20' 
                                                : 'border-slate-200 hover:border-slate-300 bg-white'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="p-3 rounded-xl bg-amber-100 text-amber-700">
                                                <GraduationCap className="w-6 h-6" />
                                            </div>
                                            {!allowNonCollegeEmails && (
                                                <span className="flex items-center text-xs font-bold text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-full">
                                                    <Check className="w-3.5 h-3.5 mr-1" /> Active Policy
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-base font-bold text-slate-900 mt-4">
                                            Institutional Email Only (.ies@ipsacademy.org)
                                        </h3>
                                        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                                            Restricts registration strictly to official college email IDs. Any attempt to register with a personal email will be blocked.
                                        </p>
                                        <ul className="mt-4 space-y-1.5 text-xs text-slate-600 border-t border-slate-200/60 pt-3">
                                            <li className="flex items-center text-amber-700">
                                                <Lock className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                                                Only .ies@ipsacademy.org allowed
                                            </li>
                                            <li className="flex items-center text-slate-700">
                                                <Check className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                                                Guarantees 100% verified college domain users
                                            </li>
                                            <li className="flex items-center text-slate-700">
                                                <Check className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                                                Requires 6-digit email OTP verification on sign-up
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Save Button & Action Strip */}
                                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
                                    <div className="text-xs text-slate-500">
                                        {lastUpdatedAt ? (
                                            <span>Last saved: {new Date(lastUpdatedAt).toLocaleString()}</span>
                                        ) : (
                                            <span>Changes apply immediately across all registration and sign-in routes upon saving.</span>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-3 w-full sm:w-auto">
                                        <button
                                            type="button"
                                            onClick={loadSettings}
                                            disabled={loading || saving}
                                            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-colors flex items-center justify-center flex-1 sm:flex-none"
                                        >
                                            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                            Reload
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center flex-1 sm:flex-none disabled:opacity-60"
                                        >
                                            {saving ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Saving Changes...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4 mr-2" />
                                                    Apply & Save Policy
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Institutional Domain Configuration Card */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
                                    <GraduationCap className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">Recognized Institutional Domains</h3>
                                    <p className="text-xs text-slate-500">
                                        Domains that are considered official college addresses when restricted mode is activated.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-2">
                                {allowedDomains.map((dom) => (
                                    <span 
                                        key={dom} 
                                        className="inline-flex items-center px-3.5 py-1.5 rounded-xl text-sm font-semibold bg-slate-100 text-slate-800 border border-slate-200"
                                    >
                                        {dom}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveDomain(dom)}
                                            className="ml-2 text-slate-400 hover:text-rose-600 transition-colors"
                                            title="Remove domain"
                                        >
                                            &times;
                                        </button>
                                    </span>
                                ))}
                            </div>

                            <form onSubmit={handleAddDomain} className="flex gap-2 max-w-md pt-2">
                                <input
                                    type="text"
                                    value={newDomainInput}
                                    onChange={(e) => setNewDomainInput(e.target.value)}
                                    placeholder="Add domain, e.g. .ies@ipsacademy.org"
                                    className="flex-1 px-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-medium transition-colors"
                                >
                                    Add
                                </button>
                            </form>
                        </div>

                        {/* Technical Documentation / Architecture Note */}
                        <div className="bg-indigo-50/60 rounded-2xl border border-indigo-100 p-6 flex items-start space-x-4">
                            <Info className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                            <div className="space-y-2 text-xs text-indigo-950">
                                <p className="font-bold text-sm text-indigo-900">How Authentication Flow Works</p>
                                <p>
                                    <strong>1. Registration with OTP:</strong> When any student registers, the backend sends a secure 6-digit verification code using EduSure&apos;s verified Nodemailer SMTP service. Once verified, the student is automatically created in Supabase Auth and given the default student role.
                                </p>
                                <p>
                                    <strong>2. Normal Login (Daily Usage):</strong> Students sign in directly with their email (or username) and password. Everyday sign-in does <em>not</em> trigger OTP emails, ensuring your free daily Gmail SMTP limit (~500 emails/day) is preserved exclusively for student registrations, password resets, and announcements.
                                </p>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminAuthSettings;
