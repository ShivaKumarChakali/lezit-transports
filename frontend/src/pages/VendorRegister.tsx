import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { toast } from 'react-toastify';

const VendorRegister: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    businessName: '',
    businessType: 'car_rental',
    businessLicense: '',
    businessAddress: '',
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

    setIsSubmitting(true);

    try {
      const registrationData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: 'vendor',
        businessName: formData.businessName,
        businessType: formData.businessType,
        businessLicense: formData.businessLicense,
        businessAddress: formData.businessAddress,
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
            <div className="card-header bg-primary text-white text-center">
              <h4 className="mb-0">Vendor Registration</h4>
              <p className="mb-0">Join LEZIT as a Service Provider</p>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {/* Personal Information */}
                <div className="mb-4">
                  <h5 className="text-primary mb-3">Personal Information</h5>
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

                {/* Business Information */}
                <div className="mb-4">
                  <h5 className="text-primary mb-3">Business Information</h5>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="businessName" className="form-label">Business Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          id="businessName"
                          name="businessName"
                          value={formData.businessName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="businessType" className="form-label">Business Type *</label>
                        <select
                          className="form-select"
                          id="businessType"
                          name="businessType"
                          value={formData.businessType}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="car_rental">Car Rental</option>
                          <option value="taxi_service">Taxi Service</option>
                          <option value="bus_service">Bus Service</option>
                          <option value="truck_service">Truck Service</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="businessLicense" className="form-label">Business License *</label>
                        <input
                          type="text"
                          className="form-control"
                          id="businessLicense"
                          name="businessLicense"
                          value={formData.businessLicense}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="mb-3">
                        <label htmlFor="businessAddress" className="form-label">Business Address *</label>
                        <textarea
                          className="form-control"
                          id="businessAddress"
                          name="businessAddress"
                          rows={3}
                          value={formData.businessAddress}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bank Details */}
                <div className="mb-4">
                  <h5 className="text-primary mb-3">Bank Details</h5>
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
                    className="btn btn-primary btn-lg"
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
                        Register as Vendor
                      </>
                    )}
                  </button>
                </div>

                <div className="text-center mt-3">
                  <p className="mb-0">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary">
                      Login here
                    </Link>
                  </p>
                  <p className="mb-0">
                    Want to work as a driver?{' '}
                    <Link to="/driver-register" className="text-primary">
                      Driver Registration
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

export default VendorRegister;
