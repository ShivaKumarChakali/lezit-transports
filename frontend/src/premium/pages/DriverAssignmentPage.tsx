import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock3, Truck, UserCheck } from 'lucide-react';
import apiService from '../../services/api';
import { Booking, User } from '../../types';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { Skeleton } from '../components/ui/Skeleton';
import { StatsCard } from '../components/ui/StatsCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Table } from '../components/ui/Table';

const DriverAssignmentPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [availableDrivers, setAvailableDrivers] = useState<User[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    const loadAssignmentData = async () => {
      try {
        const bookingsResponse = await apiService.getMyBookings();
        if (bookingsResponse.success) {
          setBookings(bookingsResponse.data?.bookings || []);
        }

        const driversResponse = await apiService.driver.getAvailableDrivers();
        if (driversResponse.success) {
          setAvailableDrivers(driversResponse.data || []);
        }
      } catch (error) {
        setAvailableDrivers([]);
      } finally {
        setLoading(false);
      }
    };

    loadAssignmentData();
  }, []);

  const assignmentQueue = useMemo(
    () => bookings.filter((booking) => ['pending', 'confirmed'].includes(booking.status) && !booking.assignedDriver),
    [bookings]
  );

  const assignedCount = useMemo(() => bookings.filter((booking) => booking.assignedDriver).length, [bookings]);

  const columns = useMemo(
    () => [
      {
        key: 'route',
        header: 'Route',
        render: (row: Booking) => (
          <div>
            <p className="font-medium text-foreground">{row.pickupLocation}</p>
            <p className="text-xs text-muted-foreground">to {row.dropLocation}</p>
          </div>
        )
      },
      {
        key: 'schedule',
        header: 'Schedule',
        render: (row: Booking) => (
          <p className="text-foreground">
            {new Date(row.pickupDate).toLocaleDateString()} <span className="text-muted-foreground">{row.pickupTime}</span>
          </p>
        )
      },
      {
        key: 'status',
        header: 'Status',
        render: (row: Booking) => <StatusBadge status={row.status} />
      },
      {
        key: 'assign',
        header: '',
        render: (row: Booking) => (
          <button
            onClick={() => setSelectedBooking(row)}
            className="rounded-xl border border-border/60 bg-background px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted"
          >
            Assign Driver
          </button>
        )
      }
    ],
    []
  );

  return (
    <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Driver Assignment</h1>
        <p className="text-sm text-muted-foreground">Dispatch workspace for routing unassigned trips to available drivers quickly.</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatsCard label="Unassigned" value={assignmentQueue.length.toString()} icon={Clock3} />
            <StatsCard label="Assigned" value={assignedCount.toString()} icon={UserCheck} />
            <StatsCard label="Available Drivers" value={availableDrivers.length.toString()} icon={Truck} />
            <StatsCard label="Ready To Dispatch" value={(assignmentQueue.length > 0 && availableDrivers.length > 0 ? assignmentQueue.length : 0).toString()} icon={CheckCircle2} />
          </div>

          <div className="mt-5">
            {assignmentQueue.length === 0 ? (
              <EmptyState
                title="No assignment backlog"
                description="All active bookings currently have drivers assigned or are not ready for dispatch."
              />
            ) : (
              <Table columns={columns} data={assignmentQueue} rowKey={(row) => row._id} />
            )}
          </div>
        </>
      )}

      <Modal
        open={Boolean(selectedBooking)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedBooking(null);
          }
        }}
        title="Assign Driver"
        description="Choose an available driver for this trip."
      >
        <div className="space-y-2">
          {availableDrivers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No available drivers found for immediate assignment.</p>
          ) : (
            availableDrivers.slice(0, 6).map((driver) => (
              <div key={driver.id} className="flex items-center justify-between rounded-xl border border-border/60 bg-background px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-foreground">{driver.name}</p>
                  <p className="text-xs text-muted-foreground">{driver.phone || 'Phone unavailable'}</p>
                </div>
                <button className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">Select</button>
              </div>
            ))
          )}
          <p className="pt-1 text-xs text-muted-foreground">API-driven assign action can be connected once backend assignment endpoint is exposed.</p>
        </div>
      </Modal>
    </motion.section>
  );
};

export default DriverAssignmentPage;
