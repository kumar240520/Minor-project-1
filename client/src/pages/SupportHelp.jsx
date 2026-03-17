import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Bell, HelpCircle, FileText, Send, Clock, CheckCircle, Ticket } from 'lucide-react';
import Sidebar, { SidebarProvider } from '../components/Sidebar';
import ResponsiveHeader from '../components/ResponsiveHeader';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

const SupportHelp = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    // Form state
    const [newTicket, setNewTicket] = useState({
        issue: '',
        description: '',
        ticket_date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('support_tickets')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTickets(data || []);
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewTicket(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmitTicket = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return alert("You must be logged in.");

            const { error } = await supabase
                .from('support_tickets')
                .insert([{ 
                    user_id: user.id,
                    issue: newTicket.issue,
                    description: newTicket.description,
                    ticket_date: newTicket.ticket_date
                }]);

            if (error) throw error;
            
            alert('Support ticket submitted successfully!');
            setNewTicket({
                issue: '',
                description: '',
                ticket_date: new Date().toISOString().split('T')[0]
            });
            fetchTickets();
        } catch (error) {
            console.error("Error submitting ticket:", error);
            alert("Could not submit ticket: " + (error.message || error.details || 'Unknown error'));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SidebarProvider>
            <div className="min-h-screen bg-gray-50 flex">
                <Sidebar />

                <div className="flex-1 flex flex-col lg:ml-0 overflow-hidden">
                    <ResponsiveHeader 
                        title="Support & Help"
                        showSearch={true}
                        showNotifications={true}
                        showProfile={true}
                    />

                    <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gray-50/50">
                        <div className="max-w-5xl mx-auto space-y-8">
                            
                            {/* Header Section */}
                            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center space-x-4">
                                    <div className="bg-violet-100 p-3 rounded-full text-violet-600">
                                        <HelpCircle className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-800">Support Center</h1>
                                        <p className="text-gray-500 mt-1">Submit a ticket for any issues or questions you have.</p>
                                    </div>
                                </div>
                                <Link to="/settings" className="px-5 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors">
                                    Back to Settings
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Ticket Submission Form */}
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8"
                                >
                                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                                        <FileText className="h-5 w-5 mr-2 text-violet-500" />
                                        Submit a Ticket
                                    </h2>

                                    <form onSubmit={handleSubmitTicket} className="space-y-5">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Issue Type</label>
                                            <input 
                                                required 
                                                type="text" 
                                                name="issue" 
                                                value={newTicket.issue} 
                                                onChange={handleInputChange} 
                                                placeholder="e.g., Login Issue, Payment Failed" 
                                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 bg-gray-50 transition-colors" 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Date Occurred</label>
                                            <input 
                                                required 
                                                type="date" 
                                                name="ticket_date" 
                                                value={newTicket.ticket_date} 
                                                onChange={handleInputChange} 
                                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 bg-gray-50 transition-colors" 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                                            <textarea 
                                                required 
                                                name="description" 
                                                rows="4" 
                                                value={newTicket.description} 
                                                onChange={handleInputChange} 
                                                placeholder="Please describe your issue in detail..." 
                                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 bg-gray-50 resize-none transition-colors"
                                            ></textarea>
                                        </div>

                                        <button 
                                            type="submit" 
                                            disabled={submitting} 
                                            className="w-full py-3 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 transition-colors shadow-sm disabled:opacity-50 inline-flex items-center justify-center"
                                        >
                                            {submitting ? 'Submitting...' : <>Submit Ticket <Send className="h-4 w-4 ml-2" /></>}
                                        </button>
                                    </form>
                                </motion.div>

                                {/* My Tickets List */}
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col"
                                >
                                    <div className="p-6 sm:px-8 border-b border-gray-100 bg-gray-50/50">
                                        <h2 className="text-xl font-bold text-gray-800 flex items-center">
                                            <Ticket className="h-5 w-5 mr-2 text-violet-500" />
                                            My Tickets
                                        </h2>
                                    </div>
                                    
                                    <div className="p-6 sm:p-8 flex-1 overflow-y-auto">
                                        {loading ? (
                                            <div className="text-center py-8 text-gray-500">Loading your tickets...</div>
                                        ) : tickets.length === 0 ? (
                                            <div className="text-center py-12 flex flex-col items-center">
                                                <div className="bg-gray-50 p-4 rounded-full mb-4">
                                                    <Ticket className="h-8 w-8 text-gray-300" />
                                                </div>
                                                <h3 className="font-bold text-gray-700">No tickets yet</h3>
                                                <p className="text-sm text-gray-500 mt-1 max-w-xs">You haven't submitted any support tickets. Submit one using the form.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {tickets.map(ticket => (
                                                    <div key={ticket.id} className="p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow bg-white">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h3 className="font-bold text-gray-800 line-clamp-1">{ticket.issue}</h3>
                                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                                ticket.status?.toLowerCase() === 'open' ? 'bg-amber-100 text-amber-700' :
                                                                ticket.status?.toLowerCase() === 'resolved' ? 'bg-emerald-100 text-emerald-700' :
                                                                'bg-gray-100 text-gray-700'
                                                            }`}>
                                                                {ticket.status || 'Open'}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{ticket.description}</p>
                                                        <div className="flex items-center justify-between text-xs text-gray-400">
                                                            <span className="flex items-center">
                                                                <Clock className="w-3.5 h-3.5 mr-1" />
                                                                {new Date(ticket.created_at).toLocaleDateString()}
                                                            </span>
                                                            <span className="font-medium">Ticket #{ticket.id.substring(0, 8)}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            </div>

                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
};

export default SupportHelp;
