import React from 'react';
import { cn } from '../../../lib/utils';

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div
    className={cn('relative overflow-hidden rounded-xl bg-muted/80 before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:animate-shimmer dark:before:via-white/10', className)}
    {...props}
  />
);
