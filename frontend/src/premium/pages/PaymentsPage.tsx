import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CircleDollarSign, CreditCard, Hourglass, ShieldCheck } from 'lucide-react';
import apiService from '../../services/api';
import { Booking } from '../../types';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { StatsCard } from '../components/ui/StatsCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Table } from '../components/ui/Table';

const PaymentsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await apiService.getMyBookings();
        if (response.success) {
          setBookings(response.data?.bookings || []);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const paymentStats = useMemo(() => {
    const paid = bookings.filter((booking) => booking.paymentStatus === 'paid');
    const pending = bookings.filter((booking) => booking.paymentStatus === 'pending');
    const failed = bookings.filter((booking) => booking.paymentStatus === 'failed');

    return {
      paidCount: paid.length,
      pendingCount: pending.length,
      failedCount: failed.length,
      collectedAmount: paid.reduce((total, booking) => total + booking.totalAmount, 0)
    };
  }, [bookings]);

  const columns = useMemo(
    () => [
      {
        key: 'reference',
        header: 'Booking',
        render: (row: Booking) => (
          <div>
            <p className="font-medium text-foreground">{row._id.slice(-8).toUpperCase()}</p>
            <p className="text-xs text-muted-foreground">{row.serviceCategory}</p>
          </div>
        )
      },
      {
        key: 'amount',
        header: 'Amount',
        render: (row: Booking) => <p className="font-semibold text-foreground">₹{(row.totalAmount || 0).toLocaleString()}</p>
      },
      {
        key: 'method',
        header: 'Method',
        render: (row: Booking) => <p className="capitalize text-foreground">{row.paymentMethod || 'Not specified'}</p>
      },
      {
        key: 'status',
        header: 'Payment Status',
        render: (row: Booking) => <StatusBadge status={row.paymentStatus === 'pending' ? 'pending' : row.paymentStatus} />
      },
      {
        key: 'date',
        header: 'Updated',
        render: (row: Booking) => <p className="text-muted-foreground">{new Date(row.updatedAt).toLocaleDateString()}</p>
      }
    ],
    []
  );

  return (
    <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Payments</h1>
        <p className="text-sm text-muted-foreground">Compact finance command center for transaction tracking and payout reliability.</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState
          title="No payment activity"
          description="Payment insights will appear once bookings are created and transaction statuses are updated."
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatsCard label="Collected" value={`₹${paymentStats.collectedAmount.toLocaleString()}`} icon={CircleDollarSign} />
            <StatsCard label="Paid Bookings" value={paymentStats.paidCount.toString()} icon={ShieldCheck} />
            <StatsCard label="Pending" value={paymentStats.pendingCount.toString()} icon={Hourglass} />
            <StatsCard label="Failures" value={paymentStats.failedCount.toString()} icon={CreditCard} />
          </div>

          <div className="mt-5">
            <Table columns={columns} data={bookings.slice(0, 10)} rowKey={(row) => row._id} />
          </div>
        </>
      )}
    </motion.section>
  );
};

export default PaymentsPage;
