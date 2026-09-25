import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, FileText, Send, Clock, Ticket, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { supabase } from '../supabaseClient';
import { formatLocalDate } from '../utils/auth';
import {
  DashboardCard,
  DashboardButton,
  DashboardBadge,
  FeedbackState
} from '../components/dashboard';

const SupportHelp = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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
      alert("Could not submit ticket: " + (error.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout
      title="Support Center"
      subtitle="Submit assistance tickets, track inquiries, and resolve account problems"
    >
      <div className="max-w-[1720px] mx-auto space-y-6 sm:space-y-8">
        
        {/* Navigation backbar */}
        <DashboardCard className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                Direct Assistance Desk
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Student tickets are handled by committee administrators within 24-48 hours.
              </p>
            </div>
          </div>
          <Link to="/help">
            <DashboardButton variant="secondary" size="sm">
              View FAQs
            </DashboardButton>
          </Link>
        </DashboardCard>

        {/* 2-Column: Form & Ticket History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-start">
          
          {/* Ticket Submission Form */}
          <DashboardCard className="p-6 sm:p-8">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 mb-5 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#2563EB]" /> Submit a New Ticket
            </h3>

            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Issue Summary
                </label>
                <input
                  required
                  type="text"
                  name="issue"
                  value={newTicket.issue}
                  onChange={handleInputChange}
                  placeholder="e.g. Note download failed or incorrect semester tag"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2563EB] text-slate-900 dark:text-slate-100 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Date Noticed
                </label>
                <input
                  required
                  type="date"
                  name="ticket_date"
                  value={newTicket.ticket_date}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2563EB] text-slate-900 dark:text-slate-100 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Detailed Description
                </label>
                <textarea
                  required
                  rows="4"
                  name="description"
                  value={newTicket.description}
                  onChange={handleInputChange}
                  placeholder="Please describe what happened, URLs if relevant, and error messages..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2563EB] text-slate-900 dark:text-slate-100 resize-none transition-colors"
                />
              </div>

              <DashboardButton
                type="submit"
                variant="primary"
                disabled={submitting}
                loading={submitting}
                icon={Send}
                className="w-full"
              >
                Send Support Request
              </DashboardButton>
            </form>
          </DashboardCard>

          {/* Ticket History */}
          <DashboardCard className="p-6 sm:p-8">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Ticket className="w-4 h-4 text-[#2563EB]" /> My Tickets
              </h3>
              <DashboardBadge variant="neutral">
                {tickets.length} Active
              </DashboardBadge>
            </div>

            {loading ? (
              <FeedbackState
                type="loading"
                title="Loading Inquiries"
                description="Retrieving your past support tickets..."
              />
            ) : tickets.length === 0 ? (
              <FeedbackState
                type="empty"
                title="No Open Support Tickets"
                description="If you experience issues with note downloads or accounts, fill out the form."
              />
            ) : (
              <div className="space-y-3.5 max-h-[460px] overflow-y-auto no-scrollbar">
                {tickets.map(ticket => {
                  const status = (ticket.status || 'open').toLowerCase();
                  return (
                    <div
                      key={ticket.id}
                      className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 space-y-2 hover:bg-white dark:hover:bg-slate-900 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate">
                          {ticket.issue}
                        </h4>
                        <DashboardBadge
                          variant={
                            status === 'resolved' ? 'success' : status === 'open' ? 'warning' : 'neutral'
                          }
                        >
                          {ticket.status || 'Open'}
                        </DashboardBadge>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {ticket.description}
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatLocalDate(ticket.created_at, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="font-mono text-[10px]">
                          #{ticket.id.substring(0, 8)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </DashboardCard>

        </div>

      </div>
    </Layout>
  );
};

export default SupportHelp;
