import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Bell, Settings as SettingsIcon, User, Lock, Shield, CreditCard, BellRing, HelpCircle, Award } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import ResponsiveHeader from '../components/ResponsiveHeader';
import { supabase } from '../supabaseClient';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [userContext, setUserContext] = useState(null);
    const [email, setEmail] = useState('');
    const [coins, setCoins] = useState(0);

    const [profileData, setProfileData] = useState({
        first_name: '',
        last_name: '',
        university: '',
        major: '',
        bio: ''
    });

    const tabs = [
        { id: 'profile', label: 'My Profile', icon: User },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'notifications', label: 'Notifications', icon: BellRing },
        { id: 'billing', label: 'Billing & Plans', icon: CreditCard },
    ];

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserContext(user);
                setEmail(user.email);
                
                const { data, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                    
                if (data && !error) {
                    setCoins(data.coins || 0);
                    setProfileData({
                        first_name: data.first_name || '',
                        last_name: data.last_name || '',
                        university: data.university || '',
                        major: data.major || '',
                        bio: data.bio || ''
                    });
                }
            }
            setLoading(false);
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        if (!userContext) return;
        setSaving(true);
        try {
            const full_name = `${profileData.first_name} ${profileData.last_name}`.trim();
            const { error } = await supabase
                .from('users')
                .update({ 
                    ...profileData, 
                    full_name, 
                    name: full_name 
                })
                .eq('id', userContext.id);

            if (error) throw error;
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile: ' + (error.message || 'Unknown error'));
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAccount = () => {
        if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
            alert('Account deletion request submitted. Support will be in contact shortly to verify deletion.');
        }
    };

    return (
        <SidebarProvider>
            <div className="min-h-screen bg-gray-50 flex">
            <Sidebar />

            <div className="flex-1 flex flex-col lg:ml-60 overflow-hidden">
                <ResponsiveHeader 
                    title="Settings"
                    showSearch={true}
                    showNotifications={true}
                    showProfile={true}
                />

                <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gray-50/50">
                    <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8">
                        
                        {/* Settings Navigation */}
                        <div className="w-full md:w-64 shrink-0">
                            <nav className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2 space-y-1">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${activeTab === tab.id ? 'bg-violet-50 text-violet-700 font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'}`}
                                    >
                                        <tab.icon className={`h-5 w-5 mr-3 ${activeTab === tab.id ? 'text-violet-600' : 'text-gray-400'}`} />
                                        {tab.label}
                                    </button>
                                ))}
                                <div className="my-2 border-t border-gray-100" />
                                <Link to="/help" className="w-full flex items-center px-4 py-3 rounded-xl transition-all text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium">
                                    <HelpCircle className="h-5 w-5 mr-3 text-gray-400" />
                                    Support & Help
                                </Link>
                                <button onClick={handleDeleteAccount} className="w-full flex items-center px-4 py-3 rounded-xl transition-all text-red-600 hover:bg-red-50 font-medium">
                                    <Shield className="h-5 w-5 mr-3 text-red-400" />
                                    Delete Account
                                </button>
                            </nav>
                        </div>

                        {/* Settings Content Area */}
                        <div className="flex-1">
                            {activeTab === 'profile' && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8"
                                >
                                    <h2 className="text-xl font-bold text-gray-800 mb-6">Public Profile</h2>
                                    
                                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 border-b border-gray-50 pb-8">
                                        <div className="relative">
                                            <img src={"https://api.dicebear.com/7.x/avataaars/svg?seed=" + (userContext?.id || "default")} alt="Avatar" className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-violet-100" />
                                            <button className="absolute bottom-0 right-0 bg-violet-600 text-white p-1.5 rounded-full shadow-sm hover:bg-violet-700 transition-colors border-2 border-white">
                                                <SettingsIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <div className="text-center sm:text-left flex-1">
                                            <h3 className="font-bold text-gray-800 text-lg">
                                                {loading ? 'Loading...' : (profileData.first_name || profileData.last_name ? `${profileData.first_name} ${profileData.last_name}` : 'Setup Your Profile')}
                                            </h3>
                                            <p className="text-gray-500 text-sm mt-1">{email}</p>
                                            <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
                                                <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center">Verified Student</span>
                                                <span className="bg-violet-50 text-violet-700 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center"><Award className="w-3 h-3 mr-1" /> {coins} EduCoins</span>
                                            </div>
                                        </div>
                                    </div>

                                    <form onSubmit={handleSaveProfile} className="space-y-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">First Name</label>
                                                <input required type="text" name="first_name" value={profileData.first_name} onChange={handleChange} placeholder="First name" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 bg-gray-50 transition-colors" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
                                                <input required type="text" name="last_name" value={profileData.last_name} onChange={handleChange} placeholder="Last name" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 bg-gray-50 transition-colors" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">University / College</label>
                                                <input type="text" name="university" value={profileData.university} onChange={handleChange} placeholder="e.g. IIIT" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 bg-gray-50 transition-colors" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Major / Branch</label>
                                                <input type="text" name="major" value={profileData.major} onChange={handleChange} placeholder="e.g. Computer Science" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 bg-gray-50 transition-colors" />
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Bio</label>
                                            <textarea name="bio" rows="3" value={profileData.bio} onChange={handleChange} placeholder="Write a short bio about yourself..." className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 bg-gray-50 resize-none transition-colors"></textarea>
                                        </div>

                                        <div className="pt-4 border-t border-gray-50 flex justify-end">
                                            <button type="button" onClick={() => window.location.reload()} disabled={saving} className="px-6 py-2 border border-gray-200 text-gray-600 rounded-xl font-bold mr-3 hover:bg-gray-50 transition-colors disabled:opacity-50">Cancel</button>
                                            <button type="submit" disabled={saving || loading} className="px-6 py-2 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 transition-colors shadow-sm disabled:opacity-50 inline-flex items-center">
                                                {saving ? 'Saving...' : 'Save Changes'}
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            )}

                            {activeTab !== 'profile' && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 flex flex-col items-center justify-center min-h-[400px] text-center"
                                >
                                    <div className="p-4 bg-gray-50 rounded-full mb-4">
                                        {activeTab === 'security' && <Lock className="h-8 w-8 text-gray-400" />}
                                        {activeTab === 'notifications' && <BellRing className="h-8 w-8 text-gray-400" />}
                                        {activeTab === 'billing' && <CreditCard className="h-8 w-8 text-gray-400" />}
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-800 capitalize">{activeTab} Settings</h2>
                                    <p className="text-gray-500 mt-2 max-w-sm">This section is currently under development. Check back later for updates.</p>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
            </div>
        </SidebarProvider>
    );
};

export default Settings;
