import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
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
        <div className="min-h-screen bg-slate-50 flex relative">
            <AdminSidebar />

            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="bg-white border-b border-slate-200 h-20 flex items-center justify-between px-8 shrink-0">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
                        <p className="text-slate-500 text-sm">View registered student profiles and account metadata</p>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search users by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-violet-500 w-72"
                            />
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                            <h2 className="font-semibold text-slate-800 flex items-center">
                                <UserCircle className="w-5 h-5 mr-2 text-violet-500" />
                                Registered Users ({filteredUsers.length})
                            </h2>
                        </div>

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
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                                <div className="animate-pulse space-y-4 max-w-4xl mx-auto">
                                                    <div className="h-4 bg-slate-200 rounded w-full"></div>
                                                    <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                                                    <div className="h-4 bg-slate-200 rounded w-4/6"></div>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center">
                                                <div className="text-slate-500">No users found matching your search.</div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        {user.avatar_url ? (
                                                            <img src={user.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-200 mr-3" />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-bold mr-3 border border-violet-200">
                                                                {getDisplayInitial(user)}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="font-semibold text-slate-900">{getDisplayName(user, 'Anonymous User')}</p>
                                                            <p className="text-xs text-slate-400 font-mono mt-0.5">ID: {String(user.id).slice(0, 8)}...</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center text-slate-600">
                                                        <Mail className="w-4 h-4 mr-2 text-slate-400 shrink-0" />
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
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminUsers;
