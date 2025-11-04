'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { Channel } from '@/types';
import {
  FiDollarSign,
  FiArrowRight,
  FiCheck,
  FiClock,
  FiX,
  FiAlertCircle,
  FiRefreshCw,
  FiDownload,
} from 'react-icons/fi';

interface PayoutMethod {
  id: string;
  type: 'mpesa';
  phone: string;
  isDefault: boolean;
}

interface PayoutRequest {
  id: string;
  amount: string;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedAt: string;
  processedAt?: string;
  payoutMethod: string;
  transactionId?: string;
  failureReason?: string;
}

interface PayoutData {
  availableBalance: string;
  pendingBalance: string;
  totalEarnings: string;
  totalPaidOut: string;
  currency: string;
  minimumPayout: number;
  payoutMethods: PayoutMethod[];
  recentPayouts: PayoutRequest[];
}

export default function PayoutsPage() {
  const params = useParams();
  const router = useRouter();
  const channelId = params.channelId as string;

  const [channel, setChannel] = useState<Channel | null>(null);
  const [payoutData, setPayoutData] = useState<PayoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestAmount, setRequestAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [newPhone, setNewPhone] = useState('');
  const [showAddMethod, setShowAddMethod] = useState(false);

  // Fetch channel and payout data
  const fetchData = useCallback(async () => {
    try {
      // Fetch channel
      const channelRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/channels/${channelId}`, {
        credentials: 'include'
      });
      
      if (channelRes.ok) {
        const data = await channelRes.json();
        const channelData: Channel | null = data && typeof data === 'object' && 'channel' in data 
          ? (data as { channel?: Channel }).channel || null
          : (data as Channel) || null;
        setChannel(channelData);
      }

      // Fetch payout data
      const payoutRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/channels/${channelId}/membership/payouts`,
        { credentials: 'include' }
      );
      
      if (payoutRes.ok) {
        const data = await payoutRes.json() as PayoutData;
        setPayoutData(data);
        if (data.payoutMethods.length > 0) {
          setSelectedMethod(data.payoutMethods.find(m => m.isDefault)?.id || data.payoutMethods[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load payout data');
    } finally {
      setLoading(false);
    }
  }, [channelId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Request payout
  const handleRequestPayout = async () => {
    if (!requestAmount || !selectedMethod) return;

    const amount = parseFloat(requestAmount);
    const available = parseFloat(payoutData?.availableBalance || '0');

    if (amount < (payoutData?.minimumPayout || 100)) {
      setError(`Minimum payout amount is ${payoutData?.currency} ${payoutData?.minimumPayout}`);
      return;
    }

    if (amount > available) {
      setError('Insufficient balance');
      return;
    }

    setRequesting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/channels/${channelId}/membership/payouts/request`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            amount: amount,
            payoutMethodId: selectedMethod,
          }),
        }
      );

      if (response.ok) {
        setSuccess('Payout request submitted successfully!');
        setShowRequestModal(false);
        setRequestAmount('');
        await fetchData(); // Refresh data
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to request payout');
      }
    } catch (err) {
      console.error('Payout request error:', err);
      setError('Network error. Please try again.');
    } finally {
      setRequesting(false);
    }
  };

  // Add payout method
  const handleAddMethod = async () => {
    if (!/^(254|0)[17]\d{8}$/.test(newPhone)) {
      setError('Please enter a valid Kenyan phone number');
      return;
    }

    setRequesting(true);
    setError('');

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/channels/${channelId}/membership/payout-methods`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            type: 'mpesa',
            phone: newPhone.startsWith('0') ? `254${newPhone.slice(1)}` : newPhone,
          }),
        }
      );

      if (response.ok) {
        setSuccess('Payout method added successfully!');
        setShowAddMethod(false);
        setNewPhone('');
        await fetchData();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to add payout method');
      }
    } catch (err) {
      console.error('Add method error:', err);
      setError('Network error. Please try again.');
    } finally {
      setRequesting(false);
    }
  };

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    return `${payoutData?.currency || 'KES'} ${num.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <FiCheck className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'pending':
      case 'processing':
        return <FiClock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
      case 'failed':
        return <FiX className="w-5 h-5 text-red-600 dark:text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      case 'pending':
      case 'processing':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      case 'failed':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!channel?.membershipEnabled) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
        <div className="text-center py-12">
          <FiDollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Payouts Not Available
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Enable channel membership to start earning and requesting payouts
          </p>
          <button
            onClick={() => router.push(`/create/channels/${channelId}/membership`)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Configure Membership
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Payouts
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your earnings and withdrawal requests
          </p>
        </div>
        <button
          onClick={() => fetchData()}
          className="p-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors"
        >
          <FiRefreshCw className="w-5 h-5" />
        </button>
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

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium opacity-90">Available Balance</span>
            <FiDollarSign className="w-5 h-5 opacity-75" />
          </div>
          <div className="text-3xl font-bold mb-1">
            {payoutData ? formatCurrency(payoutData.availableBalance) : '---'}
          </div>
          <button
            onClick={() => setShowRequestModal(true)}
            disabled={!payoutData || parseFloat(payoutData.availableBalance) < (payoutData.minimumPayout || 100)}
            className="mt-3 w-full px-4 py-2 bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            Request Payout
            <FiArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</span>
            <FiClock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {payoutData ? formatCurrency(payoutData.pendingBalance) : '---'}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">In processing</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Earned</span>
            <FiDollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {payoutData ? formatCurrency(payoutData.totalEarnings) : '---'}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">All time</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Paid Out</span>
            <FiCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {payoutData ? formatCurrency(payoutData.totalPaidOut) : '---'}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Withdrawn</p>
        </div>
      </div>

      {/* Payout Methods */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Payout Methods
          </h2>
          <button
            onClick={() => setShowAddMethod(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
          >
            Add Method
          </button>
        </div>

        {payoutData && payoutData.payoutMethods.length > 0 ? (
          <div className="space-y-3">
            {payoutData.payoutMethods.map((method) => (
              <div
                key={method.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <FiDollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      M-Pesa
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {method.phone}
                    </div>
                  </div>
                </div>
                {method.isDefault && (
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-full">
                    Default
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No payout methods added yet
            </p>
            <button
              onClick={() => setShowAddMethod(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Add M-Pesa Number
            </button>
          </div>
        )}
      </div>

      {/* Recent Payouts */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Payouts
          </h2>
          <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors text-sm flex items-center gap-2">
            <FiDownload className="w-4 h-4" />
            Export
          </button>
        </div>

        {payoutData && payoutData.recentPayouts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Method</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Transaction ID</th>
                </tr>
              </thead>
              <tbody>
                {payoutData.recentPayouts.map((payout) => (
                  <tr key={payout.id} className="border-b border-gray-200 dark:border-gray-700 last:border-0">
                    <td className="py-4 px-4 text-sm text-gray-900 dark:text-white">
                      {new Date(payout.requestedAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(payout.amount)}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {payout.payoutMethod}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payout.status)}`}>
                        {getStatusIcon(payout.status)}
                        {payout.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {payout.transactionId || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              No payout requests yet
            </p>
          </div>
        )}
      </div>

      {/* Request Payout Modal */}
      {showRequestModal && payoutData && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => !requesting && setShowRequestModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Request Payout
              </h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  value={requestAmount}
                  onChange={(e) => setRequestAmount(e.target.value)}
                  min={payoutData.minimumPayout}
                  max={parseFloat(payoutData.availableBalance)}
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Available: {formatCurrency(payoutData.availableBalance)} • Minimum: {formatCurrency(payoutData.minimumPayout.toString())}
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payout Method
                </label>
                <select
                  value={selectedMethod}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {payoutData.payoutMethods.map((method) => (
                    <option key={method.id} value={method.id}>
                      M-Pesa - {method.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowRequestModal(false)}
                  disabled={requesting}
                  className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestPayout}
                  disabled={requesting || !requestAmount}
                  className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {requesting ? (
                    <>
                      <FiRefreshCw className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Request
                      <FiArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add Method Modal */}
      {showAddMethod && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => !requesting && setShowAddMethod(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Add Payout Method
              </h2>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  M-Pesa Phone Number
                </label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="0712345678"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Payouts will be sent to this M-Pesa number
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddMethod(false)}
                  disabled={requesting}
                  className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMethod}
                  disabled={requesting || !newPhone}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                >
                  {requesting ? 'Adding...' : 'Add Method'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
