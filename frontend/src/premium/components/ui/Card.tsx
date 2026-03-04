import React from 'react';
import { cn } from '../../../lib/utils';

export const Card = React.memo(
  ({ className, children }: React.HTMLAttributes<HTMLDivElement>) => (
    <section
      className={cn(
        'rounded-2xl border border-border/60 bg-card p-4 shadow-card transition-shadow duration-200 md:p-5',
        'hover:shadow-soft',
        className
      )}
    >
      {children}
    </section>
  )
);

Card.displayName = 'Card';

export const CardHeader = ({ className, children }: React.HTMLAttributes<HTMLDivElement>) => (
  <header className={cn('mb-4 flex items-center justify-between gap-4', className)}>{children}</header>
);

export const CardTitle = ({ className, children }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn('text-sm font-semibold tracking-tight text-foreground', className)}>{children}</h3>
);

export const CardDescription = ({ className, children }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn('text-sm text-muted-foreground', className)}>{children}</p>
);

export const CardContent = ({ className, children }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('space-y-3', className)}>{children}</div>
);
