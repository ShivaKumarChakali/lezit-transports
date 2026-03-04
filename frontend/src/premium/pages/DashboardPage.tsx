import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarClock, CircleDollarSign, PackageCheck, Truck } from 'lucide-react';
import apiService from '../../services/api';
import { Booking } from '../../types';
import { RevenueBars } from '../components/charts/RevenueBars';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { StatsCard } from '../components/ui/StatsCard';

const DashboardPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await apiService.getMyBookings();
        if (response.success) {
          setBookings(response.data?.bookings ?? []);
        }
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const stats = useMemo(() => {
    const active = bookings.filter((booking) => ['pending', 'confirmed', 'in-progress'].includes(booking.status)).length;
    const completed = bookings.filter((booking) => booking.status === 'completed').length;
    const revenue = bookings.reduce((total, booking) => total + (booking.totalAmount || 0), 0);
    const assignedDrivers = bookings.filter((booking) => booking.assignedDriver).length;

    return { active, completed, revenue, assignedDrivers };
  }, [bookings]);

  const revenueSnapshot = useMemo(() => {
    const monthMap = new Map<string, number>();
    bookings.forEach((booking) => {
      const key = new Date(booking.createdAt).toLocaleString('en-US', { month: 'short' });
      monthMap.set(key, (monthMap.get(key) || 0) + booking.totalAmount);
    });

    const labels = Array.from(monthMap.keys()).slice(-6);
    const values = labels.map((label) => monthMap.get(label) || 0);
    return { labels, values };
  }, [bookings]);

  if (loading) {
    return (
      <div className="grid gap-4">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
    );
  }

  return (
    <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Operations Dashboard</h1>
          <p className="text-sm text-muted-foreground">Multi-tenant ready overview with booking, revenue, and fleet utilization.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard label="Active Bookings" value={stats.active.toString()} delta="Currently in pipeline" icon={CalendarClock} />
        <StatsCard label="Completed Trips" value={stats.completed.toString()} delta="Closed this period" icon={PackageCheck} />
        <StatsCard label="Revenue" value={`₹${stats.revenue.toLocaleString()}`} delta="Gross processed" icon={CircleDollarSign} />
        <StatsCard label="Driver Assigned" value={stats.assignedDrivers.toString()} delta="Fulfillment readiness" icon={Truck} />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription>Compact monthly trend visualization for finance and admin teams.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <RevenueBars values={revenueSnapshot.values.length ? revenueSnapshot.values : [0]} labels={revenueSnapshot.labels.length ? revenueSnapshot.labels : ['Current']} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Operational Clarity</CardTitle>
              <CardDescription>Density-first metrics for quick decisioning.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p className="rounded-xl bg-muted/50 px-3 py-2">Average booking value: <span className="font-medium text-foreground">₹{Math.round(stats.revenue / Math.max(bookings.length, 1)).toLocaleString()}</span></p>
            <p className="rounded-xl bg-muted/50 px-3 py-2">Conversion to completion: <span className="font-medium text-foreground">{Math.round((stats.completed / Math.max(bookings.length, 1)) * 100)}%</span></p>
            <p className="rounded-xl bg-muted/50 px-3 py-2">Driver assignment rate: <span className="font-medium text-foreground">{Math.round((stats.assignedDrivers / Math.max(bookings.length, 1)) * 100)}%</span></p>
          </CardContent>
        </Card>
      </div>
    </motion.section>
  );
};

export default DashboardPage;
