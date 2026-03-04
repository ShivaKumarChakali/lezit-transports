import React from 'react';

interface RevenueBarsProps {
  values: number[];
  labels: string[];
}

export const RevenueBars: React.FC<RevenueBarsProps> = ({ values, labels }) => {
  const max = Math.max(...values, 1);

  return (
    <div className="space-y-3">
      {values.map((value, index) => (
        <div key={labels[index]} className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{labels[index]}</span>
            <span>₹{value.toLocaleString()}</span>
          </div>
          <div className="h-2 rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-primary/75 to-primary"
              style={{ width: `${(value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
