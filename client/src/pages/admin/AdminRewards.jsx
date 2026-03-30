import { useEffect, useState } from 'react';
import { Award, Gift, History, Users } from 'lucide-react';
import ResponsiveAdminSidebar from '../../components/admin/ResponsiveAdminSidebar';
import ResponsiveAdminHeader from '../../components/admin/ResponsiveAdminHeader';
import { supabase } from '../../supabaseClient';
import { getDisplayName, formatLocalRelativeTime } from '../../utils/auth';
import {
  fetchRewardTransactions,
  getTransactionDescription,
} from '../../utils/transactions';

const rewardCatalog = [
  { id: 'gift-card-500', title: 'Amazon Gift Card Rs 500', cost: 2000 },
  { id: 'spotify-1m', title: 'Spotify Premium 1 Month', cost: 1200 },
  { id: 'swiggy-200', title: 'Swiggy Voucher Rs 200', cost: 800 },
  { id: 'badge-pro', title: 'EduSure Pro Badge', cost: 500 },
];

const AdminRewards = () => {
  const [summary, setSummary] = useState({
    usersWithCoins: 0,
    totalCoins: 0,
    rewardTransactions: 0,
    recentRewards: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRewardsData = async () => {
      try {
        // Fetch users with coins
        const { data: usersWithCoins } = await supabase
          .from('users')
          .select('coins')
          .gt('coins', 0);

        // Fetch total coins
        const { data: allUsers } = await supabase.from('users').select('coins');
        const totalCoinsSum = allUsers?.reduce((sum, user) => sum + (user.coins || 0), 0) || 0;

        // Fetch recent reward transactions
        const transactions = await fetchRewardTransactions();

        setSummary({
          usersWithCoins: usersWithCoins?.length || 0,
          totalCoins: totalCoinsSum,
          rewardTransactions: transactions?.length || 0,
          recentRewards: transactions || [],
        });
      } catch (error) {
        console.error('Error fetching rewards data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRewardsData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
      <ResponsiveAdminSidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-64 xl:ml-72 overflow-hidden">
        <ResponsiveAdminHeader 
          title="Rewards Management" 
          subtitle="Review reward circulation and the current redemption catalog"
          onMobileMenuToggle={() => {}}
        />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-6 h-6 text-blue-500" />
                  <span className="text-xs text-slate-400 uppercase tracking-wide">Students</span>
                </div>
                <p className="text-sm text-slate-500">Users with a coin balance</p>
                <p className="text-3xl font-bold text-slate-800 mt-2">
                  {loading ? '...' : summary.usersWithCoins}
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <Award className="w-6 h-6 text-amber-500" />
                  <span className="text-xs text-slate-400 uppercase tracking-wide">Circulation</span>
                </div>
                <p className="text-sm text-slate-500">Coins currently held by users</p>
                <p className="text-3xl font-bold text-slate-800 mt-2">
                  {loading ? '...' : summary.totalCoins.toLocaleString()}
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <History className="w-6 h-6 text-emerald-500" />
                  <span className="text-xs text-slate-400 uppercase tracking-wide">Transactions</span>
                </div>
                <p className="text-sm text-slate-500">Total reward transactions</p>
                <p className="text-3xl font-bold text-slate-800 mt-2">
                  {loading ? '...' : summary.rewardTransactions}
                </p>
              </div>
            </div>

            {/* Reward Catalog */}
            <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h2 className="font-semibold text-slate-800 flex items-center">
                  <Gift className="w-5 h-5 mr-2 text-violet-500" />
                  Reward Catalog
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Available redemption options for students
                </p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rewardCatalog.map((item) => (
                    <div key={item.id} className="border border-slate-200 rounded-lg p-4">
                      <h3 className="font-medium text-slate-800">{item.title}</h3>
                      <p className="text-sm text-slate-500 mt-1">Cost: {item.cost} coins</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Recent Reward Activity */}
            <section className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-800 flex items-center">
                  <History className="w-5 h-5 mr-2 text-violet-500" />
                  Recent Reward Activity
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {loading ? (
                    <div className="p-6 text-slate-500">Loading reward activity...</div>
                  ) : summary.recentRewards.length === 0 ? (
                    <div className="p-6 text-slate-500">No reward transactions found yet.</div>
                  ) : (
                    summary.recentRewards.slice(0, 10).map((reward) => (
                      <div key={reward.id} className="flex items-start justify-between gap-4 p-4 border border-slate-100 rounded-lg">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {getDisplayName(reward.users, 'Unknown user')}
                          </p>
                          <p className="text-sm text-slate-500">
                            {getTransactionDescription(reward)}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            {formatLocalRelativeTime(reward.created_at)}
                          </p>
                        </div>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 whitespace-nowrap">
                          +{reward.amount || 0}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminRewards;
