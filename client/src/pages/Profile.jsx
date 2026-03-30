import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Award, BookOpen, Settings, LogOut } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { getDisplayName, getFirstName, getDisplayInitial, formatLocalDate } from '../utils/auth';
import Sidebar, { SidebarProvider } from '../components/Sidebar';
import ResponsiveHeader from '../components/ResponsiveHeader';

const Profile = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        email: ''
    });

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { data: profile } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            setUserData({ ...user, ...profile });
            setFormData({
                full_name: profile?.full_name || user.user_metadata?.full_name || '',
                email: user.email
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            // Update auth metadata
            await supabase.auth.updateUser({
                data: { full_name: formData.full_name }
            });

            // Update users table
            await supabase
                .from('users')
                .upsert({
                    id: user.id,
                    full_name: formData.full_name,
                    updated_at: new Date().toISOString()
                });

            setIsEditing(false);
            fetchUserProfile();
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
            </div>
        );
    }

    return (
        <SidebarProvider>
            <div className="min-h-screen bg-gray-50 flex">
                <Sidebar />
                
                <div className="flex-1 flex flex-col lg:ml-60 overflow-hidden">
                    <ResponsiveHeader 
                        title="My Profile" 
                        showSearch={true}
                        showNotifications={true}
                        showProfile={true}
                    />

                    <main className="flex-1 overflow-y-auto p-4 sm:p-8">
                        <div className="max-w-4xl mx-auto">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-2xl shadow-xl overflow-hidden"
                            >
                                {/* Header */}
                                <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-8 text-white">
                                    <div className="flex items-center space-x-6">
                                        <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                            <span className="text-3xl font-bold">
                                                {getDisplayInitial(userData)}
                                            </span>
                                        </div>
                                        <div>
                                            <h1 className="text-3xl font-bold">
                                                {getDisplayName(userData)}
                                            </h1>
                                            <p className="text-violet-100">{userData?.email}</p>
                                            <div className="flex items-center mt-2 text-sm">
                                                <Calendar className="w-4 h-4 mr-1" />
                                                Joined {formatLocalDate(userData?.created_at, { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-8">
                                    <div className="grid md:grid-cols-3 gap-8">
                                        {/* Main Profile */}
                                        <div className="md:col-span-2">
                                            <div className="flex items-center justify-between mb-6">
                                                <h2 className="text-2xl font-bold text-gray-800">Profile Information</h2>
                                                {!isEditing && (
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => setIsEditing(true)}
                                                        className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 font-bold shadow-sm inline-flex items-center"
                                                    >
                                                        <Settings className="w-4 h-4 mr-2" />
                                                        Edit Profile
                                                    </motion.button>
                                                )}
                                            </div>

                                            {isEditing ? (
                                                <form onSubmit={handleUpdateProfile} className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Full Name
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={formData.full_name}
                                                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-gray-50"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Email
                                                        </label>
                                                        <input
                                                            type="email"
                                                            value={formData.email}
                                                            disabled
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                                                        />
                                                    </div>
                                                    <div className="flex space-x-3 pt-4">
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            type="submit"
                                                            className="px-6 py-2 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 shadow-md"
                                                        >
                                                            Save Changes
                                                        </motion.button>
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            type="button"
                                                            onClick={() => setIsEditing(false)}
                                                            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300"
                                                        >
                                                            Cancel
                                                        </motion.button>
                                                    </div>
                                                </form>
                                            ) : (
                                                <div className="space-y-6">
                                                    <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                                                        <User className="w-5 h-5 text-violet-500 mr-4" />
                                                        <div>
                                                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Full Name</p>
                                                            <p className="font-semibold text-gray-800">{getDisplayName(userData)}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                                                        <Mail className="w-5 h-5 text-violet-500 mr-4" />
                                                        <div>
                                                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Email Address</p>
                                                            <p className="font-semibold text-gray-800">{userData?.email}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Stats */}
                                        <div className="space-y-6">
                                            <h3 className="text-xl font-bold text-gray-800">Platform Stats</h3>
                                            <div className="space-y-4">
                                                <div className="bg-blue-50/80 p-5 rounded-2xl border border-blue-100 shadow-sm">
                                                    <div className="flex items-center">
                                                        <div className="bg-blue-600 p-2.5 rounded-xl mr-4 shadow-blue-200 shadow-lg">
                                                            <BookOpen className="w-5 h-5 text-white" />
                                                        </div>
                                                        <div>
                                                            <p className="text-2xl font-black text-blue-700">0</p>
                                                            <p className="text-xs font-bold text-blue-500 uppercase">Materials</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="bg-emerald-50/80 p-5 rounded-2xl border border-emerald-100 shadow-sm">
                                                    <div className="flex items-center">
                                                        <div className="bg-emerald-600 p-2.5 rounded-xl mr-4 shadow-emerald-200 shadow-lg">
                                                            <Award className="w-5 h-5 text-white" />
                                                        </div>
                                                        <div>
                                                            <p className="text-2xl font-black text-emerald-700">0</p>
                                                            <p className="text-xs font-bold text-emerald-500 uppercase">EduCoins</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Logout Button */}
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={handleLogout}
                                                className="w-full mt-8 px-6 py-4 bg-red-50 text-red-600 rounded-2xl font-black hover:bg-red-100 flex items-center justify-center transition-colors border border-red-200"
                                            >
                                                <LogOut className="w-5 h-5 mr-3" />
                                                Log Out Account
                                            </motion.button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
};

export default Profile;
