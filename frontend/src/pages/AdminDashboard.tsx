import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Shield, Users, Calendar, Cog, Briefcase, UserRound } from 'lucide-react';
import apiService from '../services/api';
import { DashboardStats, AdminUser, AdminBooking, AdminService, User } from '../types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../premium/components/ui/Card';
import { StatsCard } from '../premium/components/ui/StatsCard';
import { StatusBadge } from '../premium/components/ui/StatusBadge';
import { Skeleton } from '../premium/components/ui/Skeleton';
import { EmptyState } from '../premium/components/ui/EmptyState';

const bookingFlowStatusOptions = [
  { value: 'primary', label: '1. Primary (Order Received)' },
  { value: 'confirmation_call_pending', label: '2. Confirmation Call Pending' },
  { value: 'details_confirmed', label: '3. Details Confirmed' },
  { value: 'provider_search', label: '4. Searching Service Provider' },
  { value: 'updated', label: '4A. Updated' },
  { value: 'not_available', label: '4B. Not Available' },
  { value: 'quotation_shared', label: '5. Quotation Shared' },
  { value: 'quoted', label: '6. Quoted (Advance Pending/Processing)' },
  { value: 'cancelled', label: '6A. Cancelled' },
  { value: 'expired', label: '6B. Expired' },
  { value: 'advance_received', label: '6C. Advance Received' },
  { value: 'customer_id_generated', label: '7. Customer ID Generated' },
  { value: 'sales_order_created', label: '8. Sales Order Created' },
  { value: 'purchase_order_created', label: '9. Purchase Order Created' },
  { value: 'transactions_updated', label: '10. Transactions Updated' },
  { value: 'in_progress_cid', label: '11. In Progress (CID Pending)' },
  { value: 'in_progress_so', label: '11. In Progress (SO Pending)' },
  { value: 'in_progress_po', label: '11. In Progress (PO Pending)' },
  { value: 'in_progress_txn', label: '11. In Progress (TXN Pending)' },
  { value: 'in_progress_oc', label: '11. In Progress (Order Completion Pending)' },
  { value: 'order_completed', label: '12. Order Completed' },
  { value: 'invoice_bill_generated', label: '13. Invoice & Bill Generated' },
  { value: 'dues_closed', label: '14. Dues Closed' },
  { value: 'closure_pending', label: '15. Pending (Payment/Feedback)' },
  { value: 'closure_payment_pending', label: '15A. Payment Pending' },
  { value: 'closure_feedback_pending', label: '15B. Feedback Pending' },
  { value: 'closure_completed', label: '15C. Closure Completed' },
  { value: 'documented', label: '16. Documented' },
  { value: 'details_updated_online_offline', label: '17. Details Updated Online/Offline' }
];

