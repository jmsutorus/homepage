'use client';

import { Subscription } from '@/lib/db/subscriptions';
import { cn } from '@/lib/utils';

interface SubscriptionEditorialCardProps {
  subscription: Subscription;
  onEdit: (sub: Subscription) => void;
  variant?: 'primary' | 'surface' | 'accent';
}

const categoryIcons: Record<string, string> = {
  'Entertainment': 'headphones',
  'Streaming': 'movie',
  'Cloud': 'cloud',
  'Productivity': 'auto_awesome',
  'Finance': 'account_balance',
  'Utilities': 'bolt',
  'Lifestyle': 'fitness_center',
  'Food': 'restaurant',
  'Premium Card': 'credit_card',
  'Bundled': 'layers',
};

const defaultIcon = 'payments';

export function SubscriptionEditorialCard({
  subscription,
  onEdit,
  variant = 'surface',
}: SubscriptionEditorialCardProps) {
  const isPrimary = variant === 'primary';
  const isAccent = variant === 'accent';
  const isSurface = variant === 'surface';

  const iconName = categoryIcons[subscription.category || ''] || defaultIcon;

  return (
    <div
      onClick={() => onEdit(subscription)}
      className={cn(
        "p-6 rounded-2xl flex flex-col justify-between min-h-[200px] transition-all duration-300 cursor-pointer hover:translate-y-[-4px]",
        isPrimary && "bg-media-primary text-media-surface-bright",
        isAccent && "bg-media-secondary text-media-on-secondary",
        isSurface && "bg-media-surface-container-high hover:bg-media-surface-container-highest transition-colors border-0"
      )}
    >
      <div className="flex justify-between items-start">
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center",
          isPrimary && "bg-media-primary-container",
          isAccent && "bg-media-on-secondary-container/20",
          isSurface && "bg-media-surface-container-lowest"
        )}>
          <span className={cn(
            "material-symbols-outlined text-xl",
            isPrimary && "text-media-surface-bright",
            isAccent && "text-media-on-secondary",
            isSurface && "text-media-primary"
          )}>
            {iconName}
          </span>
        </div>
        <div className="text-right">
          <div className={cn(
            "font-bold text-sm",
            isPrimary && "text-media-surface-bright",
            isAccent && "text-media-on-secondary",
            isSurface && "text-media-primary"
          )}>
            {subscription.name}
          </div>
          <div className={cn(
            "text-[8px] font-medium uppercase tracking-widest",
            isPrimary && "text-media-on-primary-container",
            isAccent && "text-media-white/60",
            isSurface && "text-media-on-surface-variant"
          )}>
            {subscription.category || 'Subscription'}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-end mt-8">
        <div>
          <div className={cn(
            "text-[8px] font-bold uppercase tracking-widest mb-1",
            isPrimary && "text-media-on-primary-container",
            isAccent && "text-media-secondary-fixed/60",
            isSurface && "text-media-on-surface-variant"
          )}>
            {subscription.billing_day ? 'Next Billing' : 'Billing Cycle'}
          </div>
          <div className={cn(
            "text-xs font-medium",
            isPrimary && "text-media-surface-bright",
            isAccent && "text-media-on-secondary",
            isSurface && "text-media-primary"
          )}>
            {subscription.billing_day 
              ? `Day ${subscription.billing_day}` 
              : subscription.cycle.charAt(0).toUpperCase() + subscription.cycle.slice(1)}
          </div>
        </div>
        <div className="text-right">
          <div className={cn(
            "text-xl font-bold",
            isPrimary && "text-media-surface-bright",
            isAccent && "text-media-on-secondary",
            isSurface && "text-media-primary"
          )}>
            ${subscription.price.toFixed(2)}
          </div>
          <div className={cn(
            "text-[8px] uppercase tracking-tighter",
            isPrimary && "text-media-on-primary-container",
            isAccent && "text-media-secondary-fixed/80",
            isSurface && "text-media-on-surface-variant"
          )}>
            {subscription.cycle}
          </div>
        </div>
      </div>
    </div>
  );
}
