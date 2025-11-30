'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { Channel, MembershipTier } from '@/types';
import { FiCheck, FiLock, FiCreditCard, FiLoader, FiX, FiAlertCircle } from 'react-icons/fi';
import Header from '@/components/home/Header';
import Sidebar from '@/components/home/Sidebar';
import MobileBottomNav from '@/components/home/MobileBottomNav';

interface PaymentState {
  isProcessing: boolean;
  checkoutRequestId: string | null;
  error: string | null;
  success: boolean;
}

interface MembershipStatusResponse {
  isMember?: boolean;
  status?: string;
  tier?: string;
  activeTransaction?: {
    status?: string;
    expired?: boolean;
  };
  checkoutRequestId?: string;
}

export default function ChannelMembershipPage() {
  const params = useParams();
  const handle = params.handle as string;

  const [channel, setChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [selectedTier, setSelectedTier] = useState<MembershipTier | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [phone, setPhone] = useState('');
  const [paymentState, setPaymentState] = useState<PaymentState>({
    isProcessing: false,
    checkoutRequestId: null,
    error: null,
    success: false,
  });

  const fetchChannel = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/channels/handle/${handle}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        const channelData: Channel | null =
          data && typeof data === 'object' && 'channel' in data
            ? (data as { channel?: Channel }).channel || null
            : (data as Channel) || null;
        setChannel(channelData);
      }
    } catch (err) {
      console.error('Error fetching channel:', err);
    } finally {
      setLoading(false);
    }
  }, [handle]);

  useEffect(() => {
    fetchChannel();
  }, [fetchChannel]);

  // Normalize phone variants to 2547xxxxxxxx
  const toMsisdn254 = (p: string): string => {
    const digits = p.replace(/\D/g, '');
    if (digits.startsWith('254')) return digits;
    if (digits.startsWith('0')) return `254${digits.slice(1)}`;
    if (digits.length === 9) return `254${digits}`;
    return digits;
  };

  // Accept 0xxxxxxxxx, 2547xxxxxxxx, +2547xxxxxxxx
  const validKePhone = (p: string): boolean =>
    /^(\+?254|0)[17]\d{8}$/.test(p.replace(/\s+/g, ''));

  // Free membership join (no phone)
  const handleJoinFree = async () => {
    if (!channel?.id) return;
    setPaymentState({ isProcessing: true, checkoutRequestId: null, error: null, success: false });
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/channels/${channel.id}/membership/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({}) // no body needed for free
      });
      const data = await res.json();
      if (res.ok) {
        await fetchChannel();
        setPaymentState({ isProcessing: false, checkoutRequestId: null, error: null, success: true });
        setTimeout(() => {
          setShowPaymentModal(false);
          setPaymentState({ isProcessing: false, checkoutRequestId: null, error: null, success: false });
        }, 1500);
      } else {
        setPaymentState(prev => ({
          ...prev,
            isProcessing: false,
            error: (data as { message?: string })?.message || 'Failed to join.'
        }));
      }
    } catch {
      setPaymentState(prev => ({ ...prev, isProcessing: false, error: 'Network error.' }));
    }
  };

  // Initiate paid tier payment
  const initiatePayment = async () => {
    if (!selectedTier || !phone) return;
    if (!validKePhone(phone)) {
      setPaymentState(prev => ({
        ...prev,
        error: 'Please enter a valid Kenyan phone number (e.g., 0712345678 or +254712345678)'
      }));
      return;
    }
    setPaymentState({ isProcessing: true, checkoutRequestId: null, error: null, success: false });
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/channels/${channel?.id}/membership/subscribe`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            tierId: selectedTier.id,
            phoneNumber: toMsisdn254(phone)
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        const checkoutId = (data as { checkoutRequestId?: string }).checkoutRequestId || null;
        setPaymentState(prev => ({ ...prev, checkoutRequestId: checkoutId }));
        if (channel?.id) {
          void pollMembershipStatus(channel.id, checkoutId || undefined);
        }
      } else {
        setPaymentState(prev => ({
          ...prev,
          isProcessing: false,
          error: (data as { message?: string })?.message || 'Failed to initiate payment'
        }));
      }
    } catch {
      setPaymentState(prev => ({ ...prev, isProcessing: false, error: 'Network error. Please try again.' }));
    }
  };

  // Extended polling window (5 minutes: 150 attempts * 2s)
  const pollMembershipStatus = async (channelId: string, checkoutRequestId?: string) => {
    const maxAttempts = 150;
    let attempts = 0;
    const poll = async (): Promise<void> => {
      try {
        const qs = checkoutRequestId ? `?checkoutRequestId=${encodeURIComponent(checkoutRequestId)}` : '';
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/channels/${channelId}/membership/status${qs}`,
          { credentials: 'include' }
        );
        const data: MembershipStatusResponse = await res.json();

        if (data.isMember && data.status === 'active') {
          setPaymentState(prev => ({ ...prev, isProcessing: false, error: null, success: true }));
          await fetchChannel();
          setTimeout(() => {
            setShowPaymentModal(false);
            setSelectedTier(null);
            setPhone('');
            setPaymentState({ isProcessing: false, checkoutRequestId: null, error: null, success: false });
          }, 2000);
          return;
        }

        if (data.activeTransaction?.expired || data.activeTransaction?.status === 'expired') {
          setPaymentState(prev => ({ ...prev, isProcessing: false, error: 'Payment expired (no PIN entered)' }));
          return;
        }

        if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 2000);
        } else {
          setPaymentState(prev => ({ ...prev, isProcessing: false, error: 'Payment timeout.' }));
        }
      } catch {
        if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 2000);
        } else {
          setPaymentState(prev => ({ ...prev, isProcessing: false, error: 'Failed to verify membership status.' }));
        }
      }
    };
    void poll();
  };

  const handleSelectTier = (tier: MembershipTier) => {
    setSelectedTier(tier);
    setShowPaymentModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Header />
        <div className="flex pt-16">
          <Sidebar
            isExpanded={isSidebarExpanded}
            setIsExpanded={setIsSidebarExpanded}
            pushContent={false}
            interaction="click"
            overlayOnExpand={true}
          />
          <main className="flex-1 w-full">
            <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
              <div className="animate-pulse space-y-6">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-96 bg-gray-200 dark:bg-gray-700 rounded" />
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  if (!channel || !channel.membershipEnabled) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Header />
        <div className="flex pt-16">
          <Sidebar
            isExpanded={isSidebarExpanded}
            setIsExpanded={setIsSidebarExpanded}
            pushContent={false}
            interaction="click"
            overlayOnExpand={true}
          />
          <main className="flex-1 w-full">
            <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto text-center py-12">
              <FiLock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Membership Not Available
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                This channel hasn&apos;t enabled memberships yet.
              </p>
            </div>
          </main>
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      <div className="flex pt-16">
        <Sidebar
          isExpanded={isSidebarExpanded}
          setIsExpanded={setIsSidebarExpanded}
          pushContent={false}
          interaction="click"
          overlayOnExpand={true}
        />
        <main className="flex-1 w-full">
          <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
            <div className="mb-8 text-center">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                Join {channel.name}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Support your favorite creator and unlock exclusive perks
              </p>
            </div>

            {channel.membershipType === 'free' ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Free Membership
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Join this channel&apos;s community for free
                </p>
                <button
                  onClick={handleJoinFree}
                  disabled={paymentState.isProcessing}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg font-medium transition-colors"
                >
                  {paymentState.isProcessing ? 'Joining...' : 'Join Now'}
                </button>
                {paymentState.error && (
                  <p className="mt-4 text-sm text-red-600 dark:text-red-400">{paymentState.error}</p>
                )}
                {paymentState.success && (
                  <p className="mt-4 text-sm text-green-600 dark:text-green-400">Joined successfully!</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {channel.membershipTiers?.map((tier) => (
                  <div
                    key={tier.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all p-6 flex flex-col"
                    style={{ borderTopColor: tier.color, borderTopWidth: '4px' }}
                  >
                    <div className="text-center mb-6">
                      {tier.badge && (
                        <div className="text-4xl mb-2">{tier.badge}</div>
                      )}
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {tier.name}
                      </h3>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">
                          {tier.currency} {tier.price.toLocaleString()}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">/month</span>
                      </div>
                      {tier.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          {tier.description}
                        </p>
                      )}
                    </div>
                    <div className="flex-1 mb-6">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                        What you&apos;ll get:
                      </h4>
                      <ul className="space-y-3">
                        {tier.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <FiCheck className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {benefit}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <button
                      onClick={() => handleSelectTier(tier)}
                      className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <FiCreditCard className="w-5 h-5" />
                      Join Now
                    </button>
                  </div>
                ))}
              </div>
            )}

            {channel.memberCount && channel.memberCount > 0 && (
              <div className="mt-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  Join <span className="font-semibold text-gray-900 dark:text-white">
                    {channel.memberCount.toLocaleString()}
                  </span> other members supporting {channel.name}
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
      <MobileBottomNav />

      {showPaymentModal && selectedTier && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => !paymentState.isProcessing && !paymentState.success && setShowPaymentModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {!paymentState.isProcessing && !paymentState.success && (
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FiX className="w-5 h-5" />
                </button>
              )}

              {paymentState.success ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                    <FiCheck className="w-10 h-10 text-green-600 dark:text-green-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Welcome!
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    You&apos;re now a {selectedTier.name} member of {channel?.name}
                  </p>
                </div>
              ) : (
                <>
                  <div className="text-center mb-6">
                    {selectedTier.badge && (
                      <div className="text-5xl mb-3">{selectedTier.badge}</div>
                    )}
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {selectedTier.name}
                    </h2>
                    <div className="text-3xl font-bold" style={{ color: selectedTier.color }}>
                      {selectedTier.currency} {selectedTier.price.toLocaleString()}/month
                    </div>
                  </div>

                    {paymentState.error && (
                      <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                        <FiAlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-800 dark:text-red-200">{paymentState.error}</p>
                      </div>
                    )}

                  {paymentState.isProcessing ? (
                    <div className="text-center py-8">
                      <FiLoader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Processing Payment
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Check your phone and enter your M-Pesa PIN to complete payment
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          M-Pesa Phone Number
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="0712345678 or +254712345678"
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          You will receive an STK push on this number
                        </p>
                      </div>
                      <button
                        onClick={initiatePayment}
                        disabled={!phone}
                        className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <FiCreditCard className="w-5 h-5" />
                        Pay with M-Pesa
                      </button>
                      <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
                        Secure payment processed by Safaricom M-Pesa
                      </p>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}