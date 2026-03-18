import React, { useState, useEffect } from 'react';
import ResponsiveAdminSidebar from '../../components/admin/ResponsiveAdminSidebar';
import ResponsiveAdminHeader from '../../components/admin/ResponsiveAdminHeader';
import { supabase } from '../../supabaseClient';
import { format } from 'date-fns';
import {
    Search, UserCircle, Coins,
    Shield, Ban, Mail, Calendar
} from 'lucide-react';
import { getDisplayInitial, getDisplayName } from '../../utils/auth';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSuspendUser = async () => {
        alert("Platform suspension requires the Supabase Admin API or a secure Edge Function. This browser view is read-only.");
    };

    const filteredUsers = users.filter((user) =>
        getDisplayName(user, '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <ResponsiveAdminSidebar />
            
            <div className="lg:ml-64 xl:ml-72">
                <ResponsiveAdminHeader 
                    title="User Management" 
                    subtitle="View registered student profiles and account metadata"
                    onMobileMenuToggle={() => {}}
                />
                
                <main className="p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
                        {/* Search Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 lg:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <h2 className="font-semibold text-slate-800 flex items-center">
                                    <UserCircle className="w-5 h-5 mr-2 text-violet-500" />
                                    Registered Users ({filteredUsers.length})
                                </h2>
                                <div className="relative">
                                    <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="Search users by name or email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-violet-500 w-full sm:w-72"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Users Table */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-slate-600">
                                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-3 font-semibold">Student</th>
                                            <th className="px-6 py-3 font-semibold">Contact Info</th>
                                            <th className="px-6 py-3 font-semibold">Role</th>
                                            <th className="px-6 py-3 font-semibold">Coin Balance</th>
                                            <th className="px-6 py-3 font-semibold">Joined Date</th>
                                            <th className="px-6 py-3 font-semibold text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {loading ? (
                                            [1, 2, 3, 4, 5].map((i) => (
                                                <tr key={i} className="animate-pulse">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                                                            <div className="space-y-1">
                                                                <div className="h-4 bg-slate-200 w-24 rounded"></div>
                                                                <div className="h-3 bg-slate-200 w-32 rounded"></div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="h-4 bg-slate-200 w-32 rounded"></div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="h-6 bg-slate-200 w-16 rounded-full"></div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="h-4 bg-slate-200 w-12 rounded"></div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="h-4 bg-slate-200 w-24 rounded"></div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="h-8 bg-slate-200 w-8 rounded ml-auto"></div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : filteredUsers.length > 0 ? (
                                            filteredUsers.map((user) => (
                                                <tr key={user.id} className="hover:bg-slate-50">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                                                {getDisplayInitial(user)}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-slate-900">{getDisplayName(user)}</p>
                                                                <p className="text-sm text-slate-500">@{user.user_name || 'username'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center space-x-2">
                                                            <Mail className="w-4 h-4 text-slate-400" />
                                                            <span className="truncate max-w-[200px]" title={user.email}>{user.email || 'No email provided'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {user.role === 'admin' ? (
                                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-100">
                                                                <Shield className="w-3 h-3 mr-1" /> Admin
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                                                Student
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center font-medium">
                                                            <Coins className="w-4 h-4 mr-1.5 text-yellow-500" />
                                                            {user.coins || 0}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center text-slate-500 whitespace-nowrap">
                                                            <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                                                            {user.created_at ? format(new Date(user.created_at), 'MMM dd, yyyy') : 'Unknown'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        {user.role !== 'admin' && (
                                                            <button
                                                                onClick={() => handleSuspendUser()}
                                                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                                title="Suspend Account"
                                                            >
                                                                <Ban className="w-5 h-5" />
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                                    No users found matching your search criteria.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminUsers;