const formatBookingFlowStatus = (status?: string) => {
  if (!status) return 'N/A';
  const option = bookingFlowStatusOptions.find((item) => item.value === status);
  if (option) return option.label;
  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

type ProviderFormData = {
  name: string;
  email: string;
  phone: string;
  businessName: string;
  businessType: 'car_rental' | 'taxi_service' | 'bus_service' | 'truck_service' | 'other';
  businessLicense: string;
  businessAddress: string;
};

type DriverFormData = {
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
  vehicleType: 'car' | 'suv' | 'van' | 'bus' | 'truck' | 'bike';
  experience: string;
};

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
  const [serviceProviders, setServiceProviders] = useState<User[]>([]);
  const [drivers, setDrivers] = useState<User[]>([]);
  const [providerForm, setProviderForm] = useState<ProviderFormData>({
    name: '',
    email: '',
    phone: '',
    businessName: '',
    businessType: 'other',
    businessLicense: '',
    businessAddress: ''
  });
  const [driverForm, setDriverForm] = useState<DriverFormData>({
    name: '',
    email: '',
    phone: '',
    licenseNumber: '',
    licenseExpiry: '',
    vehicleType: 'car',
    experience: '0'
  });
  const [editingProviderId, setEditingProviderId] = useState<string | null>(null);
  const [editingDriverId, setEditingDriverId] = useState<string | null>(null);
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

      // Fetch service providers
      const providersResponse = await apiService.getAdminServiceProviders();
      if (providersResponse.success && providersResponse.data) {
        setServiceProviders(providersResponse.data);
      }

      // Fetch drivers
      const driversResponse = await apiService.getAdminDrivers();
      if (driversResponse.success && driversResponse.data) {
        setDrivers(driversResponse.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBookingStatus = async (booking: AdminBooking, orderStatus: string) => {
    try {
      const response = await apiService.updateBookingStatus(booking._id, booking.status, orderStatus);
      if (response.success) {
        toast.success('Booking workflow status updated successfully');
        fetchDashboardData();
      } else {
        toast.error(response.message || 'Failed to update booking workflow status');
      }
    } catch (error) {
      console.error('Error updating booking workflow status:', error);
      toast.error('Failed to update booking workflow status');
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

  const resetProviderForm = () => {
    setProviderForm({
      name: '',
      email: '',
      phone: '',
      businessName: '',
      businessType: 'other',
      businessLicense: '',
      businessAddress: ''
    });
    setEditingProviderId(null);
  };

  const resetDriverForm = () => {
    setDriverForm({
      name: '',
      email: '',
      phone: '',
      licenseNumber: '',
      licenseExpiry: '',
      vehicleType: 'car',
      experience: '0'
    });
    setEditingDriverId(null);
  };

  const handleProviderSubmit = async () => {
    try {
      if (editingProviderId) {
        const response = await apiService.updateAdminServiceProvider(editingProviderId, providerForm);
        if (!response.success) {
          toast.error(response.message || 'Failed to update service provider');
          return;
        }
        toast.success('Service provider updated successfully');
      } else {
        const response = await apiService.createAdminServiceProvider(providerForm);
        if (!response.success) {
          toast.error(response.message || 'Failed to add service provider');
          return;
        }
        toast.success('Service provider added successfully');
      }

      resetProviderForm();
      fetchDashboardData();
    } catch (error) {
      console.error('Error saving service provider:', error);
      toast.error('Failed to save service provider');
    }
  };

  const handleEditProvider = (provider: User) => {
    setEditingProviderId(provider._id || provider.id || '');
    setProviderForm({
      name: provider.name || '',
      email: provider.email || '',
      phone: provider.phone || '',
      businessName: provider.businessName || '',
      businessType: provider.businessType || 'other',
      businessLicense: provider.businessLicense || '',
      businessAddress: provider.businessAddress || ''
    });
  };

  const handleRemoveProvider = async (providerId: string) => {
    try {
      const response = await apiService.removeAdminServiceProvider(providerId);
      if (response.success) {
        toast.success('Service provider removed successfully');
        fetchDashboardData();
      } else {
        toast.error(response.message || 'Failed to remove service provider');
      }
    } catch (error) {
      console.error('Error removing service provider:', error);
      toast.error('Failed to remove service provider');
    }
  };

  const handleDriverSubmit = async () => {
    try {
      if (editingDriverId) {
        const response = await apiService.updateAdminDriver(editingDriverId, {
          ...driverForm,
          experience: Number(driverForm.experience)
        });
        if (!response.success) {
          toast.error(response.message || 'Failed to update driver');
          return;
        }
        toast.success('Driver updated successfully');
      } else {
        const response = await apiService.createAdminDriver({
          ...driverForm,
          experience: Number(driverForm.experience)
        });
        if (!response.success) {
          toast.error(response.message || 'Failed to add driver');
          return;
        }
        toast.success('Driver added successfully');
      }

      resetDriverForm();
      fetchDashboardData();
    } catch (error) {
      console.error('Error saving driver:', error);
      toast.error('Failed to save driver');
    }
  };

  const handleEditDriver = (driver: User) => {
    setEditingDriverId(driver._id || driver.id || '');
    setDriverForm({
      name: driver.name || '',
      email: driver.email || '',
      phone: driver.phone || '',
      licenseNumber: driver.licenseNumber || '',
      licenseExpiry: driver.licenseExpiry ? String(driver.licenseExpiry).slice(0, 10) : '',
      vehicleType: driver.vehicleType || 'car',
      experience: String(driver.experience || 0)
    });
  };

  const handleRemoveDriver = async (driverId: string) => {
    try {
      const response = await apiService.removeAdminDriver(driverId);
      if (response.success) {
        toast.success('Driver removed successfully');
        fetchDashboardData();
      } else {
        toast.error(response.message || 'Failed to remove driver');
      }
    } catch (error) {
      console.error('Error removing driver:', error);
      toast.error('Failed to remove driver');
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
    { id: 'service-providers', label: 'Service Providers', icon: Briefcase },
    { id: 'drivers', label: 'Drivers', icon: UserRound },
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
                          <th className="text-left py-3 px-4 font-medium text-muted">Workflow Status</th>
                          <th className="text-left py-3 px-4 font-medium text-muted">Update Workflow</th>
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
                            <td className="py-3 px-4">{(booking as any).userId?.name || booking.user?.name || 'N/A'}</td>
                            <td className="py-3 px-4">{booking.serviceCategory}</td>
                            <td className="py-3 px-4 text-muted text-xs">
                              {booking.pickupLocation} → {booking.dropLocation}
                            </td>
                            <td className="py-3 px-4 text-muted text-xs">
                              {new Date(booking.pickupDate).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 font-medium">₹{booking.totalAmount}</td>
                            <td className="py-3 px-4">
                              <StatusBadge
                                status="default"
                                label={formatBookingFlowStatus(booking.orderStatus || 'primary')}
                                className="max-w-[270px] truncate"
                                title={formatBookingFlowStatus(booking.orderStatus || 'primary')}
                              />
                            </td>
                            <td className="py-3 px-4">
                              <select
                                value={booking.orderStatus || 'primary'}
                                onChange={(e) =>
                                  handleUpdateBookingStatus(booking, e.target.value)
                                }
                                className="px-3 py-1 rounded text-xs bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0"
                              >
                                {bookingFlowStatusOptions.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
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

        {/* Service Providers Tab */}
        {activeTab === 'service-providers' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Manage Service Providers</CardTitle>
                <CardDescription>Add, edit and remove providers collected from calls or website requests</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    value={providerForm.name}
                    onChange={(e) => setProviderForm({ ...providerForm, name: e.target.value })}
                    placeholder="Provider name"
                    className="px-3 py-2 rounded bg-input border border-border text-foreground"
                  />
                  <input
                    value={providerForm.email}
                    onChange={(e) => setProviderForm({ ...providerForm, email: e.target.value })}
                    placeholder="Email"
                    className="px-3 py-2 rounded bg-input border border-border text-foreground"
                  />
                  <input
                    value={providerForm.phone}
                    onChange={(e) => setProviderForm({ ...providerForm, phone: e.target.value })}
                    placeholder="Phone"
                    className="px-3 py-2 rounded bg-input border border-border text-foreground"
                  />
                  <input
                    value={providerForm.businessName}
                    onChange={(e) => setProviderForm({ ...providerForm, businessName: e.target.value })}
                    placeholder="Business name"
                    className="px-3 py-2 rounded bg-input border border-border text-foreground"
                  />
                  <select
                    value={providerForm.businessType}
                    onChange={(e) => setProviderForm({ ...providerForm, businessType: e.target.value as ProviderFormData['businessType'] })}
                    className="px-3 py-2 rounded bg-input border border-border text-foreground"
                  >
                    <option value="car_rental">Car Rental</option>
                    <option value="taxi_service">Taxi Service</option>
                    <option value="bus_service">Bus Service</option>
                    <option value="truck_service">Truck Service</option>
                    <option value="other">Other</option>
                  </select>
                  <input
                    value={providerForm.businessLicense}
                    onChange={(e) => setProviderForm({ ...providerForm, businessLicense: e.target.value })}
                    placeholder="Business license"
                    className="px-3 py-2 rounded bg-input border border-border text-foreground"
                  />
                  <input
                    value={providerForm.businessAddress}
                    onChange={(e) => setProviderForm({ ...providerForm, businessAddress: e.target.value })}
                    placeholder="Business address"
                    className="md:col-span-2 px-3 py-2 rounded bg-input border border-border text-foreground"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleProviderSubmit}
                    className="px-4 py-2 rounded bg-primary text-primary-foreground text-sm font-medium"
                  >
                    {editingProviderId ? 'Update Provider' : 'Add Provider'}
                  </button>
                  {editingProviderId && (
                    <button
                      onClick={resetProviderForm}
                      className="px-4 py-2 rounded bg-muted text-foreground text-sm font-medium"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                {serviceProviders.length === 0 ? (
                  <EmptyState
                    title="No service providers"
                    description="Add providers here to keep call-based onboarding in one place"
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 font-medium text-muted">Name</th>
                          <th className="text-left py-3 px-4 font-medium text-muted">Business</th>
                          <th className="text-left py-3 px-4 font-medium text-muted">Phone</th>
                          <th className="text-left py-3 px-4 font-medium text-muted">Email</th>
                          <th className="text-left py-3 px-4 font-medium text-muted">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-muted">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {serviceProviders.map((provider) => {
                          const providerId = provider._id || provider.id;
                          return (
                            <motion.tr
                              key={providerId}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                            >
                              <td className="py-3 px-4">{provider.name}</td>
                              <td className="py-3 px-4 text-muted">{provider.businessName || 'N/A'}</td>
                              <td className="py-3 px-4 text-muted">{provider.phone}</td>
                              <td className="py-3 px-4 text-muted">{provider.email}</td>
                              <td className="py-3 px-4">
                                <StatusBadge status={provider.isActive ? 'confirmed' : 'cancelled'} />
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleEditProvider(provider)}
                                    className="px-3 py-1 rounded text-xs bg-primary/15 text-primary"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => providerId && handleRemoveProvider(providerId)}
                                    className="px-3 py-1 rounded text-xs bg-danger/15 text-danger"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </td>
                            </motion.tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Drivers Tab */}
        {activeTab === 'drivers' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Manage Drivers</CardTitle>
                <CardDescription>Add, edit and remove drivers from admin panel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    value={driverForm.name}
                    onChange={(e) => setDriverForm({ ...driverForm, name: e.target.value })}
                    placeholder="Driver name"
                    className="px-3 py-2 rounded bg-input border border-border text-foreground"
                  />
                  <input
                    value={driverForm.email}
                    onChange={(e) => setDriverForm({ ...driverForm, email: e.target.value })}
                    placeholder="Email"
                    className="px-3 py-2 rounded bg-input border border-border text-foreground"
                  />
                  <input
                    value={driverForm.phone}
                    onChange={(e) => setDriverForm({ ...driverForm, phone: e.target.value })}
                    placeholder="Phone"
                    className="px-3 py-2 rounded bg-input border border-border text-foreground"
                  />
                  <input
                    value={driverForm.licenseNumber}
                    onChange={(e) => setDriverForm({ ...driverForm, licenseNumber: e.target.value })}
                    placeholder="License number"
                    className="px-3 py-2 rounded bg-input border border-border text-foreground"
                  />
                  <input
                    type="date"
                    value={driverForm.licenseExpiry}
                    onChange={(e) => setDriverForm({ ...driverForm, licenseExpiry: e.target.value })}
                    className="px-3 py-2 rounded bg-input border border-border text-foreground"
                  />
                  <select
                    value={driverForm.vehicleType}
                    onChange={(e) => setDriverForm({ ...driverForm, vehicleType: e.target.value as DriverFormData['vehicleType'] })}
                    className="px-3 py-2 rounded bg-input border border-border text-foreground"
                  >
                    <option value="car">Car</option>
                    <option value="suv">SUV</option>
                    <option value="van">Van</option>
                    <option value="bus">Bus</option>
                    <option value="truck">Truck</option>
                    <option value="bike">Bike</option>
                  </select>
                  <input
                    value={driverForm.experience}
                    onChange={(e) => setDriverForm({ ...driverForm, experience: e.target.value })}
                    placeholder="Experience (years)"
                    className="px-3 py-2 rounded bg-input border border-border text-foreground"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDriverSubmit}
                    className="px-4 py-2 rounded bg-primary text-primary-foreground text-sm font-medium"
                  >
                    {editingDriverId ? 'Update Driver' : 'Add Driver'}
                  </button>
                  {editingDriverId && (
                    <button
                      onClick={resetDriverForm}
                      className="px-4 py-2 rounded bg-muted text-foreground text-sm font-medium"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                {drivers.length === 0 ? (
                  <EmptyState
                    title="No drivers"
                    description="Add drivers here for phone-call onboarding and allocation"
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 font-medium text-muted">Name</th>
                          <th className="text-left py-3 px-4 font-medium text-muted">Phone</th>
                          <th className="text-left py-3 px-4 font-medium text-muted">Vehicle</th>
                          <th className="text-left py-3 px-4 font-medium text-muted">License</th>
                          <th className="text-left py-3 px-4 font-medium text-muted">Experience</th>
                          <th className="text-left py-3 px-4 font-medium text-muted">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-muted">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {drivers.map((driver) => {
                          const driverId = driver._id || driver.id;
                          return (
                            <motion.tr
                              key={driverId}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                            >
                              <td className="py-3 px-4">{driver.name}</td>
                              <td className="py-3 px-4 text-muted">{driver.phone}</td>
                              <td className="py-3 px-4 text-muted capitalize">{driver.vehicleType || 'N/A'}</td>
                              <td className="py-3 px-4 text-muted">{driver.licenseNumber || 'N/A'}</td>
                              <td className="py-3 px-4 text-muted">{driver.experience || 0} yrs</td>
                              <td className="py-3 px-4">
                                <StatusBadge status={driver.isActive ? 'confirmed' : 'cancelled'} />
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleEditDriver(driver)}
                                    className="px-3 py-1 rounded text-xs bg-primary/15 text-primary"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => driverId && handleRemoveDriver(driverId)}
                                    className="px-3 py-1 rounded text-xs bg-danger/15 text-danger"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </td>
                            </motion.tr>
                          );
                        })}
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