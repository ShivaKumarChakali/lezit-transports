import React from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Card } from './Card';

interface StatsCardProps {
  label: string;
  value: string;
  delta?: string;
  icon: LucideIcon;
}

export const StatsCard: React.FC<StatsCardProps> = React.memo(({ label, value, delta, icon: Icon }) => (
  <motion.div whileHover={{ y: -2 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }}>
    <Card className="h-full bg-gradient-to-b from-card to-card/95">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-foreground md:text-3xl">{value}</p>
          {delta && <p className="mt-1 text-xs text-muted-foreground">{delta}</p>}
        </div>
        <div className="rounded-xl border border-border/60 bg-muted/40 p-2">
          <Icon className="h-4 w-4 text-primary md:h-5 md:w-5" />
        </div>
      </div>
    </Card>
  </motion.div>
));

StatsCard.displayName = 'StatsCard';
