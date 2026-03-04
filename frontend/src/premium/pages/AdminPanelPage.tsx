import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, BriefcaseBusiness, Users, Wallet } from 'lucide-react';
import apiService from '../../services/api';
import { AdminBooking, AdminUser, DashboardStats } from '../../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { StatsCard } from '../components/ui/StatsCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Table } from '../components/ui/Table';

const AdminPanelPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        const [statsResponse, usersResponse, bookingsResponse] = await Promise.all([
          apiService.getAdminStats(),
          apiService.getAdminUsers(),
          apiService.getAdminBookings()
        ]);

        if (statsResponse.success && statsResponse.data) {
          setStats(statsResponse.data);
        }

        if (usersResponse.success && usersResponse.data) {
          setUsers(usersResponse.data);
        }

        if (bookingsResponse.success && bookingsResponse.data) {
          setBookings(bookingsResponse.data);
        }
      } catch (error: any) {
        const statusCode = error?.response?.status;
        if (statusCode === 401 || statusCode === 403) {
          setAuthorized(false);
        }
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();
  }, []);

  const userColumns = useMemo(
    () => [
      {
        key: 'name',
        header: 'User',
        render: (row: AdminUser) => (
          <div>
            <p className="font-medium text-foreground">{row.name}</p>
            <p className="text-xs text-muted-foreground">{row.email}</p>
          </div>
        )
      },
      {
        key: 'role',
        header: 'Role',
        render: (row: AdminUser) => <p className="capitalize text-foreground">{row.role}</p>
      },
      {
        key: 'status',
        header: 'Status',
        render: (row: AdminUser) => <StatusBadge status={row.isActive ? 'confirmed' : 'cancelled'} label={row.isActive ? 'Active' : 'Inactive'} />
      },
      {
        key: 'createdAt',
        header: 'Created',
        render: (row: AdminUser) => <p className="text-muted-foreground">{new Date(row.createdAt).toLocaleDateString()}</p>
      }
    ],
    []
  );

  const bookingColumns = useMemo(
    () => [
      {
        key: 'service',
        header: 'Service',
        render: (row: AdminBooking) => (
          <div>
            <p className="font-medium text-foreground">{row.serviceCategory}</p>
            <p className="text-xs text-muted-foreground">{row.pickupLocation} → {row.dropLocation}</p>
          </div>
        )
      },
      {
        key: 'amount',
        header: 'Amount',
        render: (row: AdminBooking) => <p className="font-semibold text-foreground">₹{row.totalAmount.toLocaleString()}</p>
      },
      {
        key: 'status',
        header: 'Status',
        render: (row: AdminBooking) => <StatusBadge status={row.status as any} />
      },
      {
        key: 'pickupDate',
        header: 'Pickup Date',
        render: (row: AdminBooking) => <p className="text-muted-foreground">{new Date(row.pickupDate).toLocaleDateString()}</p>
      }
    ],
    []
  );

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!authorized) {
    return (
      <EmptyState
        title="Admin access required"
        description="This workspace is restricted to administrators for tenant governance and operations control."
      />
    );
  }

  return (
    <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Admin Panel</h1>
        <p className="text-sm text-muted-foreground">Governance view for users, bookings, and platform-level performance controls.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard label="Total Users" value={String(stats?.totalUsers || users.length)} icon={Users} />
        <StatsCard label="Total Bookings" value={String(stats?.totalBookings || bookings.length)} icon={BriefcaseBusiness} />
        <StatsCard label="Revenue" value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`} icon={Wallet} />
        <StatsCard label="Pending" value={String(stats?.pendingBookings || 0)} icon={AlertTriangle} />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Users</CardTitle>
              <CardDescription>Identity and account status overview.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <EmptyState title="No users found" description="Users will appear here once onboarding starts." />
            ) : (
              <Table columns={userColumns} data={users.slice(0, 8)} rowKey={(row) => row._id} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>Latest booking activity across tenants.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <EmptyState title="No bookings found" description="Booking activity appears here after order creation." />
            ) : (
              <Table columns={bookingColumns} data={bookings.slice(0, 8)} rowKey={(row) => row._id} />
            )}
          </CardContent>
        </Card>
      </div>
    </motion.section>
  );
};

export default AdminPanelPage;
