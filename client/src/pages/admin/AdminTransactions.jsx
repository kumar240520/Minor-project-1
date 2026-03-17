import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { format } from 'date-fns';
import { 
    Search, Filter, ReceiptText, 
    ArrowUpRight, ArrowDownRight, User
} from 'lucide-react';
import { getDisplayName } from '../../utils/auth';
import {
    fetchTransactionsWithUsers,
    getTransactionDescription,
    getTransactionSource,
    getTransactionStatus,
    getTransactionType,
} from '../../utils/transactions';

const AdminTransactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const data = await fetchTransactionsWithUsers();
            setTransactions(data || []);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTransactions = transactions.filter(t => {
        const matchesSearch = 
            getDisplayName(t.users, '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            getTransactionDescription(t).toLowerCase().includes(searchTerm.toLowerCase());
            
        const matchesType = filterType === 'all' ? true : getTransactionType(t) === filterType;
        
        return matchesSearch && matchesType;
    });

    const getTransactionIcon = (type, amount) => {
        if (amount > 0) return <ArrowUpRight className="w-4 h-4 text-emerald-600" />;
        return <ArrowDownRight className="w-4 h-4 text-red-600" />;
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <AdminSidebar />
            
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="bg-white border-b border-slate-200 h-20 flex items-center justify-between px-8 shrink-0">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Transaction Logs</h1>
                        <p className="text-sm text-slate-500">Monitor all coin movements across the platform</p>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input 
                                type="text"
                                placeholder="Search user or description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-violet-500 w-64"
                            />
                        </div>
                        
                        <div className="flex bg-slate-100 rounded-lg p-1">
                            {['all', 'reward', 'purchase', 'adjustment'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setFilterType(type)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors ${
                                        filterType === type 
                                            ? 'bg-white text-slate-800 shadow-sm' 
                                            : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        
                        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                            <h2 className="font-semibold text-slate-800 flex items-center">
                                <ReceiptText className="w-5 h-5 mr-2 text-slate-500" />
                                Completed Transactions ({filteredTransactions.length})
                            </h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-3 font-semibold">Transaction ID</th>
                                        <th className="px-6 py-3 font-semibold">User</th>
                                        <th className="px-6 py-3 font-semibold">Type & Source</th>
                                        <th className="px-6 py-3 font-semibold text-right">Amount</th>
                                        <th className="px-6 py-3 font-semibold text-right">Date & Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                                <div className="animate-pulse space-y-4 max-w-4xl mx-auto">
                                                    <div className="h-4 bg-slate-200 rounded w-full"></div>
                                                    <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredTransactions.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center">
                                                <div className="text-slate-500">No transactions found matching your criteria.</div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredTransactions.map((tx) => (
                                            <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4 font-mono text-xs text-slate-400">
                                                    {tx.id.substring(0, 13)}...
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <User className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                                                        <span className="font-medium text-slate-800">{getDisplayName(tx.users, 'Unknown User')}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 w-max capitalize mb-1">
                                                            {getTransactionType(tx)}
                                                        </span>
                                                        {getTransactionSource(tx) && (
                                                            <span className="text-xs text-slate-500 max-w-[200px] truncate" title={getTransactionSource(tx)}>
                                                                Source: {getTransactionSource(tx)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className={`inline-flex items-center font-bold font-mono px-3 py-1 rounded-full ${
                                                        tx.amount > 0 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
                                                    }`}>
                                                        {getTransactionIcon(tx.type, tx.amount)}
                                                        <span className="ml-1">{tx.amount > 0 ? '+' : ''}{tx.amount}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right text-slate-500 whitespace-nowrap">
                                                    {format(new Date(tx.created_at), 'MMM dd, yyyy h:mm a')}
                                                    <br/>
                                                    <span className={`text-xs mt-1 inline-block ${getTransactionStatus(tx) === 'completed' ? 'text-emerald-500' : 'text-amber-500 capitalize'}`}>
                                                        {getTransactionStatus(tx)}
                                                    </span>
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
export default AdminTransactions;
