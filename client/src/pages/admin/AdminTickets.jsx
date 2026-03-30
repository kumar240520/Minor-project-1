import React, { useState, useEffect } from 'react';
import { HelpCircle, Clock, CheckCircle, Trash2, ShieldAlert } from 'lucide-react';
import AdminSidebar from '../../components/admin/ResponsiveAdminSidebar';
import ResponsiveAdminHeader from '../../components/admin/ResponsiveAdminHeader';
import { supabase } from '../../supabaseClient';
import { formatLocalRelativeTime } from '../../utils/auth';

const AdminTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [resolvingId, setResolvingId] = useState(null);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const { data, error } = await supabase
                .from('support_tickets')
                .select(`
                    *,
                    users!support_tickets_user_id_fkey(full_name, email)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTickets(data || []);
        } catch (error) {
            console.error('Error fetching admin tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleResolveTicket = async (id) => {
        setResolvingId(id);
        try {
            const { error } = await supabase
                .from('support_tickets')
                .update({ status: 'Resolved' })
                .eq('id', id);

            if (error) throw error;
            fetchTickets();
        } catch (error) {
            console.error('Error resolving ticket:', error);
            alert('Could not resolve ticket.');
        } finally {
            setResolvingId(null);
        }
    };

    const handleDeleteTicket = async (id) => {
        if (!window.confirm("Delete this ticket?")) return;
        try {
            const { error } = await supabase
                .from('support_tickets')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setTickets(prev => prev.filter(t => t.id !== id));
        } catch (error) {
            console.error('Error deleting ticket:', error);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <AdminSidebar />

            <div className="flex-1 flex flex-col lg:ml-64 xl:ml-72 overflow-hidden">
                <ResponsiveAdminHeader 
                    title="Support Tickets" 
                    subtitle="Manage user support requests and issues"
                    onMobileMenuToggle={() => {}}
                />

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Ticket / User</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Issue Date</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-100">
                                        {loading ? (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-8 text-center text-slate-500">Loading tickets...</td>
                                            </tr>
                                        ) : tickets.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-12 text-center flex flex-col items-center">
                                                    <div className="bg-slate-50 p-4 rounded-full mb-3">
                                                        <HelpCircle className="w-8 h-8 text-slate-400" />
                                                    </div>
                                                    <span className="text-slate-600 font-medium">No active support tickets</span>
                                                    <span className="text-sm text-slate-400 mt-1">When users submit a ticket, it will appear here.</span>
                                                </td>
                                            </tr>
                                        ) : tickets.map((ticket) => (
                                            <tr key={ticket.id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-slate-900">{ticket.issue}</span>
                                                        <span className="text-sm text-slate-500 mt-1 max-w-sm truncate" title={ticket.description}>
                                                            {ticket.description}
                                                        </span>
                                                        <span className="text-xs text-violet-600 mt-2 font-medium">
                                                            User: {ticket.users?.full_name || ticket.users?.email || 'Unknown User'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center text-slate-600">
                                                        <Clock className="w-4 h-4 mr-2 text-slate-400" />
                                                        {ticket.ticket_date}
                                                    </div>
                                                    <div className="text-xs text-slate-400 mt-1">
                                                        Submitted: {formatLocalRelativeTime(ticket.created_at)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                                                        ticket.status === 'Resolved' 
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                                            : 'bg-amber-50 text-amber-700 border-amber-200'
                                                    }`}>
                                                        {ticket.status === 'Resolved' && <CheckCircle className="w-3.5 h-3.5 mr-1.5" />}
                                                        {ticket.status || 'Open'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                                                    <div className="flex items-center justify-end space-x-3">
                                                        {ticket.status !== 'Resolved' && (
                                                            <button
                                                                onClick={() => handleResolveTicket(ticket.id)}
                                                                disabled={resolvingId === ticket.id}
                                                                className="text-violet-600 hover:text-violet-900 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg transition-colors text-sm font-semibold disabled:opacity-50"
                                                            >
                                                                {resolvingId === ticket.id ? 'Resolving...' : 'Resolve'}
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDeleteTicket(ticket.id)}
                                                            className="text-slate-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                                            title="Delete Ticket"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
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

export default AdminTickets;
