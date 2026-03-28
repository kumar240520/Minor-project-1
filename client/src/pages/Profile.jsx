import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Award, BookOpen, Settings, LogOut } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { getDisplayName, getFirstName, getDisplayInitial } from '../utils/auth';

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
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
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
                                    Joined {new Date(userData?.created_at).toLocaleDateString()}
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
                                            className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
                                        >
                                            <Settings className="w-4 h-4 mr-2 inline" />
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
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
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
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                                            />
                                        </div>
                                        <div className="flex space-x-3">
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                type="submit"
                                                className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
                                            >
                                                Save Changes
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                type="button"
                                                onClick={() => setIsEditing(false)}
                                                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                            >
                                                Cancel
                                            </motion.button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-center">
                                            <User className="w-5 h-5 text-gray-400 mr-3" />
                                            <div>
                                                <p className="text-sm text-gray-500">Full Name</p>
                                                <p className="font-medium">{getDisplayName(userData)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <Mail className="w-5 h-5 text-gray-400 mr-3" />
                                            <div>
                                                <p className="text-sm text-gray-500">Email</p>
                                                <p className="font-medium">{userData?.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Stats */}
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 mb-4">Statistics</h3>
                                <div className="space-y-4">
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <div className="flex items-center">
                                            <BookOpen className="w-8 h-8 text-blue-600 mr-3" />
                                            <div>
                                                <p className="text-2xl font-bold text-blue-600">0</p>
                                                <p className="text-sm text-gray-600">Notes Uploaded</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-green-50 p-4 rounded-lg">
                                        <div className="flex items-center">
                                            <Award className="w-8 h-8 text-green-600 mr-3" />
                                            <div>
                                                <p className="text-2xl font-bold text-green-600">0</p>
                                                <p className="text-sm text-gray-600">Edu Coins</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Logout Button */}
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleLogout}
                                    className="w-full mt-6 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center"
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Log Out
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Profile;
