import React from 'react';
import { FiLock, FiUnlock } from 'react-icons/fi';

interface MembershipTier {
  id: string;
  name: string;
  price: number;
  currency: string;
}

interface MembershipAccessSectionProps {
  isMemberOnly: boolean;
  requiredTierId: string | null | undefined;
  membershipEnabled: boolean;
  membershipTiers: MembershipTier[] | null;
  onMemberOnlyChange: (checked: boolean) => void;
  onTierChange: (tierId: string | null) => void;
  disabled?: boolean;
}

export default function MembershipAccessSection({
  isMemberOnly,
  requiredTierId,
  membershipEnabled,
  membershipTiers,
  onMemberOnlyChange,
  onTierChange,
  disabled = false,
}: MembershipAccessSectionProps) {
  // Don't render if membership is not enabled for this channel
  if (!membershipEnabled) {
    return null;
  }

  const hasTiers = membershipTiers && membershipTiers.length > 0;

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          {isMemberOnly ? (
            <FiLock className="w-5 h-5 text-blue-500" />
          ) : (
            <FiUnlock className="w-5 h-5 text-gray-400" />
          )}
          Membership Access
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Control who can view this content based on membership status
        </p>
      </div>

      {/* Members Only Toggle */}
      <div className="flex items-start space-x-3">
        <div className="flex items-center h-5">
          <input
            id="isMemberOnly"
            name="isMemberOnly"
            type="checkbox"
            checked={isMemberOnly}
            onChange={(e) => onMemberOnlyChange(e.target.checked)}
            disabled={disabled}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        <div className="flex-1">
          <label
            htmlFor="isMemberOnly"
            className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer"
          >
            Members Only
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {isMemberOnly
              ? 'Only members can view this content'
              : 'Anyone can view this content'}
          </p>
        </div>
      </div>

      {/* Tier Selection (conditional) */}
      {isMemberOnly && hasTiers && (
        <div className="pl-7 space-y-2">
          <label
            htmlFor="requiredTierId"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Required Tier (Optional)
          </label>
          <select
            id="requiredTierId"
            name="requiredTierId"
            value={requiredTierId || ''}
            onChange={(e) => onTierChange(e.target.value || null)}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">All Members (Any Tier)</option>
            {membershipTiers.map((tier) => (
              <option key={tier.id} value={tier.id}>
                {tier.name} ({tier.price} {tier.currency})
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {requiredTierId
              ? 'Only members with this tier or higher can view'
              : 'All active members can view this content'}
          </p>
        </div>
      )}

      {/* Info Box */}
      {isMemberOnly && (
        <div className="pl-7">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="flex gap-2">
              <FiLock className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-blue-800 dark:text-blue-300 font-medium">
                  Member-Only Content
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                  Non-members will see this content with a lock overlay and a prompt to
                  join your membership. This is a great way to encourage subscriptions!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
