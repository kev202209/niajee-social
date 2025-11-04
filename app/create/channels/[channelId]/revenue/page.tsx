'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { Channel } from '@/types';
import {
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiUsers,
  FiCreditCard,
  FiCalendar,
  FiDownload,
  FiRefreshCw,
} from 'react-icons/fi';

interface RevenueData {
  totalRevenue: string;
  monthlyRevenue: string;
  averageRevenuePerMember: string;
  revenueGrowth: number;
  
  totalMembers: number;
  newMembersThisMonth: number;
  memberGrowth: number;
  
  tierDistribution: {
    tierId: string;
    tierName: string;
    memberCount: number;
    revenue: string;
    percentage: number;
  }[];
  
  revenueByMonth: {
    month: string;
    revenue: number;
    members: number;
  }[];
  
  recentTransactions: {
    id: string;
    userId: string;
    userName: string;
    tierName: string;
    amount: string;
    status: 'completed' | 'pending' | 'failed';
    createdAt: string;
  }[];
  
  topMembers: {
    userId: string;
    userName: string;
    avatar: string | null;
    tierName: string;
    joinDate: string;
    totalSpent: string;
  }[];
}

type TimeRange = '7days' | '30days' | '3months' | '6months' | '1year' | 'all';

export default function RevenuePage() {
  const params = useParams();
  const channelId = params.channelId as string;

  const [channel, setChannel] = useState<Channel | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('30days');

  // Fetch channel data
  const fetchChannel = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/channels/${channelId}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        const channelData: Channel | null = data && typeof data === 'object' && 'channel' in data 
          ? (data as { channel?: Channel }).channel || null
          : (data as Channel) || null;
        
        if (channelData) {
          setChannel(channelData);
        }
      }
    } catch (err) {
      console.error('Error fetching channel:', err);
    }
  }, [channelId]);

  // Fetch revenue data
  const fetchRevenueData = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/channels/${channelId}/membership/revenue?timeRange=${timeRange}`,
        { credentials: 'include' }
      );
      
      if (response.ok) {
        const data = await response.json() as RevenueData;
        setRevenueData(data);
      }
    } catch (err) {
      console.error('Error fetching revenue data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [channelId, timeRange]);

  useEffect(() => {
    fetchChannel();
    fetchRevenueData();
  }, [fetchChannel, fetchRevenueData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRevenueData();
  };

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    return `KES ${num.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPercentage = (value: number) => {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!channel?.membershipEnabled) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="text-center py-12">
          <FiDollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Membership Not Enabled
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Enable channel membership to start tracking revenue and member analytics
          </p>
          <a
            href={`/create/channels/${channelId}/membership`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Configure Membership
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Revenue & Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your membership revenue and member growth for {channel.name}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
            <option value="all">All Time</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <FiRefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Revenue */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Revenue
            </span>
            <FiDollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {revenueData ? formatCurrency(revenueData.totalRevenue) : '---'}
          </div>
          {revenueData && (
            <div className={`flex items-center gap-1 text-sm ${
              revenueData.revenueGrowth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {revenueData.revenueGrowth >= 0 ? (
                <FiTrendingUp className="w-4 h-4" />
              ) : (
                <FiTrendingDown className="w-4 h-4" />
              )}
              <span>{formatPercentage(revenueData.revenueGrowth)}</span>
            </div>
          )}
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              This Month
            </span>
            <FiCalendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {revenueData ? formatCurrency(revenueData.monthlyRevenue) : '---'}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Current month earnings
          </div>
        </div>

        {/* Total Members */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Active Members
            </span>
            <FiUsers className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {revenueData?.totalMembers.toLocaleString() || '0'}
          </div>
          {revenueData && (
            <div className={`flex items-center gap-1 text-sm ${
              revenueData.memberGrowth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {revenueData.memberGrowth >= 0 ? (
                <FiTrendingUp className="w-4 h-4" />
              ) : (
                <FiTrendingDown className="w-4 h-4" />
              )}
              <span>{formatPercentage(revenueData.memberGrowth)}</span>
            </div>
          )}
        </div>

        {/* Avg Revenue per Member */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Avg per Member
            </span>
            <FiCreditCard className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {revenueData ? formatCurrency(revenueData.averageRevenuePerMember) : '---'}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Average subscription value
          </div>
        </div>
      </div>

      {/* Revenue Chart & Tier Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Revenue Over Time
          </h2>
          {revenueData && revenueData.revenueByMonth.length > 0 ? (
            <div className="space-y-4">
              {revenueData.revenueByMonth.slice(-6).map((month, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {month.month}
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(month.revenue.toString())}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${(month.revenue / Math.max(...revenueData.revenueByMonth.map(m => m.revenue))) * 100}%`
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {month.members} members
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">No revenue data available yet</p>
            </div>
          )}
        </div>

        {/* Tier Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Tier Distribution
          </h2>
          {revenueData && revenueData.tierDistribution.length > 0 ? (
            <div className="space-y-4">
              {revenueData.tierDistribution.map((tier, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {tier.tierName}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {tier.memberCount} members
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-1">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${tier.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {formatCurrency(tier.revenue)} ({tier.percentage.toFixed(1)}%)
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">No tier data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions & Top Members */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Transactions
          </h2>
          {revenueData && revenueData.recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {revenueData.recentTransactions.slice(0, 5).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                      {transaction.userName}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {transaction.tierName} • {new Date(transaction.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">
                      {formatCurrency(transaction.amount)}
                    </div>
                    <div className={`text-xs ${
                      transaction.status === 'completed' ? 'text-green-600 dark:text-green-400' :
                      transaction.status === 'pending' ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-red-600 dark:text-red-400'
                    }`}>
                      {transaction.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">No transactions yet</p>
            </div>
          )}
        </div>

        {/* Top Members */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Top Members
          </h2>
          {revenueData && revenueData.topMembers.length > 0 ? (
            <div className="space-y-3">
              {revenueData.topMembers.slice(0, 5).map((member, index) => (
                <div
                  key={member.userId}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                    #{index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-white text-sm truncate">
                      {member.userName}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {member.tierName} • Joined {new Date(member.joinDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(member.totalSpent)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">No member data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Export Button */}
      <div className="mt-6 flex justify-end">
        <button
          className="flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
        >
          <FiDownload className="w-4 h-4" />
          Export Report
        </button>
      </div>
    </div>
  );
}
