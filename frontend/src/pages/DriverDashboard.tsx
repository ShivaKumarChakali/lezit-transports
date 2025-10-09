import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { DriverDashboard as DriverDashboardType } from '../types';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const DriverDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DriverDashboardType | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'profile'>('overview');
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    if (user?.role !== 'driver') {
      navigate('/');
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      const response = await apiService.driver.getDashboard();
      if (response.success) {
        setDashboardData(response.data!);
      } else {
        toast.error(response.message || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAvailabilityToggle = async () => {
    try {
      const response = await apiService.driver.updateAvailability(!isAvailable);
      if (response.success) {
        setIsAvailable(!isAvailable);
        toast.success(`You are now ${!isAvailable ? 'available' : 'unavailable'} for bookings`);
      } else {
        toast.error(response.message || 'Failed to update availability');
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      toast.error('Failed to update availability');
    }
  };

  const handleStatusUpdate = async (bookingId: string, status: string) => {
    try {
      const response = await apiService.driver.updateBookingStatus(bookingId, status);
      if (response.success) {
        toast.success('Booking status updated successfully');
        fetchDashboardData(); // Refresh data
      } else {
        toast.error(response.message || 'Failed to update booking status');
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Failed to update booking status');
    }
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          Failed to load dashboard data. Please try again.
        </div>
      </div>
    );
  }

  const { statistics, recentBookings, driver } = dashboardData;

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row bg-primary text-white py-3">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-0">Driver Dashboard</h2>
              <p className="mb-0">Welcome back, {user?.name}</p>
            </div>
            <div className="d-flex align-items-center gap-3">
              <div className="d-flex align-items-center">
                <span className="me-2">Availability:</span>
                <button
                  className={`btn btn-sm ${isAvailable ? 'btn-success' : 'btn-danger'}`}
                  onClick={handleAvailabilityToggle}
                >
                  <i className={`fas fa-${isAvailable ? 'check-circle' : 'times-circle'} me-1`}></i>
                  {isAvailable ? 'Available' : 'Unavailable'}
                </button>
              </div>
              <button className="btn btn-light" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt me-2"></i>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="row mt-3">
        <div className="col-12">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <i className="fas fa-chart-bar me-2"></i>
                Overview
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'bookings' ? 'active' : ''}`}
                onClick={() => setActiveTab('bookings')}
              >
                <i className="fas fa-calendar-check me-2"></i>
                Bookings ({statistics.totalBookings})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <i className="fas fa-user me-2"></i>
                Profile
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Tab Content */}
      <div className="row mt-3">
        <div className="col-12">
          {activeTab === 'overview' && (
            <div>
              {/* Statistics Cards */}
              <div className="row mb-4">
                <div className="col-md-3 mb-3">
                  <div className="card bg-primary text-white">
                    <div className="card-body">
                      <div className="d-flex justify-content-between">
                        <div>
                          <h5 className="card-title">Total Bookings</h5>
                          <h2 className="mb-0">{statistics.totalBookings}</h2>
                        </div>
                        <div className="align-self-center">
                          <i className="fas fa-calendar-check fa-2x"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="card bg-success text-white">
                    <div className="card-body">
                      <div className="d-flex justify-content-between">
                        <div>
                          <h5 className="card-title">Completed</h5>
                          <h2 className="mb-0">{statistics.completedBookings}</h2>
                        </div>
                        <div className="align-self-center">
                          <i className="fas fa-check-circle fa-2x"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="card bg-info text-white">
                    <div className="card-body">
                      <div className="d-flex justify-content-between">
                        <div>
                          <h5 className="card-title">In Progress</h5>
                          <h2 className="mb-0">{statistics.inProgressBookings}</h2>
                        </div>
                        <div className="align-self-center">
                          <i className="fas fa-clock fa-2x"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="card bg-warning text-white">
                    <div className="card-body">
                      <div className="d-flex justify-content-between">
                        <div>
                          <h5 className="card-title">Total Earnings</h5>
                          <h2 className="mb-0">₹{statistics.totalEarnings.toLocaleString()}</h2>
                        </div>
                        <div className="align-self-center">
                          <i className="fas fa-rupee-sign fa-2x"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Bookings */}
              <div className="row">
                <div className="col-12">
                  <div className="card">
                    <div className="card-header">
                      <h5 className="mb-0">Recent Bookings</h5>
                    </div>
                    <div className="card-body">
                      {recentBookings.length === 0 ? (
                        <p className="text-muted">No bookings yet.</p>
                      ) : (
                        <div className="table-responsive">
                          <table className="table table-striped">
                            <thead>
                              <tr>
                                <th>Customer</th>
                                <th>Service</th>
                                <th>Pickup</th>
                                <th>Drop</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {recentBookings.map((booking) => (
                                <tr key={booking._id}>
                                  <td>
                                    {typeof booking.userId === 'object' ? booking.userId.name : 'N/A'}
                                    <br />
                                    <small className="text-muted">{typeof booking.userId === 'object' ? booking.userId.email : 'N/A'}</small>
                                  </td>
                                  <td>{booking.serviceCategory}</td>
                                  <td>{booking.pickupLocation}</td>
                                  <td>{booking.dropLocation}</td>
                                  <td>₹{booking.totalAmount}</td>
                                  <td>
                                    <span className={`badge bg-${getStatusColor(booking.status)}`}>
                                      {booking.status}
                                    </span>
                                  </td>
                                  <td>
                                    {booking.status === 'confirmed' && (
                                      <button
                                        className="btn btn-sm btn-primary me-1"
                                        onClick={() => handleStatusUpdate(booking._id, 'in-progress')}
                                      >
                                        <i className="fas fa-play"></i>
                                      </button>
                                    )}
                                    {booking.status === 'in-progress' && (
                                      <button
                                        className="btn btn-sm btn-success"
                                        onClick={() => handleStatusUpdate(booking._id, 'completed')}
                                      >
                                        <i className="fas fa-check"></i>
                                      </button>
                                    )}
                                    <button className="btn btn-sm btn-outline-primary">
                                      <i className="fas fa-eye"></i>
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5>All Bookings</h5>
                <div>
                  <select className="form-select d-inline-block w-auto">
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Service</th>
                      <th>Pickup</th>
                      <th>Drop</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((booking) => (
                      <tr key={booking._id}>
                        <td>
                          {typeof booking.userId === 'object' ? booking.userId.name : 'N/A'}
                          <br />
                          <small className="text-muted">{typeof booking.userId === 'object' ? booking.userId.email : 'N/A'}</small>
                          <br />
                          <small className="text-muted">{typeof booking.userId === 'object' ? booking.userId.phone : 'N/A'}</small>
                        </td>
                        <td>{booking.serviceCategory}</td>
                        <td>{booking.pickupLocation}</td>
                        <td>{booking.dropLocation}</td>
                        <td>{new Date(booking.pickupDate).toLocaleDateString()}</td>
                        <td>₹{booking.totalAmount}</td>
                        <td>
                          <span className={`badge bg-${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td>
                          {booking.status === 'confirmed' && (
                            <button
                              className="btn btn-sm btn-primary me-1"
                              onClick={() => handleStatusUpdate(booking._id, 'in-progress')}
                            >
                              <i className="fas fa-play me-1"></i>
                              Start
                            </button>
                          )}
                          {booking.status === 'in-progress' && (
                            <button
                              className="btn btn-sm btn-success me-1"
                              onClick={() => handleStatusUpdate(booking._id, 'completed')}
                            >
                              <i className="fas fa-check me-1"></i>
                              Complete
                            </button>
                          )}
                          <button className="btn btn-sm btn-outline-primary">
                            <i className="fas fa-eye"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="row">
              <div className="col-md-8">
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">Driver Profile</h5>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Name</label>
                          <input type="text" className="form-control" value={driver?.name || ''} readOnly />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Email</label>
                          <input type="email" className="form-control" value={driver?.email || ''} readOnly />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Phone</label>
                          <input type="text" className="form-control" value={driver?.phone || ''} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">License Number</label>
                          <input type="text" className="form-control" value={driver?.licenseNumber || ''} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Vehicle Type</label>
                          <select className="form-select" value={driver?.vehicleType || ''}>
                            <option value="car">Car</option>
                            <option value="suv">SUV</option>
                            <option value="van">Van</option>
                            <option value="bus">Bus</option>
                            <option value="truck">Truck</option>
                            <option value="bike">Bike</option>
                          </select>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Experience (years)</label>
                          <input type="number" className="form-control" value={driver?.experience || 0} />
                        </div>
                      </div>
                      <div className="col-12">
                        <button className="btn btn-primary">
                          <i className="fas fa-save me-2"></i>
                          Update Profile
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">Driver Stats</h5>
                  </div>
                  <div className="card-body">
                    <div className="text-center mb-3">
                      <div className="display-6 text-primary">{driver?.rating || 0}</div>
                      <div className="text-muted">Average Rating</div>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between">
                      <span>Total Bookings:</span>
                      <strong>{statistics.totalBookings}</strong>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Completed:</span>
                      <strong>{statistics.completedBookings}</strong>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Success Rate:</span>
                      <strong>{statistics.totalBookings > 0 ? Math.round((statistics.completedBookings / statistics.totalBookings) * 100) : 0}%</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'pending': return 'warning';
    case 'confirmed': return 'info';
    case 'in-progress': return 'primary';
    case 'completed': return 'success';
    case 'cancelled': return 'danger';
    default: return 'secondary';
  }
};

export default DriverDashboard;
