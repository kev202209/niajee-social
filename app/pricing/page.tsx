'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Header from '@/components/Landing/Header';
import Footer from '@/components/Landing/Footer';
import { FiCheck, FiX, FiSmartphone, FiBarChart2, FiClock, FiZap, FiShield } from 'react-icons/fi';
import PurchaseModal from '@/components/pricing/PurchaseModal';

type Plan = {
  id: string;
  name: string;
  price: string;
  annualPrice?: string;
  currency: string;
  features: {
    maxChannels: number;
    maxTeamMembers: number;
    verification: boolean;
    analytics: boolean;
    scheduling: boolean;
    customBranding: boolean;
    priority: boolean;
  };
};

const featureMeta: Array<{ key: keyof Plan['features'] | 'maxChannels' | 'maxTeamMembers'; label: string; icon: React.ReactNode }> = [
  { key: 'maxChannels', label: 'Channels', icon: <FiSmartphone className="w-4 h-4" /> },
  { key: 'maxTeamMembers', label: 'Team Members', icon: <FiShield className="w-4 h-4" /> },
  { key: 'verification', label: 'Verification Badge', icon: <FiShield className="w-4 h-4" /> },
  { key: 'analytics', label: 'Advanced Analytics', icon: <FiBarChart2 className="w-4 h-4" /> },
  { key: 'scheduling', label: 'Post Scheduling', icon: <FiClock className="w-4 h-4" /> },
  { key: 'customBranding', label: 'Custom Branding', icon: <FiZap className="w-4 h-4" /> },
  { key: 'priority', label: 'Priority Ranking', icon: <FiZap className="w-4 h-4" /> }
];

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [billingAnnual, setBillingAnnual] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [phone, setPhone] = useState('');
  const [initiating, setInitiating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch plans
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/plans`, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to load plans');
        const data = await res.json();
        if (active) setPlans(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (active) setError(e.message || 'Failed to load plans');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const displayPrice = (p: Plan) => {
    const monthly = parseFloat(p.price || '0');
    const annual = parseFloat(p.annualPrice || p.price || '0');
    if (billingAnnual) {
      const perMonth = (annual / 12).toFixed(2);
      return { headline: `${p.currency} ${annual}`, sub: `${p.currency} ${perMonth}/mo (annual)` };
    }
    return { headline: `${p.currency} ${monthly}`, sub: 'per month' };
  };

  const savingsPercent = (p: Plan) => {
    if (!p.annualPrice) return null;
    const m = parseFloat(p.price) * 12;
    const a = parseFloat(p.annualPrice);
    if (a >= m) return null;
    return Math.round(((m - a) / m) * 100);
  };

  const recommendedPlanId = useMemo(() => {
    // Choose mid / pro plan if exists
    const pro = plans.find(p => /pro|plus|growth/i.test(p.name));
    return pro?.id || plans.find(p => p.name !== 'Free')?.id || plans[0]?.id;
  }, [plans]);

  const startMpesa = async (explicitPhone?: string) => {
    if (!selectedPlan) {
      setMessage('Select a plan.');
      return;
    }
    const phoneToUse = explicitPhone || phone;
    if (selectedPlan.name.toLowerCase() === 'free') {
      setMessage('Free plan requires no payment.');
      return;
    }
    if (!/^0\d{9}$/.test(phoneToUse)) {
      setMessage('Enter valid M-Pesa number (07XXXXXXXX).');
      return;
    }
    setInitiating(true);
    setMessage(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/mpesa/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan.id,
          phoneNumber: phoneToUse,
          billing: billingAnnual ? 'annual' : 'monthly'
        }),
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed');
      setMessage(data.message || 'STK Push sent. Complete on device.');
    } catch (e: any) {
      setMessage(e.message || 'Payment failed.');
    } finally {
      setInitiating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-indigo-950 text-gray-900 dark:text-gray-100 flex flex-col overflow-x-hidden">
      <Header />
      <main className="flex-1 pt-20 pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Pricing</h1>
            <p className="mt-4 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Choose a plan that grows with your reach.
            </p>
            <div className="mt-8 inline-flex items-center gap-4 bg-white/70 dark:bg-gray-900/50 backdrop-blur rounded-full px-6 py-3 border border-gray-200 dark:border-white/10">
              <span className={!billingAnnual ? 'font-semibold text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'}>Monthly</span>
              <button
                aria-label="Toggle billing period"
                onClick={() => setBillingAnnual(v => !v)}
                className="relative w-12 h-6 rounded-full bg-indigo-200 dark:bg-gray-700 transition"
              >
                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${billingAnnual ? 'translate-x-6' : ''}`} />
              </button>
              <span className={billingAnnual ? 'font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1' : 'text-gray-600 dark:text-gray-400'}>
                Annual {billingAnnual && <span className="text-xs text-green-500 font-medium">(Save)</span>}
              </span>
            </div>
          </div>

          {loading && (
            <div className="grid gap-6 md:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="rounded-2xl border border-gray-200 dark:border-white/10 p-6 animate-pulse bg-white/60 dark:bg-gray-900/40 h-80" />
              ))}
            </div>
          )}

            {!loading && error && (
            <div className="text-center text-sm text-red-500 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-10">
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
              {plans.map(p => {
                const price = displayPrice(p);
                const selected = selectedPlan?.id === p.id;
                const recommended = p.id === recommendedPlanId;
                const save = savingsPercent(p);

                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedPlan(p);
                      setMessage(null);
                    }}
                    className={`relative group cursor-pointer rounded-2xl border p-5 sm:p-6 flex flex-col bg-white/80 dark:bg-gray-900/60 backdrop-blur transition min-w-0
                      ${selected ? 'border-indigo-500 ring-2 ring-indigo-400/40' : 'border-gray-200 dark:border-white/10 hover:border-indigo-400/70'}
                    `}
                  >
                    {recommended && (
                      <span className="absolute -top-3 left-4 px-3 py-1 text-[11px] font-semibold rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow">
                        Recommended
                      </span>
                    )}
                    <div className="mb-3 sm:mb-4">
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="text-lg sm:text-xl font-semibold tracking-tight">{p.name}</h2>
                        {billingAnnual && p.name !== 'Free' && (
                          <span className="text-[10px] px-2 py-1 rounded-full bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-300 font-medium">
                            Annual
                          </span>
                        )}
                      </div>
                      <div className="mt-3 sm:mt-4">
                        <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-amber-400 bg-clip-text text-transparent">
                          {price.headline}
                        </div>
                        <div className="text-xs mt-1 text-gray-600 dark:text-gray-400">{price.sub}</div>
                        {billingAnnual && save && (
                          <div className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">
                            Save {save}%
                          </div>
                        )}
                      </div>
                    </div>

                    <ul className="text-xs sm:text-sm space-y-2 flex-1">
                      {featureMeta.map(f => {
                        const value =
                          f.key === 'maxChannels'
                            ? p.features.maxChannels
                            : f.key === 'maxTeamMembers'
                              ? p.features.maxTeamMembers
                              : p.features[f.key as keyof Plan['features']];
                        const enabled = typeof value === 'number' ? true : !!value;
                        return (
                          <li key={f.key} className="flex items-start gap-2">
                            <span
                              className={`mt-0.5 inline-flex items-center justify-center w-5 h-5 rounded-full border text-[10px] shrink-0 ${
                                enabled
                                  ? 'bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white border-transparent'
                                  : 'border-gray-300 dark:border-gray-600 text-gray-400'
                              }`}
                            >
                              {enabled ? <FiCheck className="w-3 h-3" /> : <FiX className="w-3 h-3" />}
                            </span>
                            <span className={`min-w-0 break-words ${!enabled ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
                              {f.label}{typeof value === 'number' ? `: ${value}` : ''}
                            </span>
                          </li>
                        );
                      })}
                    </ul>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPlan(p);
                        if (p.name.toLowerCase() !== 'free') {
                          setShowModal(true);
                        } else {
                          setMessage('Free plan selected.');
                        }
                      }}
                      className={`mt-5 sm:mt-6 w-full py-2 rounded-xl font-medium text-sm transition shadow-sm ${
                        selected
                          ? 'bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-amber-400 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {p.name.toLowerCase() === 'free'
                        ? (selected ? 'Selected' : 'Choose Free')
                        : (selected ? 'Proceed' : 'Select')}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {message && (
            <div className="mt-10 text-sm bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 px-4 py-3 rounded-lg">
              {message}
            </div>
          )}

          {!loading && (
            <div className="mt-16 text-center text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">
              Prices in KES. Taxes may apply. Plans auto-renew; downgrade anytime.
            </div>
          )}
        </div>
      </main>
      <Footer />
      <PurchaseModal
        open={showModal && !!selectedPlan && selectedPlan.name.toLowerCase() !== 'free'}
        onClose={() => { if (!initiating) setShowModal(false); }}
        planName={selectedPlan?.name || ''}
        billing={billingAnnual ? 'annual' : 'monthly'}
        loading={initiating}
        message={message}
        onSubmit={(inputPhone) => {
          setPhone(inputPhone);
          startMpesa(inputPhone);
        }}
      />
    </div>
  );
}