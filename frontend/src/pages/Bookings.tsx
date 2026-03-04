import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarClock, CheckCircle2, IndianRupee, XCircle } from 'lucide-react';
import apiService from '../services/api';
import { Booking } from '../types';
import { toast } from 'react-toastify';
import { BookingTable } from '../premium/components/booking/BookingTable';
import { Card, CardDescription, CardHeader, CardTitle } from '../premium/components/ui/Card';
import { EmptyState } from '../premium/components/ui/EmptyState';
import { Modal } from '../premium/components/ui/Modal';
import { Skeleton } from '../premium/components/ui/Skeleton';
import { StatsCard } from '../premium/components/ui/StatsCard';

const Bookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await apiService.getMyBookings();
      if (response.success) {
        setBookings(response.data?.bookings || []);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        const response = await apiService.cancelBooking(bookingId);
        if (response.success) {
          toast.success('Booking cancelled successfully');
          fetchBookings(); // Refresh the list
        }
      } catch (error) {
        console.error('Error cancelling booking:', error);
        toast.error('Failed to cancel booking');
      }
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (activeTab === 'upcoming') {
      return ['pending', 'confirmed', 'in-progress'].includes(booking.status);
    } else if (activeTab === 'past') {
      return booking.status === 'completed';
    } else if (activeTab === 'cancelled') {
      return booking.status === 'cancelled';
    }
    return true;
  });

  if (loading) {
    return (
      <div className="space-y-3 p-4 md:p-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="p-4 md:p-6">
      <Card className="mb-5">
        <CardHeader>
          <div>
            <CardTitle className="text-xl md:text-2xl">My Bookings</CardTitle>
            <CardDescription>Track active, completed, and cancelled trips from one premium workspace.</CardDescription>
          </div>
          <Link
            to="/bookings/new"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            New Booking
          </Link>
        </CardHeader>
      </Card>

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          label="Upcoming"
          value={bookings.filter((booking) => ['pending', 'confirmed', 'in-progress'].includes(booking.status)).length.toString()}
          icon={CalendarClock}
        />
        <StatsCard
          label="Completed"
          value={bookings.filter((booking) => booking.status === 'completed').length.toString()}
          icon={CheckCircle2}
        />
        <StatsCard
          label="Cancelled"
          value={bookings.filter((booking) => booking.status === 'cancelled').length.toString()}
          icon={XCircle}
        />
        <StatsCard
          label="Total Spent"
          value={`₹${bookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0).toLocaleString()}`}
          icon={IndianRupee}
        />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`rounded-xl px-3 py-1.5 text-sm font-medium transition ${
            activeTab === 'upcoming' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`rounded-xl px-3 py-1.5 text-sm font-medium transition ${
            activeTab === 'past' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          Past
        </button>
        <button
          onClick={() => setActiveTab('cancelled')}
          className={`rounded-xl px-3 py-1.5 text-sm font-medium transition ${
            activeTab === 'cancelled' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          Cancelled
        </button>
      </div>

      {filteredBookings.length === 0 ? (
        <EmptyState
          title={`No ${activeTab} bookings`}
          description={
            activeTab === 'upcoming'
              ? "You don't have any upcoming bookings yet."
              : `You don't have any ${activeTab} bookings.`
          }
          action={
            activeTab === 'upcoming' ? (
              <Link
                to="/bookings/new"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                Create Booking
              </Link>
            ) : undefined
          }
        />
      ) : (
        <BookingTable
          bookings={filteredBookings}
          onCancelBooking={handleCancelBooking}
          onViewDetails={setSelectedBooking}
        />
      )}

      <Modal
        open={Boolean(selectedBooking)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedBooking(null);
          }
        }}
        title="Booking Details"
        description="Quick operational summary"
      >
        {selectedBooking ? (
          <div className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Service:</span> {selectedBooking.serviceCategory}</p>
            <p><span className="text-muted-foreground">Route:</span> {selectedBooking.pickupLocation} → {selectedBooking.dropLocation}</p>
            <p><span className="text-muted-foreground">Schedule:</span> {new Date(selectedBooking.pickupDate).toLocaleDateString()} {selectedBooking.pickupTime}</p>
            <p><span className="text-muted-foreground">Amount:</span> ₹{selectedBooking.totalAmount.toLocaleString()}</p>
            <p><span className="text-muted-foreground">Status:</span> {selectedBooking.status}</p>
          </div>
        ) : null}
      </Modal>
    </motion.section>
  );
};

export default Bookings; 