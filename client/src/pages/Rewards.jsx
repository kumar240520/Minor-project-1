import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Bell, Award, Gift, Zap, TrendingUp, ChevronRight, Share2, Clock, Loader2 } from 'lucide-react';
import Sidebar, { SidebarProvider } from '../components/Sidebar';
import ResponsiveHeader from '../components/ResponsiveHeader';
import { supabase } from '../supabaseClient';
import { formatDistanceToNow } from 'date-fns';
import { getDisplayName, initializeStudentProfileForUser } from '../utils/auth';

const Rewards = () => {
    const [userData, setUserData] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [claimingDaily, setClaimingDaily] = useState(false);
    const [dailyClaimed, setDailyClaimed] = useState(false);
    const [error, setError] = useState(null);

    // Fetch user data and transactions - Same logic as Dashboard
    useEffect(() => {
        const fetchRewardsData = async () => {
            setLoading(true);
            setError(null);
            
            try {
                // 1. Get current user Auth
                const { data: { user }, error: authError } = await supabase.auth.getUser();
                if (authError || !user) throw authError || new Error("Not logged in");

                // 2. Fetch User Profile Data (same as Dashboard)
                let profileData, profileError;
                try {
                    const result = await supabase
                        .from('users')
                        .select('id, name, coins, last_login_reward, email, role')
                        .eq('id', user.id)
                        .single();
                    profileData = result.data;
                    profileError = result.error;
                } catch (err) {
                    profileError = err;
                }
                
                if (profileError || !profileData) {
                    console.log("Profile not found, creating one...");
                    try {
                        // Create user profile if it doesn't exist
                        profileData = await initializeStudentProfileForUser(user);
                        console.log("Profile created successfully");
                    } catch (createError) {
                        console.error("Error creating profile:", createError);
                        // Set basic user data from auth (same as Dashboard)
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
                console.log("✅ Rewards page - User data set:", profileData);

                // 3. Check if daily reward already claimed today
                const today = new Date().toISOString().split('T')[0];
                const lastClaim = profileData?.last_login_reward?.split('T')[0];
                setDailyClaimed(lastClaim === today);

                // 4. Fetch transaction history
                try {
                    const { data: txData, error: txError } = await supabase
                        .from('transactions')
                        .select('*')
                        .eq('user_id', user.id)
                        .order('created_at', { ascending: false })
                        .limit(20);

                    if (!txError && txData) {
                        console.log('[Rewards] Fetched transactions:', txData.length, txData);
                        setTransactions(txData);
                    } else if (txError) {
                        console.error('[Rewards] Error fetching transactions:', txError);
                    }
                } catch (txErr) {
                    console.log("[Rewards] Transaction fetch error (non-critical):", txErr.message);
                }

            } catch (err) {
                console.error('❌ Error fetching rewards data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRewardsData();
    }, []);

    // Clean daily claim function
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

            // Handle new response format from server
            if (result.success === false) {
                // Already claimed case
                setDailyClaimed(true);
                setError(result.message);
                return; // Don't show alert for already claimed
            }

            if (result.success === true) {
                // Success case - update user data
                setUserData(prev => ({ 
                    ...prev, 
                    coins: result.coins || prev.coins + 2,
                    last_login_reward: new Date().toISOString()
                }));
                setDailyClaimed(true);

                // Add new transaction to history
                const newTransaction = {
                    id: Date.now(),
                    description: 'Daily login bonus',
                    transaction_type: 'EARN',
                    amount: result.rewardAmount || 2,
                    created_at: new Date().toISOString()
                };
                
                setTransactions(prev => [newTransaction, ...prev]);
                
                // Success feedback
                alert('🎉 Successfully claimed 2 Edu Coins!');
            } else {
                throw new Error('Unexpected response format');
            }
        } catch (err) {
            console.error('Daily claim error:', err);
            setError(err.message || 'Failed to claim daily reward');
            
            // Only show alert if it's not an "already claimed" scenario
            if (!err.message.includes('already claimed')) {
                alert(err.message || 'Failed to claim daily reward');
            }
        } finally {
            setClaimingDaily(false);
        }
    };

    // Format transaction for display with proper names
    const formatTransaction = (tx) => {
        // Get transaction type and source from database fields
        const txType = (tx.type || '').toUpperCase();
        const txTransactionType = (tx.transaction_type || '').toUpperCase();
        const txSource = (tx.source || tx.reference_type || '').toUpperCase();
        
        // Determine if it's an earning or spending
        const earnTypes = ['EARN', 'REWARD', 'RECEIVE'];
        const earnSources = ['MATERIAL_APPROVAL', 'PYQ_APPROVAL', 'ANSWER_ACCEPTED', 'DAILY_LOGIN', 'RESOURCE_SALE', 'MATERIAL_SALE', 'EVENT_ATTENDANCE', 'FIAT_PURCHASE'];
        const spendTypes = ['SPEND', 'PURCHASE'];
        const spendSources = ['RESOURCE_PURCHASE', 'BUY'];
        
        const isEarn = earnTypes.includes(txType) || 
                       earnTypes.includes(txTransactionType) || 
                       earnSources.includes(txSource);
        const isSpend = spendTypes.includes(txType) || 
                        spendTypes.includes(txTransactionType) || 
                        spendSources.includes(txSource);
        
        // Get transaction name based on source
        const getTransactionName = () => {
            if (tx.description && tx.description.trim() !== '') {
                return tx.description;
            }
            
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
            
            const typeNames = {
                'EARN': 'Coins Earned',
                'REWARD': 'Reward Received',
                'SPEND': 'Coins Spent',
                'PURCHASE': 'Purchase Made'
            };
            
            return sourceNames[txSource] || typeNames[txType] || typeNames[txTransactionType] || 'Transaction';
        };
        
        const result = {
            id: tx.id,
            action: getTransactionName(),
            points: isEarn ? `+${tx.amount}` : `-${tx.amount}`,
            date: formatDistanceToNow(new Date(tx.created_at), { addSuffix: true }),
            type: isEarn ? 'earn' : 'spend',
            color: isEarn ? 'text-emerald-500' : 'text-red-500',
            bg: isEarn ? 'bg-emerald-50' : 'bg-red-50'
        };
        
        return result;
    };

    const rewards = [
        { id: 1, title: 'Amazon Gift Card Rs 500', cost: 2000, img: 'https://images.unsplash.com/photo-1620189507195-68309c04c4d0?w=500&q=80', available: true },
        { id: 2, title: 'Spotify Premium (1 Month)', cost: 1200, img: 'https://images.unsplash.com/photo-1614680376593-902f74a6cecb?w=500&q=80', available: true },
        { id: 3, title: 'EduSure Pro Badge', cost: 500, img: 'https://images.unsplash.com/photo-1558591710-4b4a1eb0f3b5?w=500&q=80', available: true },
        { id: 4, title: 'Swiggy Voucher Rs 200', cost: 800, img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80', available: false },
    ];

    return (
        <SidebarProvider>
            <div className="min-h-screen bg-gray-50 flex">
                <Sidebar />

                <div className="flex-1 flex flex-col lg:ml-0 overflow-hidden">
                    <ResponsiveHeader 
                        title="Rewards Center"
                        showSearch={true}
                        showNotifications={true}
                        showProfile={true}
                    />

                <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gray-50/50">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

                        <div className="lg:col-span-2 space-y-6">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-gradient-to-r from-amber-500 to-orange-400 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between"
                            >
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />

                                <div className="relative z-10 flex items-center mb-6 sm:mb-0">
                                    <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm border border-white/20 mr-6">
                                        <Award className="h-10 w-10 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-amber-100 font-medium mb-1 uppercase tracking-wider text-sm">Your Balance</p>
                                        <h2 className="text-5xl font-extrabold flex items-center">
                                            {loading ? (
                                                <span className="animate-pulse">...</span>
                                            ) : (
                                                <>
                                                    {userData?.coins !== undefined && userData?.coins !== null 
                                                        ? userData.coins.toLocaleString() 
                                                        : '0'
                                                    } 
                                                    <span className="text-xl font-medium ml-2 text-amber-100 mt-3">Edu Coins</span>
                                                </>
                                            )}
                                        </h2>
                                    </div>
                                </div>

                                <div className="relative z-10 flex flex-col gap-3">
                                    <button 
                                        onClick={handleDailyClaim}
                                        disabled={claimingDaily || dailyClaimed || !userData}
                                        className={`font-bold px-6 py-3 rounded-xl transition-all flex items-center ${
                                            dailyClaimed 
                                                ? 'bg-emerald-500 text-white cursor-default' 
                                                : 'bg-white text-orange-600 hover:shadow-lg hover:-translate-y-1'
                                        } ${claimingDaily ? 'opacity-70 cursor-wait' : ''}`}
                                    >
                                        {claimingDaily ? (
                                            <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Claiming...</>
                                        ) : dailyClaimed ? (
                                            <><Clock className="h-5 w-5 mr-2" /> Claimed Today</>
                                        ) : (
                                            <><Gift className="h-5 w-5 mr-2" /> Claim Daily (+2)</>
                                        )}
                                    </button>
                                    
                                    <button className="bg-white/20 backdrop-blur-sm text-white font-bold px-6 py-3 rounded-xl hover:bg-white/30 transition-all flex items-center border border-white/20">
                                        <Gift className="h-5 w-5 mr-2" /> Redeem Now
                                    </button>
                                </div>
                            </motion.div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start group hover:border-violet-200 transition-colors">
                                    <div className="p-3 bg-violet-50 text-violet-600 rounded-xl mr-4 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                                        <Share2 className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">Refer a Friend</h3>
                                        <p className="text-sm text-gray-500 mt-1">Earn 500 coins for every friend who signs up using your link.</p>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start group hover:border-emerald-200 transition-colors">
                                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl mr-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                        <Zap className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">Daily Challenges</h3>
                                        <p className="text-sm text-gray-500 mt-1">Complete today's challenge to earn a bonus of 50 coins.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-gray-800">Coin History</h3>
                                    <button className="text-sm font-semibold text-violet-600 hover:text-violet-800">
                                        {transactions.length} Transactions
                                    </button>
                                </div>
                                <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
                                    {loading ? (
                                        <div className="p-8 text-center text-gray-500">
                                            <Loader2 className="h-6 w-6 mx-auto animate-spin mb-2" />
                                            Loading transactions...
                                        </div>
                                    ) : transactions.length > 0 ? (
                                        transactions.map((tx) => {
                                            const formatted = formatTransaction(tx);
                                            return (
                                                <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                                                    <div className="flex items-center">
                                                        <div className={`p-3 rounded-xl mr-4 ${formatted.bg} ${formatted.color}`}>
                                                            {formatted.type === 'earn' ? <TrendingUp className="h-5 w-5" /> : <Gift className="h-5 w-5" />}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-800">{formatted.action}</p>
                                                            <p className="text-xs text-gray-500 mt-1">{formatted.date}</p>
                                                        </div>
                                                    </div>
                                                    <span className={`font-bold text-lg ${formatted.color}`}>
                                                        {formatted.points}
                                                    </span>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="p-8 text-center text-gray-500">
                                            <p>No transactions yet.</p>
                                            <p className="text-sm mt-1">Complete activities to earn coins!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center">
                                <Gift className="h-6 w-6 mr-2 text-violet-600" /> Rewards Store
                            </h3>

                            <div className="space-y-4">
                                {rewards.map((reward, index) => (
                                    <motion.div
                                        key={reward.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-shadow relative"
                                    >
                                        {!reward.available && (
                                            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
                                                <span className="bg-gray-900 text-white px-4 py-2 rounded-lg font-bold shadow-lg">Out of Stock</span>
                                            </div>
                                        )}
                                        <div className="h-32 w-full bg-gray-200 overflow-hidden">
                                            <img src={reward.img} alt={reward.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        </div>
                                        <div className="p-5">
                                            <h4 className="font-bold text-gray-800 mb-2 truncate">{reward.title}</h4>
                                            <div className="flex justify-between items-center mt-4">
                                                <span className="font-bold text-amber-500 flex items-center">
                                                    <Award className="h-4 w-4 mr-1" /> {reward.cost}
                                                </span>
                                                <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-violet-600 group-hover:translate-x-1 transition-all" />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            </div>
        </SidebarProvider>
    );
};

export default Rewards;
