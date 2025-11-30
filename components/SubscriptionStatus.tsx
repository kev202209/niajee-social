import { FiCheck, FiX, FiClock, FiAlertCircle } from 'react-icons/fi';

interface SubscriptionStatusProps {
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  expiresAt?: string | null;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export default function SubscriptionStatus({
  status,
  expiresAt,
  size = 'sm',
  showLabel = true,
  className = '',
}: SubscriptionStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return {
          icon: FiCheck,
          label: 'Active',
          color: 'text-green-600 dark:text-green-400',
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-800',
        };
      case 'expired':
        return {
          icon: FiX,
          label: 'Expired',
          color: 'text-red-600 dark:text-red-400',
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
        };
      case 'cancelled':
        return {
          icon: FiX,
          label: 'Cancelled',
          color: 'text-orange-600 dark:text-orange-400',
          bg: 'bg-orange-50 dark:bg-orange-900/20',
          border: 'border-orange-200 dark:border-orange-800',
        };
      case 'pending':
        return {
          icon: FiClock,
          label: 'Pending',
          color: 'text-yellow-600 dark:text-yellow-400',
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          border: 'border-yellow-200 dark:border-yellow-800',
        };
      default:
        return {
          icon: FiAlertCircle,
          label: 'Unknown',
          color: 'text-gray-600 dark:text-gray-400',
          bg: 'bg-gray-50 dark:bg-gray-900/20',
          border: 'border-gray-200 dark:border-gray-800',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  const getExpiryText = () => {
    if (!expiresAt) return null;
    
    const daysUntilExpiry = Math.ceil(
      (new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiry <= 0) return null;
    if (daysUntilExpiry <= 7) {
      return (
        <span className="text-xs text-orange-600 dark:text-orange-400 ml-1">
          (expires in {daysUntilExpiry}d)
        </span>
      );
    }
    return null;
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium border ${config.color} ${config.bg} ${config.border} ${sizeClasses[size]} ${className}`}
    >
      <Icon className={iconSizes[size]} />
      {showLabel && (
        <>
          {config.label}
          {status === 'active' && getExpiryText()}
        </>
      )}
    </span>
  );
}
