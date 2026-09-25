import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Gift, Zap, TrendingUp, ChevronRight, Share2, Clock, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import Layout from '../components/Layout';
import { supabase } from '../supabaseClient';
import { formatLocalRelativeTime, getDisplayName, initializeStudentProfileForUser } from '../utils/auth';
import {
  DashboardCard,
  MetricCard,
  DashboardButton,
  DashboardBadge,
  FeedbackState
} from '../components/dashboard';

const Rewards = () => {
  const [userData, setUserData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claimingDaily, setClaimingDaily] = useState(false);
  const [dailyClaimed, setDailyClaimed] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRewardsData = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw authError || new Error("Not logged in");

        let profileData;
        try {
          const result = await supabase
            .from('users')
            .select('id, name, coins, last_login_reward, email, role')
            .eq('id', user.id)
            .single();
          profileData = result.data;
        } catch (err) {
          console.warn('Profile fetch warning:', err);
        }

        if (!profileData) {
          try {
            profileData = await initializeStudentProfileForUser(user);
          } catch (createError) {
            profileData = {
              id: user.id,
              email: user.email,
              name: getDisplayName(user, 'Student'),
              role: 'student',
              coins: 0,
              last_login_reward: null
            };
          }
        }

        setUserData(profileData);

        const today = new Date().toISOString().split('T')[0];
        const lastClaim = profileData?.last_login_reward?.split('T')[0];
        setDailyClaimed(lastClaim === today);

        try {
          const { data: txData, error: txError } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20);

          if (!txError && txData) {
            setTransactions(txData);
          }
        } catch (txErr) {
          console.log("[Rewards] Transaction fetch error:", txErr.message);
        }

      } catch (err) {
        console.error('Error fetching rewards data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRewardsData();
  }, []);

  const handleDailyClaim = async () => {
    if (!userData || claimingDaily || dailyClaimed) return;

    setClaimingDaily(true);
    setError(null);

    try {
      const response = await fetch('/api/rewards/daily-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userData.id })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to claim daily reward');
      }

      const result = await response.json();

      if (result.success === false) {
        setDailyClaimed(true);
        setError(result.message);
        return;
      }

      if (result.success === true) {
        setUserData(prev => ({
          ...prev,
          coins: result.coins || prev.coins + 2,
          last_login_reward: new Date().toISOString()
        }));
        setDailyClaimed(true);

        const newTransaction = {
          id: Date.now(),
          description: 'Daily login bonus',
          transaction_type: 'EARN',
          amount: result.rewardAmount || 2,
          created_at: new Date().toISOString()
        };

        setTransactions(prev => [newTransaction, ...prev]);
        alert('🎉 Successfully claimed 2 Edu Coins!');
      }
    } catch (err) {
      console.error('Daily claim error:', err);
      if (!err.message.includes('already claimed')) {
        alert(err.message || 'Failed to claim daily reward');
      }
    } finally {
      setClaimingDaily(false);
    }
  };

  const formatTransaction = (tx) => {
    const txType = (tx.type || '').toUpperCase();
    const txTransactionType = (tx.transaction_type || '').toUpperCase();
    const txSource = (tx.source || tx.reference_type || '').toUpperCase();

    const earnTypes = ['EARN', 'REWARD', 'RECEIVE'];
    const earnSources = ['MATERIAL_APPROVAL', 'PYQ_APPROVAL', 'ANSWER_ACCEPTED', 'DAILY_LOGIN', 'RESOURCE_SALE', 'MATERIAL_SALE', 'EVENT_ATTENDANCE', 'FIAT_PURCHASE'];

    const isEarn = earnTypes.includes(txType) || earnTypes.includes(txTransactionType) || earnSources.includes(txSource);

    const getTransactionName = () => {
      if (tx.description && tx.description.trim() !== '') return tx.description;
      const sourceNames = {
        'PYQ_APPROVAL': 'PYQ Approved',
        'MATERIAL_APPROVAL': 'Material Approved',
        'MATERIAL_SALE': 'Material Sold',
        'RESOURCE_SALE': 'Material Sold',
        'RESOURCE_PURCHASE': 'Material Purchased',
        'PURCHASE': 'Purchase Made',
        'DAILY_LOGIN': 'Daily Login Bonus',
        'ANSWER_ACCEPTED': 'Answer Accepted',
        'EVENT_ATTENDANCE': 'Event Attendance',
        'FIAT_PURCHASE': 'Coins Purchased'
      };
      return sourceNames[txSource] || 'Activity Reward';
    };

    return {
      id: tx.id,
      action: getTransactionName(),
      points: isEarn ? `+${tx.amount}` : `-${tx.amount}`,
      date: formatLocalRelativeTime(tx.created_at),
      isEarn
    };
  };

  const rewards = [
    { id: 1, title: 'Amazon Gift Card ₹500', cost: 2000, img: 'https://images.unsplash.com/photo-1620189507195-68309c04c4d0?w=500&q=80', available: true },
    { id: 2, title: 'Spotify Premium (1 Month)', cost: 1200, img: 'https://images.unsplash.com/photo-1614680376593-902f74a6cecb?w=500&q=80', available: true },
    { id: 3, title: 'EduSure Pro Campus Badge', cost: 500, img: 'https://images.unsplash.com/photo-1558591710-4b4a1eb0f3b5?w=500&q=80', available: true },
    { id: 4, title: 'Swiggy Food Voucher ₹200', cost: 800, img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80', available: false },
  ];

  return (
    <Layout
      title="Rewards & EduCoins"
      subtitle="Redeem earned study coins for vouchers, subscriptions, and platform perks"
    >
      <div className="max-w-[1720px] mx-auto space-y-6 sm:space-y-8">
        
        {/* Balance Hero Card */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 text-white p-6 sm:p-8 shadow-md">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-md border border-white/25 shadow-inner">
                <Award className="h-9 w-9 sm:h-11 sm:w-11 text-white" />
              </div>
              <div>
                <p className="text-amber-100 font-semibold uppercase tracking-wider text-xs">
                  Available Student Balance
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
                    {loading ? '...' : (userData?.coins !== undefined ? userData.coins.toLocaleString() : '0')}
                  </h1>
                  <span className="text-lg sm:text-xl font-medium text-amber-100">
                    EduCoins
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <button
                onClick={handleDailyClaim}
                disabled={claimingDaily || dailyClaimed || !userData}
                className={`font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm ${
                  dailyClaimed
                    ? 'bg-emerald-500 text-white cursor-default'
                    : 'bg-white text-orange-600 hover:bg-orange-50 active:scale-95'
                } ${claimingDaily ? 'opacity-80 cursor-wait' : ''}`}
              >
                {claimingDaily ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Claiming...</>
                ) : dailyClaimed ? (
                  <><CheckCircle2 className="h-4 w-4" /> Claimed Today</>
                ) : (
                  <><Gift className="h-4 w-4" /> Daily Bonus (+2)</>
                )}
              </button>

              <button
                onClick={() => alert("Select a voucher below to redeem your coins!")}
                className="font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="h-4 w-4" /> Explore Catalog
              </button>
            </div>
          </div>
        </div>

        {/* 2-Column: Activity & Catalog */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
          
          {/* Main Column: Earning Opportunities & History */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Quick Opportunities */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DashboardCard className="p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">
                    <Share2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      Peer Referral
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Invite a classmate to join EduSure and earn 50 EduCoins upon their first verified upload.
                    </p>
                  </div>
                </div>
              </DashboardCard>

              <DashboardCard className="p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-[#10B981] dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      Weekly Study Streaks
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Log in 5 days a week and contribute 1 verified note to claim a 25 EduCoin booster.
                    </p>
                  </div>
                </div>
              </DashboardCard>
            </div>

            {/* Coin History */}
            <DashboardCard className="overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800/80 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                    Coin Transaction History
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    Recent balance accruals, uploads, and daily reward claims
                  </p>
                </div>
                <DashboardBadge variant="neutral">
                  {transactions.length} Records
                </DashboardBadge>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-96 overflow-y-auto no-scrollbar">
                {loading ? (
                  <FeedbackState
                    type="loading"
                    title="Loading History"
                    description="Fetching your recent reward records..."
                  />
                ) : transactions.length === 0 ? (
                  <FeedbackState
                    type="empty"
                    title="No Transactions Yet"
                    description="Complete study milestones and upload materials to earn coins!"
                  />
                ) : (
                  transactions.map((tx) => {
                    const item = formatTransaction(tx);
                    return (
                      <div
                        key={item.id}
                        className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className={`p-2.5 rounded-xl ${
                            item.isEarn
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30'
                              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30'
                          }`}>
                            {item.isEarn ? <TrendingUp className="h-4 w-4" /> : <Gift className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                              {item.action}
                            </p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                              {item.date}
                            </p>
                          </div>
                        </div>

                        <span className={`font-bold text-sm sm:text-base ${
                          item.isEarn ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}>
                          {item.points}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </DashboardCard>

          </div>

          {/* Secondary Column: Rewards Store */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Gift className="h-4 w-4 text-[#2563EB]" /> Rewards Store
              </h3>
              <span className="text-xs text-slate-400">Campus Vouchers</span>
            </div>

            <div className="space-y-3.5">
              {rewards.map((reward, index) => (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.05, 0.3) }}
                >
                  <DashboardCard className="overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700 transition-all relative">
                    {!reward.available && (
                      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] z-10 flex items-center justify-center">
                        <span className="bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg font-bold shadow-md">
                          Out of Stock
                        </span>
                      </div>
                    )}
                    <div className="h-28 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <img
                        src={reward.img}
                        alt={reward.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate">
                        {reward.title}
                      </h4>
                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                        <span className="font-bold text-xs sm:text-sm text-amber-500 flex items-center gap-1">
                          <Award className="h-3.5 w-3.5" /> {reward.cost} Coins
                        </span>
                        <DashboardButton
                          variant="ghost"
                          size="sm"
                          disabled={!reward.available || (userData?.coins || 0) < reward.cost}
                          onClick={() => alert(`Redemption initiated for ${reward.title}`)}
                        >
                          Redeem
                        </DashboardButton>
                      </div>
                    </div>
                  </DashboardCard>
                </motion.div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </Layout>
  );
};

export default Rewards;
