import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Booking } from '../../types';
import apiService from '../../services/api';
import { BookingTable } from '../components/booking/BookingTable';
import { Card, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';

const BookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await apiService.getMyBookings();
        if (response.success) {
          setBookings(response.data?.bookings || []);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const upcomingBookings = useMemo(
    () => bookings.filter((booking) => ['pending', 'confirmed', 'in-progress'].includes(booking.status)),
    [bookings]
  );

  return (
    <motion.section initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <Card className="mb-5">
        <CardHeader>
          <div>
            <CardTitle className="text-xl md:text-2xl">Booking Management</CardTitle>
            <CardDescription>Modern operations console for active and historical shipments.</CardDescription>
          </div>
          <Link
            to="/bookings/new"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            New Booking
          </Link>
        </CardHeader>
      </Card>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : upcomingBookings.length === 0 ? (
        <EmptyState
          title="No active bookings"
          description="Create a shipment to start tracking pickups, driver assignment, and payments in one view."
          action={
            <Link
              to="/bookings/new"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              <Plus className="h-4 w-4" />
              Create Booking
            </Link>
          }
        />
      ) : (
        <BookingTable bookings={upcomingBookings} />
      )}
    </motion.section>
  );
};

export default BookingsPage;
