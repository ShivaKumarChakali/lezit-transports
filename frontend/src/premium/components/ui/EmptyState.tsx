import React from 'react';
import { Inbox } from 'lucide-react';
import { Card } from './Card';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, action }) => (
  <Card className="flex flex-col items-center justify-center py-10 text-center">
    <div className="mb-3 rounded-xl bg-muted p-3 text-muted-foreground">
      <Inbox className="h-5 w-5" />
    </div>
    <p className="mb-1 text-base font-semibold text-foreground">{title}</p>
    <p className="mb-5 max-w-md text-sm text-muted-foreground">{description}</p>
    {action}
  </Card>
);
