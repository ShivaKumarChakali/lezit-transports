import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Shield, Users, Calendar, Cog } from 'lucide-react';
import apiService from '../services/api';
import { DashboardStats, AdminUser, AdminBooking, AdminService } from '../types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../premium/components/ui/Card';
import { StatsCard } from '../premium/components/ui/StatsCard';
import { StatusBadge } from '../premium/components/ui/StatusBadge';
import { Skeleton } from '../premium/components/ui/Skeleton';
import { EmptyState } from '../premium/components/ui/EmptyState';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingBookings: 0,
    activeServices: 0
  });
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [services, setServices] = useState<AdminService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      navigate('/');
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch dashboard statistics
      const statsResponse = await apiService.getAdminStats();
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }

      // Fetch users
      const usersResponse = await apiService.getAdminUsers();
      if (usersResponse.success && usersResponse.data) {
        setUsers(usersResponse.data);
      }

      // Fetch bookings
      const bookingsResponse = await apiService.getAdminBookings();
      if (bookingsResponse.success && bookingsResponse.data) {
        setBookings(bookingsResponse.data);
      }

      // Fetch services
      const servicesResponse = await apiService.getServices();
      if (servicesResponse.success && servicesResponse.data) {
        setServices(servicesResponse.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const response = await apiService.updateBookingStatus(bookingId, status);
      if (response.success) {
        toast.success('Booking status updated successfully');
        fetchDashboardData();
      } else {
        toast.error(response.message || 'Failed to update booking status');
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Failed to update booking status');
    }
  };

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const response = await apiService.updateUserStatus(userId, isActive);
      if (response.success) {
        toast.success('User status updated successfully');
        fetchDashboardData();
      } else {
        toast.error(response.message || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const handleToggleServiceStatus = async (serviceId: string, isActive: boolean) => {
    try {
      const response = await apiService.updateServiceStatus(serviceId, isActive);
      if (response.success) {
        toast.success('Service status updated successfully');
        fetchDashboardData();
      } else {
        toast.error(response.message || 'Failed to update service status');
      }
    } catch (error) {
      console.error('Error updating service status:', error);
      toast.error('Failed to update service status');
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Shield },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'services', label: 'Services', icon: Cog },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-7xl mx-auto px-4 py-8 space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted mt-1">Welcome back, {user?.name}</p>
        </div>
        <Shield className="w-8 h-8 text-primary opacity-60" />
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-border">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ y: -2 }}
              className={`px-4 py-3 text-sm font-medium transition-colors flex items-center gap-2 border-b-2 ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </motion.button>
          );
        })}
      </div>


      {/* Tab Content */}
      <div>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                label="Total Users"
                value={stats.totalUsers.toString()}
                icon={Users}
              />
              <StatsCard
                label="Total Bookings"
                value={stats.totalBookings.toString()}
                icon={Calendar}
              />
              <StatsCard
                label="Pending Bookings"
                value={stats.pendingBookings.toString()}
                icon={Calendar}
              />
              <StatsCard
                label="Total Revenue"
                value={`₹${stats.totalRevenue.toLocaleString()}`}
                icon={Shield}
              />
            </div>

            {/* Recent Activity Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Bookings */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Bookings</CardTitle>
                  <CardDescription>Latest booking activities</CardDescription>
                </CardHeader>
                <CardContent>
                  {bookings.slice(0, 5).length === 0 ? (
                    <EmptyState
                      title="No bookings yet"
                      description="No recent booking activity to display"
                    />
                  ) : (
                    <div className="space-y-3">
                      {bookings.slice(0, 5).map((booking) => (
                        <motion.div
                          key={booking._id}
                          initial={{ opacity: 0, x: -4 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex justify-between items-start p-3 rounded-lg bg-card hover:bg-muted transition-colors"
                        >
                          <div>
                            <p className="font-medium text-foreground">{booking.serviceCategory}</p>
                            <p className="text-xs text-muted mt-1">
                              {booking.pickupLocation} → {booking.dropLocation}
                            </p>
                          </div>
                          <StatusBadge status={booking.status as any} />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Users */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Users</CardTitle>
                  <CardDescription>Latest user registrations</CardDescription>
                </CardHeader>
                <CardContent>
                  {users.slice(0, 5).length === 0 ? (
                    <EmptyState
                      title="No users yet"
                      description="No recent user registrations to display"
                    />
                  ) : (
                    <div className="space-y-3">
                      {users.slice(0, 5).map((u) => (
                        <motion.div
                          key={u._id}
                          initial={{ opacity: 0, x: -4 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex justify-between items-start p-3 rounded-lg bg-card hover:bg-muted transition-colors"
                        >
                          <div>
                            <p className="font-medium text-foreground">{u.name}</p>
                            <p className="text-xs text-muted mt-1">{u.email}</p>
                          </div>
                          <StatusBadge
                            status={u.isActive ? 'confirmed' : 'cancelled'}
                          />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Manage Users</CardTitle>
                <CardDescription>View and manage user accounts and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                {users.length === 0 ? (
                  <EmptyState
                    title="No users found"
                    description="There are no users in the system yet"
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 font-medium text-muted">Name</th>
                          <th className="text-left py-3 px-4 font-medium text-muted">Email</th>
                          <th className="text-left py-3 px-4 font-medium text-muted">Phone</th>
                          <th className="text-left py-3 px-4 font-medium text-muted">Role</th>
                          <th className="text-left py-3 px-4 font-medium text-muted">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-muted">Joined</th>
                          <th className="text-left py-3 px-4 font-medium text-muted">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <motion.tr
                            key={u._id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                          >
                            <td className="py-3 px-4">{u.name}</td>
                            <td className="py-3 px-4 text-muted">{u.email}</td>
                            <td className="py-3 px-4 text-muted">{u.phone}</td>
                            <td className="py-3 px-4">
                              <StatusBadge
                                status={u.role === 'admin' ? 'confirmed' : 'pending'}
                              />
                            </td>
                            <td className="py-3 px-4">
                              <StatusBadge
                                status={u.isActive ? 'confirmed' : 'cancelled'}
                              />
                            </td>
                            <td className="py-3 px-4 text-muted text-xs">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleToggleUserStatus(u._id, !u.isActive)}
                                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                  u.isActive
                                    ? 'bg-warning/20 text-warning hover:bg-warning/30'
                                    : 'bg-success/20 text-success hover:bg-success/30'
                                }`}
                              >
                                {u.isActive ? 'Deactivate' : 'Activate'}
                              </motion.button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Manage Bookings</CardTitle>
                <CardDescription>View and manage transportation bookings</CardDescription>
              </CardHeader>
              <CardContent>
                {bookings.length === 0 ? (
                  <EmptyState
                    title="No bookings found"
                    description="There are no bookings in the system yet"
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 font-medium text-muted">Customer</th>
                          <th className="text-left py-3 px-4 font-medium text-muted">Service</th>
                          <th className="text-left py-3 px-4 font-medium text-muted">Route</th>
                          <th className="text-left py-3 px-4 font-medium text-muted">Date</th>
                          <th className="text-left py-3 px-4 font-medium text-muted">Amount</th>
                          <th className="text-left py-3 px-4 font-medium text-muted">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-muted">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((booking) => (
                          <motion.tr
                            key={booking._id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                          >
                            <td className="py-3 px-4">{booking.user?.name || 'N/A'}</td>
                            <td className="py-3 px-4">{booking.serviceCategory}</td>
                            <td className="py-3 px-4 text-muted text-xs">
                              {booking.pickupLocation} → {booking.dropLocation}
                            </td>
                            <td className="py-3 px-4 text-muted text-xs">
                              {new Date(booking.pickupDate).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 font-medium">₹{booking.totalAmount}</td>
                            <td className="py-3 px-4">
                              <StatusBadge status={booking.status as any} />
                            </td>
                            <td className="py-3 px-4">
                              <select
                                value={booking.status}
                                onChange={(e) =>
                                  handleUpdateBookingStatus(booking._id, e.target.value)
                                }
                                className="px-3 py-1 rounded text-xs bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0"
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Manage Services</CardTitle>
                <CardDescription>View and manage available transportation services</CardDescription>
              </CardHeader>
              <CardContent>
                {services.length === 0 ? (
                  <EmptyState
                    title="No services found"
                    description="There are no services in the system yet"
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 font-medium text-muted">Service Name</th>
                          <th className="text-left py-3 px-4 font-medium text-muted">Category</th>
                          <th className="text-left py-3 px-4 font-medium text-muted">Description</th>
                          <th className="text-left py-3 px-4 font-medium text-muted">Base Price</th>
                          <th className="text-left py-3 px-4 font-medium text-muted">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-muted">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {services.map((service) => (
                          <motion.tr
                            key={service._id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                          >
                            <td className="py-3 px-4 font-medium">{service.name}</td>
                            <td className="py-3 px-4 text-muted">{service.category}</td>
                            <td className="py-3 px-4 text-muted text-xs">{service.description}</td>
                            <td className="py-3 px-4">₹{service.basePrice}</td>
                            <td className="py-3 px-4">
                              <StatusBadge
                                status={service.isActive ? 'confirmed' : 'cancelled'}
                              />
                            </td>
                            <td className="py-3 px-4">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() =>
                                  handleToggleServiceStatus(service._id, !service.isActive)
                                }
                                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                  service.isActive
                                    ? 'bg-warning/20 text-warning hover:bg-warning/30'
                                    : 'bg-success/20 text-success hover:bg-success/30'
                                }`}
                              >
                                {service.isActive ? 'Deactivate' : 'Activate'}
                              </motion.button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminDashboard;