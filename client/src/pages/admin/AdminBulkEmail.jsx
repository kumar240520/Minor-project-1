import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, Users, Calendar, FileText, BarChart3, Plus, Edit2, Trash2, Eye, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import ResponsiveAdminSidebar from '../../components/admin/ResponsiveAdminSidebar';
import ResponsiveAdminHeader from '../../components/admin/ResponsiveAdminHeader';

const AdminBulkEmail = () => {
    const [activeTab, setActiveTab] = useState('compose');
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [emailData, setEmailData] = useState({
        subject: '',
        content: '',
        template: ''
    });
    const [templates, setTemplates] = useState([]);
    const [isSending, setIsSending] = useState(false);
    const [sendProgress, setSendProgress] = useState(0);
    const [emailHistory, setEmailHistory] = useState([]);
    const [showPreview, setShowPreview] = useState(false);
    const [targetAudience, setTargetAudience] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [displayedUsers, setDisplayedUsers] = useState([]);
    
    // Template creation states
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [newTemplateForm, setNewTemplateForm] = useState({ name: '', subject: '', content: '' });

    useEffect(() => {
        fetchUsers();
        fetchTemplates();
        fetchEmailHistory();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('id, email, full_name, role, created_at')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data || []);
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

    const handleAudienceChange = (audience) => {
        setTargetAudience(audience);
        setSearchTerm(''); // Clear search when changing audience
        
        if (audience === 'all') {
            setSelectedUsers(users.map(user => user.id));
        } else if (audience === 'students') {
            setSelectedUsers(users.filter(user => user.role === 'student').map(user => user.id));
        } else if (audience === 'admins') {
            setSelectedUsers(users.filter(user => user.role === 'admin').map(user => user.id));
        } else {
            setSelectedUsers([]); // For custom selection, start with empty selection
        }
    };

    const handleTemplateSelect = (template) => {
        setEmailData({
            ...emailData,
            subject: template.subject,
            content: template.content,
            template: template.id
        });
    };

    const openSaveTemplateModal = () => {
        setNewTemplateForm({
            name: '',
            subject: emailData.subject,
            content: emailData.content
        });
        setShowTemplateModal(true);
    };

    const confirmSaveTemplate = async () => {
        if (!newTemplateForm.name || !newTemplateForm.subject || !newTemplateForm.content) {
            alert('Please fill in all template fields (Name, Subject, Content).');
            return;
        }

        try {
            const { error } = await supabase
                .from('email_templates')
                .insert({
                    name: newTemplateForm.name,
                    subject: newTemplateForm.subject,
                    content: newTemplateForm.content
                });

            if (error) throw error;
            alert('Template saved successfully!');
            setShowTemplateModal(false);
            setNewTemplateForm({ name: '', subject: '', content: '' });
            fetchTemplates();
        } catch (error) {
            console.error('Error saving template:', error);
            alert('Failed to save template');
        }
    };

    const sendBulkEmail = async () => {
        if (!emailData.subject || !emailData.content || selectedUsers.length === 0) {
            alert('Please fill in all fields and select recipients');
            return;
        }

        console.log('Starting bulk email send:', {
            subject: emailData.subject,
            selectedUsersCount: selectedUsers.length,
            contentLength: emailData.content.length
        });

        setIsSending(true);
        setSendProgress(0);

        try {
            const recipients = users.filter(user => selectedUsers.includes(user.id));
            console.log('Filtered recipients:', recipients.length);
            
            const batchSize = 10;
            const batches = [];
            
            for (let i = 0; i < recipients.length; i += batchSize) {
                batches.push(recipients.slice(i, i + batchSize));
            }

            console.log('Created batches:', batches.length);

            const { data: campaign, error: campaignError } = await supabase
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
            console.log('Campaign created:', campaign.id);

            for (let i = 0; i < batches.length; i++) {
                const batch = batches[i];
                const emails = batch.map(user => user.email);
                
                console.log(`Sending batch ${i + 1}/${batches.length} with ${emails.length} emails`);

                const session = await supabase.auth.getSession();
                const token = session.data?.session?.access_token;
                
                if (!token) {
                    throw new Error('No authentication token available');
                }

                const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const requestBody = {
                    campaignId: campaign.id,
                    recipients: emails,
                    subject: emailData.subject,
                    content: emailData.content
                };
                
                console.log('[FRONTEND DEBUG] Sending email with content:', JSON.stringify(emailData.content));
                console.log('[FRONTEND DEBUG] Content length:', emailData.content?.length);
                console.log('[FRONTEND DEBUG] Content type:', typeof emailData.content);
                console.log('[FRONTEND DEBUG] Full request body:', JSON.stringify(requestBody));

                const response = await fetch(`${API_BASE}/api/admin/bulk-email`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(requestBody)
                });

                console.log(`Batch ${i + 1} response status:`, response.status);

                if (!response.ok) {
                    let errorData;
                    try {
                        const responseClone = response.clone();
                        errorData = await responseClone.json();
                    } catch (jsonError) {
                        // If response is not JSON, get text instead
                        const responseClone = response.clone();
                        const errorText = await responseClone.text();
                        errorData = { message: errorText || 'Unknown server error' };
                    }
                    console.error('Batch error response:', errorData);
                    throw new Error(`Failed to send email batch: ${errorData.message || 'Unknown error'}`);
                }

                let responseData;
                try {
                    const responseClone = response.clone();
                    responseData = await responseClone.json();
                } catch (jsonError) {
                    // If response is not JSON, create a default success response
                    responseData = { success: true, message: 'Batch processed' };
                }
                console.log(`Batch ${i + 1} success:`, responseData);

                setSendProgress(Math.round(((i + 1) / batches.length * 100)));
                
                if (i < batches.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }

            await supabase
                .from('email_campaigns')
                .update({ status: 'sent', sent_at: new Date().toISOString() })
                .eq('id', campaign.id);

            alert(`Email sent successfully to ${selectedUsers.length} users!`);
            setEmailData({ subject: '', content: '', template: '' });
            setSelectedUsers([]);
            fetchEmailHistory();
            
        } catch (error) {
            console.error('Error sending bulk email:', error);
            alert(`Failed to send email: ${error.message}`);
        } finally {
            setIsSending(false);
            setSendProgress(0);
        }
    };

    const deleteTemplate = async (templateId) => {
        if (!confirm('Are you sure you want to delete this template?')) return;

        try {
            const { error } = await supabase
                .from('email_templates')
                .delete()
                .eq('id', templateId);

            if (error) throw error;
            alert('Template deleted successfully!');
            fetchTemplates();
        } catch (error) {
            console.error('Error deleting template:', error);
            alert('Failed to delete template');
        }
    };

    // Search and filter users
    useEffect(() => {
        let filtered = users;
        
        // First apply audience filter
        if (targetAudience === 'students') {
            filtered = users.filter(user => user.role === 'student');
        } else if (targetAudience === 'admins') {
            filtered = users.filter(user => user.role === 'admin');
        } else if (targetAudience === 'custom') {
            // For custom selection, show all users initially, then apply search
            filtered = users;
        } else {
            // 'all' - show all users
            filtered = users;
        }

        // Then apply search filter
        if (searchTerm) {
            filtered = filtered.filter(user => 
                user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setDisplayedUsers(filtered);
    }, [users, targetAudience, searchTerm]); // Remove selectedUsers from dependencies

    const filteredUsers = targetAudience === 'custom' 
        ? displayedUsers.filter(user => selectedUsers.includes(user.id))
        : displayedUsers;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
            <ResponsiveAdminSidebar />
            
            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:ml-64 xl:ml-72 overflow-hidden">
                <ResponsiveAdminHeader 
                    title="Bulk Email System" 
                    subtitle="Send emails to users and manage email campaigns"
                    onMobileMenuToggle={() => {}}
                />
                
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                            <div className="border-b border-slate-200 p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => setShowPreview(!showPreview)}
                                            className="flex items-center px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                                        >
                                            <Eye className="h-4 w-4 mr-2" />
                                            {showPreview ? 'Edit' : 'Preview'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="border-b border-slate-200">
                                <nav className="flex space-x-8 px-6">
                                    {['compose', 'templates', 'history', 'analytics'].map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                                activeTab === tab
                                                    ? 'border-violet-600 text-violet-600'
                                                    : 'border-transparent text-slate-500 hover:text-slate-700'
                                            }`}
                                        >
                                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            <div className="p-6">
                        {activeTab === 'compose' && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                                    <div className="grid grid-cols-4 gap-3">
                                        {[
                                            { value: 'all', label: 'All Users', icon: Users, count: users.length },
                                            { value: 'students', label: 'Students Only', icon: Users, count: users.filter(u => u.role === 'student').length },
                                            { value: 'admins', label: 'Admins Only', icon: Users, count: users.filter(u => u.role === 'admin').length },
                                            { value: 'custom', label: 'Custom Selection', icon: Users, count: selectedUsers.length }
                                        ].map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => handleAudienceChange(option.value)}
                                                className={`p-4 border rounded-lg text-left transition-colors ${
                                                    targetAudience === option.value
                                                        ? 'border-violet-600 bg-violet-50 text-violet-600'
                                                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                                }`}
                                            >
                                                <option.icon className="h-5 w-5 mb-2" />
                                                <div className="font-medium">{option.label}</div>
                                                <div className="text-sm text-gray-500">{option.count} users</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Search Bar */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Search Users</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full px-3 py-2 pl-10 border border-gray-200 rounded-lg focus:ring-violet-500 focus:border-violet-500"
                                            placeholder="Search by name or email..."
                                        />
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Users className="h-5 w-5 text-gray-400" />
                                        </div>
                                    </div>
                                </div>

                                {/* Search Results - Show for custom selection OR when searching */}
                                {(targetAudience === 'custom' || searchTerm) && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {targetAudience === 'custom' ? 'Select Users' : `Search Results (${displayedUsers.length} found)`}
                                        </label>
                                        <div className="border border-gray-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                                            <div className="mb-3 text-sm text-gray-600">
                                                {targetAudience === 'custom' 
                                                    ? `Showing ${displayedUsers.length} users`
                                                    : `Found ${displayedUsers.length} users${searchTerm ? ` matching "${searchTerm}"` : ''}`
                                                }
                                            </div>
                                            {displayedUsers.length === 0 ? (
                                                <div className="text-center py-8 text-gray-500">
                                                    <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                                    <p>No users found</p>
                                                    {searchTerm && (
                                                        <button
                                                            onClick={() => setSearchTerm('')}
                                                            className="mt-2 text-violet-600 hover:text-violet-700 text-sm"
                                                        >
                                                            Clear search
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-2 gap-2">
                                                    {displayedUsers.map((user) => (
                                                        <label key={user.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedUsers.includes(user.id)}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        setSelectedUsers([...selectedUsers, user.id]);
                                                                    } else {
                                                                        setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                                                                    }
                                                                }}
                                                                className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                                                            />
                                                            <div>
                                                                <div className="font-medium text-gray-900">{user.full_name || user.email}</div>
                                                                <div className="text-sm text-gray-500">{user.email}</div>
                                                                <div className="text-xs text-gray-400">{user.role}</div>
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Quick Actions for Search */}
                                {searchTerm && (
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="text-sm text-gray-600">
                                            Found {displayedUsers.length} users matching "{searchTerm}"
                                        </div>
                                        <div className="space-x-2">
                                            <button
                                                onClick={() => {
                                                    const newSelected = [...new Set([...selectedUsers, ...displayedUsers.map(u => u.id)])];
                                                    setSelectedUsers(newSelected);
                                                }}
                                                className="px-3 py-1 bg-violet-600 text-white text-sm rounded hover:bg-violet-700"
                                            >
                                                Select All Results
                                            </button>
                                            <button
                                                onClick={() => setSearchTerm('')}
                                                className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                                            >
                                                Clear Search
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                                        <input
                                            type="text"
                                            value={emailData.subject}
                                            onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-violet-500 focus:border-violet-500"
                                            placeholder="Enter email subject..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Template</label>
                                        <select
                                            value={emailData.template}
                                            onChange={(e) => {
                                                const template = templates.find(t => t.id === e.target.value);
                                                if (template) handleTemplateSelect(template);
                                            }}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-violet-500 focus:border-violet-500"
                                        >
                                            <option value="">Select template...</option>
                                            {templates.map((template) => (
                                                <option key={template.id} value={template.id}>
                                                    {template.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                                    <textarea
                                        value={emailData.content}
                                        onChange={(e) => setEmailData({ ...emailData, content: e.target.value })}
                                        rows={8}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-violet-500 focus:border-violet-500"
                                        placeholder="Write your email content here. Spaces and line breaks will be preserved perfectly."
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <button
                                            onClick={openSaveTemplateModal}
                                            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                        >
                                            <FileText className="h-4 w-4 mr-2" />
                                            Save Template
                                        </button>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="text-sm text-gray-500">
                                            {selectedUsers.length} recipients selected
                                        </div>
                                        <button
                                            onClick={sendBulkEmail}
                                            disabled={isSending || !emailData.subject || !emailData.content || selectedUsers.length === 0}
                                            className="flex items-center px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSending ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Sending... {sendProgress}%
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="h-4 w-4 mr-2" />
                                                    Send Email
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {isSending && (
                                    <div className="mt-4">
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-violet-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${sendProgress}%` }}
                                            />
                                        </div>
                                        <div className="text-center text-sm text-gray-600 mt-2">
                                            Sending progress: {sendProgress}%
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'templates' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900">Email Templates</h2>
                                    <button
                                        onClick={() => {
                                            setNewTemplateForm({ name: '', subject: '', content: '' });
                                            setShowTemplateModal(true);
                                        }}
                                        className="flex items-center px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        New Template
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {templates.map((template) => (
                                        <div key={template.id} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <h3 className="font-medium text-gray-900">{template.name}</h3>
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => handleTemplateSelect(template)}
                                                        className="text-blue-600 hover:text-blue-700"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteTemplate(template.id)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-600 mb-2">{template.subject}</div>
                                            <div className="text-sm text-gray-500 line-clamp-3 whitespace-pre-wrap mt-1">{template.content}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'history' && (
                            <div className="space-y-4">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">Email History</h2>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipients</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {emailHistory.map((campaign) => (
                                                <tr key={campaign.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{campaign.subject}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.recipient_count}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                            campaign.status === 'sent' 
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                            {campaign.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(campaign.sent_at || campaign.created_at).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'analytics' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold text-gray-900">Email Analytics</h2>
                                <div className="grid grid-cols-4 gap-6">
                                    <div className="bg-white p-6 border border-gray-200 rounded-lg">
                                        <div className="flex items-center">
                                            <div className="p-2 bg-violet-100 rounded-lg">
                                                <Mail className="h-6 w-6 text-violet-600" />
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-500">Total Sent</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {emailHistory.reduce((sum, campaign) => sum + (campaign.recipient_count || 0), 0)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white p-6 border border-gray-200 rounded-lg">
                                        <div className="flex items-center">
                                            <div className="p-2 bg-green-100 rounded-lg">
                                                <CheckCircle className="h-6 w-6 text-green-600" />
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-500">Successful</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {emailHistory.filter(c => c.status === 'sent').length}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white p-6 border border-gray-200 rounded-lg">
                                        <div className="flex items-center">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <Users className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-500">Total Users</p>
                                                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white p-6 border border-gray-200 rounded-lg">
                                        <div className="flex items-center">
                                            <div className="p-2 bg-yellow-100 rounded-lg">
                                                <BarChart3 className="h-6 w-6 text-yellow-600" />
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-500">Avg Recipients</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {emailHistory.length > 0 
                                                        ? Math.round(emailHistory.reduce((sum, c) => sum + (c.recipient_count || 0), 0) / emailHistory.length)
                                                        : 0}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* New Template Modal */}
            {showTemplateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100"
                    >
                        <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center">
                                <FileText className="h-5 w-5 mr-2 text-violet-600" />
                                Save Email Template
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Template Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={newTemplateForm.name}
                                    onChange={(e) => setNewTemplateForm({ ...newTemplateForm, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-violet-500 focus:border-violet-500"
                                    placeholder="e.g. Monthly Newsletter, Payment Reminder..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Line <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={newTemplateForm.subject}
                                    onChange={(e) => setNewTemplateForm({ ...newTemplateForm, subject: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-violet-500 focus:border-violet-500"
                                    placeholder="Email subject..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Content <span className="text-red-500">*</span></label>
                                <textarea
                                    value={newTemplateForm.content}
                                    onChange={(e) => setNewTemplateForm({ ...newTemplateForm, content: e.target.value })}
                                    rows={8}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-violet-500 focus:border-violet-500"
                                    placeholder="Email content..."
                                />
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-100 flex justify-end space-x-3 bg-gray-50">
                            <button
                                onClick={() => setShowTemplateModal(false)}
                                className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmSaveTemplate}
                                className="px-5 py-2.5 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors shadow-sm"
                            >
                                Save Template
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
                </main>
            </div>
        </div>
    );
};

export default AdminBulkEmail;
