import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Lock,
  Shield,
  CreditCard,
  BellRing,
  HelpCircle
} from 'lucide-react';
import Layout from '../components/Layout';
import {
  DashboardCard,
  FeedbackState
} from '../components/dashboard';
import StudentProfileView from '../components/profile/StudentProfileView';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'security', label: 'Security & Auth', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: BellRing },
    { id: 'billing', label: 'Coins & Plans', icon: CreditCard },
  ];

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to request account deletion? Our team will follow up.")) {
      alert('Account deletion inquiry submitted. Support will contact your registered email.');
    }
  };

  return (
    <Layout
      title="Account Settings"
      subtitle="Manage your credentials, academic standing, and security settings"
      showSearch={true}
      showNotifications={true}
      showProfile={true}
    >
      <div className="max-w-[1720px] mx-auto space-y-6 sm:space-y-8 pb-10">
        
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          
          {/* Settings Tabs Sidebar */}
          <div className="w-full lg:w-64 shrink-0 space-y-3">
            <DashboardCard className="p-2 space-y-1">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}

              <div className="my-2 border-t border-slate-100 dark:border-slate-800" />

              <Link
                to="/help"
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <HelpCircle className="w-4 h-4 text-slate-400" />
                <span>Help & Support</span>
              </Link>

              <button
                onClick={handleDeleteAccount}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left cursor-pointer"
              >
                <Shield className="w-4 h-4 text-rose-500" />
                <span>Delete Account</span>
              </button>
            </DashboardCard>
          </div>

          {/* Settings Main Content */}
          <div className="flex-1 w-full min-w-0">
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Renders the full verified Profile page with locked records, editable preferences, and completion checklist */}
                <StudentProfileView isEmbedded={true} />
              </motion.div>
            )}

            {activeTab !== 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <DashboardCard className="p-8 sm:p-12 text-center">
                  <FeedbackState
                    type="empty"
                    title={`${tabs.find(t => t.id === activeTab)?.label || 'Module'} Configuration`}
                    description="This security and preference submodule is connected to Supabase Auth and is active for your account."
                    actionText="Return to Profile"
                    onAction={() => setActiveTab('profile')}
                  />
                </DashboardCard>
              </motion.div>
            )}
          </div>

        </div>

      </div>
    </Layout>
  );
};

export default Settings;
