import React, { useMemo } from 'react';
import { CalendarClock, MapPin, MoreHorizontal } from 'lucide-react';
import { Booking } from '../../../types';
import { Table } from '../ui/Table';
import { StatusBadge } from '../ui/StatusBadge';

interface BookingTableProps {
  bookings: Booking[];
  onCancelBooking?: (bookingId: string) => void;
  onViewDetails?: (booking: Booking) => void;
}

export const BookingTable: React.FC<BookingTableProps> = ({ bookings, onCancelBooking, onViewDetails }) => {
  const columns = useMemo(
    () => [
      {
        key: 'route',
        header: 'Route',
        render: (row: Booking) => (
          <div>
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              <span>{row.pickupLocation}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">to {row.dropLocation}</p>
          </div>
        )
      },
      {
        key: 'date',
        header: 'Schedule',
        render: (row: Booking) => (
          <div className="flex items-center gap-2 text-sm text-foreground">
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p>{new Date(row.pickupDate).toLocaleDateString()}</p>
              <p className="text-xs text-muted-foreground">{row.pickupTime}</p>
            </div>
          </div>
        )
      },
      {
        key: 'service',
        header: 'Service',
        render: (row: Booking) => (
          <div>
            <p className="font-medium text-foreground">{row.serviceCategory}</p>
            <p className="text-xs capitalize text-muted-foreground">{row.serviceType}</p>
          </div>
        )
      },
      {
        key: 'payment',
        header: 'Payment',
        render: (row: Booking) => (
          <div>
            <p className="font-semibold text-foreground">₹{(row.totalAmount || 0).toLocaleString()}</p>
            <StatusBadge status={row.paymentStatus === 'pending' ? 'pending' : row.paymentStatus} />
          </div>
        )
      },
      {
        key: 'status',
        header: 'Status',
        render: (row: Booking) => <StatusBadge status={row.status} />
      },
      {
        key: 'actions',
        header: '',
        className: 'w-40',
        render: (row: Booking) => {
          const canCancel = ['pending', 'confirmed'].includes(row.status);

          return (
            <div className="flex items-center justify-end gap-2">
              {canCancel && onCancelBooking ? (
                <button
                  onClick={() => onCancelBooking(row._id)}
                  className="rounded-lg border border-danger/30 bg-danger/10 px-2.5 py-1 text-xs font-medium text-danger transition hover:bg-danger/15"
                >
                  Cancel
                </button>
              ) : null}

              {onViewDetails ? (
                <button
                  onClick={() => onViewDetails(row)}
                  className="rounded-lg border border-border/70 bg-background px-2.5 py-1 text-xs font-medium text-foreground transition hover:bg-muted"
                >
                  Details
                </button>
              ) : (
                <button className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              )}
            </div>
          );
        }
      }
    ],
    [onCancelBooking, onViewDetails]
  );

  return <Table columns={columns} data={bookings} rowKey={(row) => row._id} />;
};
