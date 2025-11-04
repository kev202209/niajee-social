import { FiCheck } from 'react-icons/fi';

interface MemberBadgeProps {
  tierName: string;
  tierColor: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export default function MemberBadge({
  tierName,
  tierColor,
  size = 'sm',
  showIcon = true,
  className = '',
}: MemberBadgeProps) {
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

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: `${tierColor}20`,
        color: tierColor,
        borderWidth: '1px',
        borderColor: `${tierColor}40`,
      }}
    >
      {showIcon && <FiCheck className={iconSizes[size]} />}
      {tierName}
    </span>
  );
}
