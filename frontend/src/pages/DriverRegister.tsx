import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { toast } from 'react-toastify';

const DriverRegister: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    licenseNumber: '',
    licenseExpiry: '',
    vehicleType: 'car',
    experience: 0,
    bankDetails: {
      accountNumber: '',
      ifscCode: '',
      accountHolderName: ''
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('bankDetails.')) {
      const fieldName = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        bankDetails: {
          ...prev.bankDetails,
          [fieldName]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (new Date(formData.licenseExpiry) <= new Date()) {
      toast.error('License expiry date must be in the future');
      return;
    }

    setIsSubmitting(true);

    try {
      const registrationData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: 'driver',
        licenseNumber: formData.licenseNumber,
        licenseExpiry: formData.licenseExpiry,
        vehicleType: formData.vehicleType,
        experience: formData.experience,
        bankDetails: formData.bankDetails
      };

      const response = await apiService.register(registrationData);
      
      if (response.success) {
        toast.success('Registration successful! Please login to continue.');
        navigate('/login');
      } else {
        toast.error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow">
            <div className="card-header bg-success text-white text-center">
              <h4 className="mb-0">Driver Registration</h4>
              <p className="mb-0">Join LEZIT as a Professional Driver</p>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {/* Personal Information */}
                <div className="mb-4">
                  <h5 className="text-success mb-3">Personal Information</h5>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="name" className="form-label">Full Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email Address *</label>
                        <input
                          type="email"
                          className="form-control"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="phone" className="form-label">Phone Number *</label>
                        <input
                          type="tel"
                          className="form-control"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="password" className="form-label">Password *</label>
                        <input
                          type="password"
                          className="form-control"
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="confirmPassword" className="form-label">Confirm Password *</label>
                        <input
                          type="password"
                          className="form-control"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Driver Information */}
                <div className="mb-4">
                  <h5 className="text-success mb-3">Driver Information</h5>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="licenseNumber" className="form-label">Driving License Number *</label>
                        <input
                          type="text"
                          className="form-control"
                          id="licenseNumber"
                          name="licenseNumber"
                          value={formData.licenseNumber}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="licenseExpiry" className="form-label">License Expiry Date *</label>
                        <input
                          type="date"
                          className="form-control"
                          id="licenseExpiry"
                          name="licenseExpiry"
                          value={formData.licenseExpiry}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="vehicleType" className="form-label">Vehicle Type *</label>
                        <select
                          className="form-select"
                          id="vehicleType"
                          name="vehicleType"
                          value={formData.vehicleType}
                          onChange={handleInputChange}
                          required
                        >
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
                        <label htmlFor="experience" className="form-label">Driving Experience (Years) *</label>
                        <input
                          type="number"
                          className="form-control"
                          id="experience"
                          name="experience"
                          value={formData.experience}
                          onChange={handleInputChange}
                          min="0"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bank Details */}
                <div className="mb-4">
                  <h5 className="text-success mb-3">Bank Details</h5>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="accountNumber" className="form-label">Account Number</label>
                        <input
                          type="text"
                          className="form-control"
                          id="accountNumber"
                          name="bankDetails.accountNumber"
                          value={formData.bankDetails.accountNumber}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="ifscCode" className="form-label">IFSC Code</label>
                        <input
                          type="text"
                          className="form-control"
                          id="ifscCode"
                          name="bankDetails.ifscCode"
                          value={formData.bankDetails.ifscCode}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="accountHolderName" className="form-label">Account Holder Name</label>
                        <input
                          type="text"
                          className="form-control"
                          id="accountHolderName"
                          name="bankDetails.accountHolderName"
                          value={formData.bankDetails.accountHolderName}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="d-grid gap-2">
                  <button
                    type="submit"
                    className="btn btn-success btn-lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Registering...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-user-plus me-2"></i>
                        Register as Driver
                      </>
                    )}
                  </button>
                </div>

                <div className="text-center mt-3">
                  <p className="mb-0">
                    Already have an account?{' '}
                    <Link to="/login" className="text-success">
                      Login here
                    </Link>
                  </p>
                  <p className="mb-0">
                    Want to provide services?{' '}
                    <Link to="/vendor-register" className="text-success">
                      Vendor Registration
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverRegister;
