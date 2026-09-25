import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  BookOpen,
  MessageCircle,
  FileQuestion,
  Mail,
  ChevronDown,
  ExternalLink,
  HelpCircle,
  LifeBuoy
} from 'lucide-react';
import Layout from '../components/Layout';
import {
  DashboardCard,
  DashboardButton,
  DashboardBadge
} from '../components/dashboard';

const Help = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "How do I earn EduCoins?",
      a: "You can earn EduCoins by uploading verified study materials, answering peer questions in the Community Hub, and maintaining daily login streaks. High-quality materials that pass committee verification earn generous coin bonuses."
    },
    {
      q: "What types of files can I upload?",
      a: "We currently support PDF, DOC, DOCX, PPT, PPTX, and TXT files. For programming notes or bundled lab assignments, ZIP format is accepted. Maximum file size allowed is 50MB."
    },
    {
      q: "How do I redeem my EduCoins?",
      a: "Navigate to the Rewards center using the sidebar. There you will see a list of available vouchers like Amazon gift cards, food coupons, and platform badges. Click redeem on any available item when you reach the threshold."
    },
    {
      q: "Can I delete or edit a material after uploading?",
      a: "Yes, you can manage your uploads in the 'My Uploads' section. From there, you can view approval statuses, preview your files, or remove them at any time."
    },
    {
      q: "Who can see my community posts?",
      a: "All verified students and academic mentors on the EduSure platform can view and interact with your questions in the Community section. Keep all conversations respectful and academic."
    }
  ];

  const resources = [
    {
      title: "Getting Started Guide",
      icon: BookOpen,
      desc: "Learn how to search notes, download PYQs, and navigate the platform.",
      color: "text-[#2563EB]",
      bg: "bg-blue-50 dark:bg-blue-950/40"
    },
    {
      title: "Upload & Verification Rules",
      icon: FileQuestion,
      desc: "Guidelines for academic accuracy, neat handwriting, and copyright policies.",
      color: "text-[#5B20E8]",
      bg: "bg-purple-50 dark:bg-purple-950/40"
    },
    {
      title: "Student Community Guidelines",
      icon: MessageCircle,
      desc: "Standards for respectful discussion and peer collaboration.",
      color: "text-[#10B981]",
      bg: "bg-emerald-50 dark:bg-emerald-950/40"
    },
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout
      title="Help & Support"
      subtitle="Student documentation, platform FAQs, and academic assistance"
    >
      <div className="max-w-[1720px] mx-auto space-y-6 sm:space-y-8">
        
        {/* Support Search Hero */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#101A63] to-[#1e293b] text-white p-6 sm:p-10 shadow-md">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#2563EB]/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto text-center space-y-4">
            <DashboardBadge variant="neutral" className="bg-white/10 text-white border-white/20">
              Student Knowledge Base
            </DashboardBadge>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              How can we help your studies?
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Browse platform guides, common student inquiries, or submit a support ticket.
            </p>

            <div className="relative max-w-lg mx-auto pt-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search FAQs, upload limits, or EduCoins..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* 2-Column: Quick Guides & FAQs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
          
          {/* Quick Guides & Support Card */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">
              Reference Guides
            </h3>

            <div className="space-y-3">
              {resources.map((res, index) => {
                const Icon = res.icon;
                return (
                  <DashboardCard
                    key={index}
                    className="p-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className={`p-2.5 rounded-xl ${res.bg} ${res.color} shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100 flex items-center justify-between">
                          <span>{res.title}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400 opacity-60" />
                        </h4>
                        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          {res.desc}
                        </p>
                      </div>
                    </div>
                  </DashboardCard>
                );
              })}
            </div>

            {/* Direct Ticket Help Card */}
            <DashboardCard className="p-5 text-center bg-slate-50/70 dark:bg-slate-900/40">
              <div className="mx-auto w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] flex items-center justify-center mb-3">
                <LifeBuoy className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-1">
                Still have unanswered questions?
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                Submit an inquiry directly to the student support team for rapid resolution.
              </p>
              <Link to="/support-center" className="block w-full">
                <DashboardButton variant="primary" className="w-full" icon={Mail}>
                  Open Support Ticket
                </DashboardButton>
              </Link>
            </DashboardCard>
          </div>

          {/* FAQ Accordion List */}
          <div className="lg:col-span-2 space-y-4">
            <DashboardCard className="p-5 sm:p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#2563EB]" /> Frequently Asked Questions
                </h3>
                <span className="text-xs text-slate-400">
                  {filteredFaqs.length} Articles
                </span>
              </div>

              <div className="space-y-3">
                {filteredFaqs.map((faq, index) => {
                  const isOpen = openFaq === index;
                  return (
                    <div
                      key={index}
                      className={`border rounded-xl transition-all ${
                        isOpen
                          ? 'border-blue-200 dark:border-blue-900/60 bg-blue-50/20 dark:bg-blue-950/10'
                          : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                      }`}
                    >
                      <button
                        onClick={() => toggleFaq(index)}
                        className="w-full flex items-center justify-between p-4 text-left focus:outline-none"
                      >
                        <span className={`text-xs sm:text-sm font-semibold ${
                          isOpen ? 'text-[#2563EB] dark:text-blue-400' : 'text-slate-800 dark:text-slate-200'
                        }`}>
                          {faq.q}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 ml-2 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-[#2563EB]' : ''
                        }`} />
                      </button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="px-4 pb-4 pt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100/60 dark:border-slate-800/40"
                          >
                            {faq.a}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}

                {filteredFaqs.length === 0 && (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No FAQs match your search query. Try typing another term or contact support.
                  </div>
                )}
              </div>
            </DashboardCard>
          </div>

        </div>

      </div>
    </Layout>
  );
};

export default Help;
