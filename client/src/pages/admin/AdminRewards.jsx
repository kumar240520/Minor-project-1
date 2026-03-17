import { useEffect, useState } from 'react';
import { Award, Gift, History, Users } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { supabase } from '../../supabaseClient';
import { getDisplayName } from '../../utils/auth';
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
    fetchRewardsData();
  }, []);

  const fetchRewardsData = async () => {
    setLoading(true);

    try {
      const [{ data: users }, { data: transactions }] = await Promise.all([
        supabase.from('users').select('id, coins'),
        Promise.resolve().then(() => fetchRewardTransactions({ limit: 8 })),
      ]);

      const usersWithCoins = (users || []).filter((user) => (user.coins || 0) > 0).length;
      const totalCoins = (users || []).reduce((sum, user) => sum + (user.coins || 0), 0);

      setSummary({
        usersWithCoins,
        totalCoins,
        rewardTransactions: transactions?.length || 0,
        recentRewards: transactions || [],
      });
    } catch (error) {
      console.error('Error fetching rewards data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto p-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Rewards Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review reward circulation and the current redemption catalog
          </p>
        </header>

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
              <History className="w-6 h-6 text-violet-500" />
              <span className="text-xs text-slate-400 uppercase tracking-wide">Recent</span>
            </div>
            <p className="text-sm text-slate-500">Reward transactions loaded</p>
            <p className="text-3xl font-bold text-slate-800 mt-2">
              {loading ? '...' : summary.rewardTransactions}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
              <h2 className="font-semibold text-slate-800 flex items-center">
                <Gift className="w-5 h-5 mr-2 text-violet-500" />
                Reward Catalog
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {rewardCatalog.map((reward) => (
                <div
                  key={reward.id}
                  className="border border-slate-200 rounded-lg p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{reward.title}</p>
                    <p className="text-sm text-slate-500">Configured storefront redemption item</p>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                    {reward.cost} coins
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
              <h2 className="font-semibold text-slate-800 flex items-center">
                <History className="w-5 h-5 mr-2 text-slate-500" />
                Latest Reward Activity
              </h2>
            </div>
            <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="p-6 text-slate-500">Loading reward activity...</div>
              ) : summary.recentRewards.length === 0 ? (
                <div className="p-6 text-slate-500">No reward transactions found yet.</div>
              ) : (
                summary.recentRewards.map((reward) => (
                  <div key={reward.id} className="p-6 flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {getDisplayName(reward.users, 'Unknown user')}
                      </p>
                      <p className="text-sm text-slate-500">
                        {getTransactionDescription(reward)}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {reward.created_at
                          ? new Date(reward.created_at).toLocaleString()
                          : 'Unknown time'}
                      </p>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 whitespace-nowrap">
                      +{reward.amount || 0}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AdminRewards;
