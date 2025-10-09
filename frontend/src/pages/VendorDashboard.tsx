import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { VendorDashboard as VendorDashboardType } from '../types';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const VendorDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<VendorDashboardType | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'vehicles' | 'bookings'>('overview');

  useEffect(() => {
    if (user?.role !== 'vendor') {
      navigate('/');
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      const response = await apiService.vendor.getDashboard();
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

  const { statistics, vehicles, recentBookings } = dashboardData;

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row bg-primary text-white py-3">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-0">Vendor Dashboard</h2>
              <p className="mb-0">Welcome back, {user?.name}</p>
            </div>
            <button className="btn btn-light" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt me-2"></i>
              Logout
            </button>
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
                className={`nav-link ${activeTab === 'vehicles' ? 'active' : ''}`}
                onClick={() => setActiveTab('vehicles')}
              >
                <i className="fas fa-car me-2"></i>
                Vehicles ({statistics.totalVehicles})
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
                          <h5 className="card-title">Total Vehicles</h5>
                          <h2 className="mb-0">{statistics.totalVehicles}</h2>
                        </div>
                        <div className="align-self-center">
                          <i className="fas fa-car fa-2x"></i>
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
                          <h5 className="card-title">Available Vehicles</h5>
                          <h2 className="mb-0">{statistics.availableVehicles}</h2>
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
                                <th>Date</th>
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
                                  <td>{new Date(booking.createdAt).toLocaleDateString()}</td>
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

          {activeTab === 'vehicles' && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5>My Vehicles</h5>
                <button className="btn btn-primary">
                  <i className="fas fa-plus me-2"></i>
                  Add Vehicle
                </button>
              </div>
              <div className="row">
                {vehicles.length === 0 ? (
                  <div className="col-12">
                    <div className="alert alert-info">
                      No vehicles added yet. Click "Add Vehicle" to get started.
                    </div>
                  </div>
                ) : (
                  vehicles.map((vehicle) => (
                    <div key={vehicle._id} className="col-md-6 col-lg-4 mb-3">
                      <div className="card">
                        <div className="card-body">
                          <h6 className="card-title">{vehicle.name}</h6>
                          <p className="card-text">
                            <strong>Type:</strong> {vehicle.type.toUpperCase()}<br />
                            <strong>Make:</strong> {vehicle.make} {vehicle.model}<br />
                            <strong>License:</strong> {vehicle.licensePlate}<br />
                            <strong>Capacity:</strong> {vehicle.capacity} persons<br />
                            <strong>Price:</strong> ₹{vehicle.basePrice} base + ₹{vehicle.pricePerKm}/km
                          </p>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className={`badge bg-${vehicle.isAvailable ? 'success' : 'danger'}`}>
                              {vehicle.isAvailable ? 'Available' : 'Busy'}
                            </span>
                            <div>
                              <button className="btn btn-sm btn-outline-primary me-1">
                                <i className="fas fa-edit"></i>
                              </button>
                              <button className="btn btn-sm btn-outline-danger">
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
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
                          {booking.status === 'pending' && (
                            <button className="btn btn-sm btn-success me-1">
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

export default VendorDashboard;
