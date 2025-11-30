'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { Channel, MembershipTier } from '@/types';
import { FiCheck, FiX, FiPlus, FiEdit2, FiTrash2, FiLock, FiSave, FiAlertCircle } from 'react-icons/fi';

type MembershipType = 'free' | 'single' | 'multiple';

interface TierForm {
  id?: string;
  name: string;
  price: string; // Store as string for better input control
  currency: string;
  benefits: string[];
  description?: string;
  color?: string;
  badge?: string;
}

export default function MembershipPage() {
  const params = useParams();
  const channelId = params.channelId as string;

  const [channel, setChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Membership settings state
  const [membershipEnabled, setMembershipEnabled] = useState(false);
  const [membershipType, setMembershipType] = useState<MembershipType>('free');
  const [tiers, setTiers] = useState<TierForm[]>([]);
  const [editingTierId, setEditingTierId] = useState<string | null>(null);
  const [trialDays, setTrialDays] = useState(0);

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
          
          // Initialize state from channel data
          setMembershipEnabled(channelData.membershipEnabled || false);
          
          // Map backend membershipType to local type
          const backendType = channelData.membershipType;
          if (backendType === 'paid') {
            setMembershipType('single');
          } else if (backendType === 'tiered') {
            setMembershipType('multiple');
          } else {
            setMembershipType('free');
          }
          
          setTiers(channelData.membershipTiers?.map((tier: MembershipTier) => ({
            ...tier,
            price: tier.price?.toString() || '0' // Convert to string for input control
          })) || []);
        }
      } else {
        setError('Failed to load channel data');
      }
    } catch (err) {
      console.error('Error fetching channel:', err);
      setError('Failed to load channel data');
    } finally {
      setLoading(false);
    }
  }, [channelId]);

  useEffect(() => {
    fetchChannel();
  }, [fetchChannel]);

  // Add new tier
  const addTier = () => {
    const newTier: TierForm = {
      id: `temp-${Date.now()}`,
      name: '',
      price: '0',
      currency: 'KES',
      benefits: [],
      description: '',
      color: '#3B82F6',
      badge: '',
    };
    setTiers([...tiers, newTier]);
    setEditingTierId(newTier.id || null);
  };

  // Update tier
  const updateTier = (index: number, field: keyof TierForm, value: string | number | string[]) => {
    const updatedTiers = [...tiers];
    updatedTiers[index] = { ...updatedTiers[index], [field]: value };
    setTiers(updatedTiers);
  };

  // Delete tier
  const deleteTier = (index: number) => {
    setTiers(tiers.filter((_, i) => i !== index));
  };

  // Add benefit to tier
  const addBenefit = (index: number, benefit: string) => {
    if (!benefit.trim()) return;
    const updatedTiers = [...tiers];
    updatedTiers[index].benefits = [...updatedTiers[index].benefits, benefit.trim()];
    setTiers(updatedTiers);
  };

  // Remove benefit from tier
  const removeBenefit = (tierIndex: number, benefitIndex: number) => {
    const updatedTiers = [...tiers];
    updatedTiers[tierIndex].benefits = updatedTiers[tierIndex].benefits.filter((_, i) => i !== benefitIndex);
    setTiers(updatedTiers);
  };

  // Save membership settings
  const handleSave = async () => {
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      // Validate tiers
      if (membershipEnabled && membershipType !== 'free') {
        if (tiers.length === 0) {
          setError('Please add at least one membership tier');
          setSaving(false);
          return;
        }

        for (const tier of tiers) {
          if (!tier.name.trim()) {
            setError('All tiers must have a name');
            setSaving(false);
            return;
          }
          const price = parseFloat(tier.price);
          if (isNaN(price) || price <= 0) {
            setError('All tiers must have a price greater than 0');
            setSaving(false);
            return;
          }
          if (tier.benefits.length === 0) {
            setError('All tiers must have at least one benefit');
            setSaving(false);
            return;
          }
        }
      }

      // Map local type to backend type
      const backendType = membershipType === 'single' ? 'paid' : membershipType === 'multiple' ? 'tiered' : 'free';
      
      const payload = {
        enabled: membershipEnabled,
        type: backendType,
        tiers: membershipEnabled && membershipType !== 'free' 
          ? tiers.map(({ ...tier }) => ({
              ...tier,
              price: parseFloat(tier.price) // Parse price to number for backend
            })) // Remove temporary IDs
          : [],
        trialDays: trialDays,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/channels/${channelId}/membership/settings`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        setSuccess('Membership settings saved successfully!');
        await fetchChannel(); // Refresh channel data
        setEditingTierId(null);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || 'Failed to save settings');
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Channel Membership
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Configure membership tiers and exclusive content access for {channel?.name}
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

      {/* Enable/Disable Membership */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Membership Status
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Allow viewers to support your channel through paid memberships
            </p>
          </div>
          <button
            onClick={() => setMembershipEnabled(!membershipEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              membershipEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                membershipEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {membershipEnabled && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Choose membership structure:
            </p>
            <div className="space-y-2">
              {/* Free Membership */}
              <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${membershipType === 'free' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                <input
                  type="radio"
                  name="membershipType"
                  value="free"
                  checked={membershipType === 'free'}
                  onChange={(e) => setMembershipType(e.target.value as MembershipType)}
                  className="mt-1 mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    Free Membership
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Members join for free, no payment required
                  </div>
                </div>
              </label>

              {/* Single Tier */}
              <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${membershipType === 'single' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                <input
                  type="radio"
                  name="membershipType"
                  value="single"
                  checked={membershipType === 'single'}
                  onChange={(e) => setMembershipType(e.target.value as MembershipType)}
                  className="mt-1 mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    Single Tier
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    One membership level with fixed pricing
                  </div>
                </div>
              </label>

              {/* Multiple Tiers */}
              <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${membershipType === 'multiple' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                <input
                  type="radio"
                  name="membershipType"
                  value="multiple"
                  checked={membershipType === 'multiple'}
                  onChange={(e) => setMembershipType(e.target.value as MembershipType)}
                  className="mt-1 mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    Multiple Tiers
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Offer different membership levels with varying prices and benefits
                  </div>
                </div>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Tier Configuration */}
      {membershipEnabled && membershipType !== 'free' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Membership Tiers
            </h2>
            <button
              onClick={addTier}
              disabled={membershipType === 'single' && tiers.length >= 1}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              <FiPlus className="w-4 h-4" />
              Add Tier
            </button>
          </div>

          {tiers.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <FiLock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                No tiers configured yet
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                Create membership tiers to start monetizing your content
              </p>
              <button
                onClick={addTier}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <FiPlus className="w-4 h-4" />
                Create First Tier
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {tiers.map((tier, index) => (
                <TierCard
                  key={tier.id || index}
                  tier={tier}
                  index={index}
                  isEditing={editingTierId === tier.id}
                  onUpdate={updateTier}
                  onDelete={deleteTier}
                  onAddBenefit={addBenefit}
                  onRemoveBenefit={removeBenefit}
                  onToggleEdit={() => setEditingTierId(editingTierId === tier.id ? null : tier.id || null)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Trial Period */}
      {membershipEnabled && membershipType !== 'free' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Free Trial Period
          </h2>
          <div className="flex items-center gap-4">
            <input
              type="number"
              min="0"
              max="30"
              value={trialDays}
              onChange={(e) => setTrialDays(Number(e.target.value))}
              className="w-24 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <span className="text-gray-600 dark:text-gray-400">days free trial</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Set to 0 for no trial period. Maximum 30 days.
          </p>
        </div>
      )}

      {/* Save Button */}
      <div className="flex items-center justify-end gap-4">
        <button
          onClick={() => fetchChannel()}
          disabled={saving}
          className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <FiSave className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// Tier Card Component
interface TierCardProps {
  tier: TierForm;
  index: number;
  isEditing: boolean;
  onUpdate: (index: number, field: keyof TierForm, value: string | number | string[]) => void;
  onDelete: (index: number) => void;
  onAddBenefit: (index: number, benefit: string) => void;
  onRemoveBenefit: (tierIndex: number, benefitIndex: number) => void;
  onToggleEdit: () => void;
}

function TierCard({
  tier,
  index,
  isEditing,
  onUpdate,
  onDelete,
  onAddBenefit,
  onRemoveBenefit,
  onToggleEdit,
}: TierCardProps) {
  const [newBenefit, setNewBenefit] = useState('');

  const handleAddBenefit = () => {
    if (newBenefit.trim()) {
      onAddBenefit(index, newBenefit);
      setNewBenefit('');
    }
  };

  return (
    <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          <input
            type="color"
            value={tier.color}
            onChange={(e) => onUpdate(index, 'color', e.target.value)}
            className="w-10 h-10 rounded cursor-pointer"
          />
          <div className="flex-1">
            <input
              type="text"
              value={tier.name}
              onChange={(e) => onUpdate(index, 'name', e.target.value)}
              placeholder="Tier name (e.g., Silver, Gold)"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium"
              disabled={!isEditing}
            />
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={onToggleEdit}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
          >
            {isEditing ? <FiCheck className="w-4 h-4" /> : <FiEdit2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onDelete(index)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Price */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Price
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={tier.price}
            onChange={(e) => onUpdate(index, 'price', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            disabled={!isEditing}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Currency
          </label>
          <select
            value={tier.currency}
            onChange={(e) => onUpdate(index, 'currency', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            disabled={!isEditing}
          >
            <option value="KES">KES</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </div>
      </div>

      {/* Description */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description
        </label>
        <textarea
          value={tier.description}
          onChange={(e) => onUpdate(index, 'description', e.target.value)}
          placeholder="Describe this membership tier..."
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
          disabled={!isEditing}
        />
      </div>

      {/* Badge */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Badge (Emoji)
        </label>
        <input
          type="text"
          value={tier.badge}
          onChange={(e) => onUpdate(index, 'badge', e.target.value)}
          placeholder="🎖️"
          maxLength={2}
          className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center text-2xl"
          disabled={!isEditing}
        />
      </div>

      {/* Benefits */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Benefits
        </label>
        <div className="space-y-2 mb-3">
          {tier.benefits.map((benefit, benefitIndex) => (
            <div
              key={benefitIndex}
              className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <FiCheck className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
              <span className="flex-1 text-sm text-gray-900 dark:text-white">{benefit}</span>
              {isEditing && (
                <button
                  onClick={() => onRemoveBenefit(index, benefitIndex)}
                  className="p-1 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                >
                  <FiX className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        {isEditing && (
          <div className="flex gap-2">
            <input
              type="text"
              value={newBenefit}
              onChange={(e) => setNewBenefit(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddBenefit()}
              placeholder="Add a benefit..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
            <button
              onClick={handleAddBenefit}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <FiPlus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
