import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';

interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string;
  className?: string;
}

export function Table<T>({ columns, data, rowKey, className }: TableProps<T>) {
  return (
    <div className={cn('overflow-hidden rounded-2xl border border-border/60 bg-card', className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-muted/40">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn('px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground', column.className)}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {data.map((row, index) => (
              <motion.tr
                key={rowKey(row)}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: index * 0.02 }}
                className="group transition-colors hover:bg-muted/30"
              >
                {columns.map((column) => (
                  <td key={column.key} className={cn('px-4 py-4 text-sm text-foreground', column.className)}>
                    {column.render(row)}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
