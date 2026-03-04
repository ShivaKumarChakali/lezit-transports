import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium capitalize',
  {
    variants: {
      status: {
        pending: 'border-warning/25 bg-warning/10 text-warning',
        confirmed: 'border-success/25 bg-success/10 text-success',
        'in-progress': 'border-primary/25 bg-primary/10 text-primary',
        completed: 'border-success/20 bg-success/10 text-success',
        cancelled: 'border-danger/20 bg-danger/10 text-danger',
        paid: 'border-success/20 bg-success/10 text-success',
        failed: 'border-danger/20 bg-danger/10 text-danger',
        default: 'border-muted bg-muted text-muted-foreground'
      }
    },
    defaultVariants: {
      status: 'default'
    }
  }
);

type Status = NonNullable<VariantProps<typeof badgeVariants>['status']>;

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: Status;
  label?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status = 'default', label, className }) => (
  <span className={cn(badgeVariants({ status }), className)}>{label ?? status.replace('-', ' ')}</span>
);
