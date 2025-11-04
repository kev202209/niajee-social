'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Sidebar from '@/components/home/Sidebar';
import MobileBottomNav from '@/components/home/MobileBottomNav';
import {
  FiCheck,
  FiX,
  FiClock,
  FiAlertCircle,
  FiRefreshCw,
  FiCreditCard,
  FiCalendar,
  FiTrendingUp,
  FiTrendingDown,
} from 'react-icons/fi';

interface MembershipTier {
  id: string;
  name: string;
  price: string;
  currency: string;
  color: string;
  benefits: string[];
}

interface Subscription {
  id: string;
  channelId: string;
  channelName: string;
  channelHandle: string;
  channelAvatar: string | null;
  tier: MembershipTier;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  startDate: string;
  nextBillingDate: string | null;
  cancelledAt: string | null;
  expiresAt: string | null;
  autoRenew: boolean;
}

interface PaymentHistory {
  id: string;
  subscriptionId: string;
  amount: string;
  currency: string;
  status: 'completed' | 'failed' | 'pending';
  paidAt: string;
  transactionId: string;
}

export default function SubscriptionsPage() {
  const router = useRouter();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [subscriptionToCancel, setSubscriptionToCancel] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  const fetchSubscriptions = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/subscriptions`,
        { credentials: 'include' }
      );

      if (response.ok) {
        const data = await response.json();
        setSubscriptions(data.subscriptions || []);
        setPaymentHistory(data.paymentHistory || []);
      } else {
        setError('Failed to load subscriptions');
      }
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const handleCancelClick = (subscriptionId: string) => {
    setSubscriptionToCancel(subscriptionId);
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    if (!subscriptionToCancel) return;

    setCancelling(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/${subscriptionToCancel}/cancel`,
        {
          method: 'POST',
          credentials: 'include',
        }
      );

      if (response.ok) {
        setSuccess('Subscription cancelled successfully');
        setShowCancelModal(false);
        await fetchSubscriptions();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to cancel subscription');
      }
    } catch (err) {
      console.error('Cancel error:', err);
      setError('Network error. Please try again.');
    } finally {
      setCancelling(false);
      setSubscriptionToCancel(null);
    }
  };

  const handleUpgrade = (channelHandle: string) => {
    router.push(`/channels/${channelHandle}/membership`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <FiCheck className="w-4 h-4" />;
      case 'expired':
      case 'cancelled':
        return <FiX className="w-4 h-4" />;
      case 'pending':
        return <FiClock className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      case 'expired':
      case 'cancelled':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      default:
        return '';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
  const inactiveSubscriptions = subscriptions.filter(s => s.status !== 'active');

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Header />

      <Sidebar
        isExpanded={isSidebarExpanded}
        setIsExpanded={setIsSidebarExpanded}
      />

      <main className="flex-1 overflow-y-auto pt-16 pb-20 lg:pb-0 lg:ml-16">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              My Subscriptions
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your channel memberships and billing
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
              <FiAlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
              <FiCheck className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800 dark:text-green-200">{success}</p>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-3 font-medium transition-colors relative ${
                activeTab === 'active'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Active Subscriptions
              {activeTab === 'active' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-3 font-medium transition-colors relative ${
                activeTab === 'history'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Payment History
              {activeTab === 'history' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
              )}
            </button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Active Subscriptions Tab */}
              {activeTab === 'active' && (
                <div className="space-y-4">
                  {/* Active Subscriptions */}
                  {activeSubscriptions.length > 0 && (
                    <div className="space-y-4">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Active ({activeSubscriptions.length})
                      </h2>
                      {activeSubscriptions.map((sub) => (
                        <div
                          key={sub.id}
                          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                        >
                          <div className="p-6">
                            {/* Channel Info */}
                            <div className="flex items-start gap-4 mb-4">
                              {sub.channelAvatar ? (
                                <img
                                  src={sub.channelAvatar}
                                  alt={sub.channelName}
                                  className="w-16 h-16 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                                  {sub.channelName.charAt(0)}
                                </div>
                              )}
                              <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                  {sub.channelName}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {sub.channelHandle}
                                </p>
                              </div>
                              <span
                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                  sub.status
                                )}`}
                              >
                                {getStatusIcon(sub.status)}
                                {sub.status}
                              </span>
                            </div>

                            {/* Tier Info */}
                            <div
                              className="p-4 rounded-lg mb-4"
                              style={{
                                backgroundColor: `${sub.tier.color}15`,
                                borderLeft: `4px solid ${sub.tier.color}`,
                              }}
                            >
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                  {sub.tier.name}
                                </h4>
                                <span className="text-lg font-bold text-gray-900 dark:text-white">
                                  {sub.tier.currency} {parseFloat(sub.tier.price).toLocaleString()}
                                  <span className="text-sm text-gray-600 dark:text-gray-400">/month</span>
                                </span>
                              </div>
                              <div className="space-y-1">
                                {sub.tier.benefits.slice(0, 3).map((benefit, idx) => (
                                  <div key={idx} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                    <FiCheck className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                                    {benefit}
                                  </div>
                                ))}
                                {sub.tier.benefits.length > 3 && (
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                    +{sub.tier.benefits.length - 3} more benefits
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Billing Info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                              <div className="flex items-start gap-3">
                                <FiCalendar className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">Started</p>
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {formatDate(sub.startDate)}
                                  </p>
                                </div>
                              </div>
                              {sub.nextBillingDate && (
                                <div className="flex items-start gap-3">
                                  <FiCreditCard className="w-5 h-5 text-gray-400 mt-0.5" />
                                  <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Next Billing</p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                      {formatDate(sub.nextBillingDate)}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                              <button
                                onClick={() => handleUpgrade(sub.channelHandle)}
                                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                              >
                                <FiTrendingUp className="w-4 h-4" />
                                Change Tier
                              </button>
                              <button
                                onClick={() => handleCancelClick(sub.id)}
                                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Inactive Subscriptions */}
                  {inactiveSubscriptions.length > 0 && (
                    <div className="space-y-4 mt-8">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Inactive ({inactiveSubscriptions.length})
                      </h2>
                      {inactiveSubscriptions.map((sub) => (
                        <div
                          key={sub.id}
                          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 opacity-75"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              {sub.channelAvatar ? (
                                <img
                                  src={sub.channelAvatar}
                                  alt={sub.channelName}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white font-bold">
                                  {sub.channelName.charAt(0)}
                                </div>
                              )}
                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                  {sub.channelName}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {sub.tier.name} • {sub.status}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleUpgrade(sub.channelHandle)}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
                            >
                              Resubscribe
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Empty State */}
                  {subscriptions.length === 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                      <FiCreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        No Subscriptions Yet
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Support your favorite creators by joining their membership programs
                      </p>
                      <button
                        onClick={() => router.push('/home')}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                      >
                        Explore Channels
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Payment History Tab */}
              {activeTab === 'history' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  {paymentHistory.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                            <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                              Date
                            </th>
                            <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                              Amount
                            </th>
                            <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                              Status
                            </th>
                            <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                              Transaction ID
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {paymentHistory.map((payment) => (
                            <tr
                              key={payment.id}
                              className="border-b border-gray-200 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/30"
                            >
                              <td className="py-4 px-6 text-sm text-gray-900 dark:text-white">
                                {formatDate(payment.paidAt)}
                              </td>
                              <td className="py-4 px-6 text-sm font-medium text-gray-900 dark:text-white">
                                {payment.currency} {parseFloat(payment.amount).toLocaleString()}
                              </td>
                              <td className="py-4 px-6">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                    payment.status
                                  )}`}
                                >
                                  {getStatusIcon(payment.status)}
                                  {payment.status}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400 font-mono">
                                {payment.transactionId}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-12 text-center">
                      <FiCreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        No Payment History
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Your payment transactions will appear here
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <MobileBottomNav />

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => !cancelling && setShowCancelModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <FiAlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Cancel Subscription?
                  </h2>
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-6">
                You'll lose access to member-only content and benefits. Your subscription will remain active
                until the end of the current billing period.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  disabled={cancelling}
                  className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
                >
                  Keep Subscription
                </button>
                <button
                  onClick={confirmCancel}
                  disabled={cancelling}
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {cancelling ? (
                    <>
                      <FiRefreshCw className="w-4 h-4 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    'Yes, Cancel'
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
