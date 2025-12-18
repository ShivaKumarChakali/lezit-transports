import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const schema = yup.object({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  phone: yup.string().required('Phone number is required').matches(/^[0-9]{10}$/, 'Phone number must be 10 digits'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: yup.string().oneOf([yup.ref('password')], 'Passwords must match').required('Confirm password is required'),
}).required();

type RegisterFormData = yup.InferType<typeof schema>;

const Register: React.FC = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegisterFormData>({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password
      });
      toast.success('Registration successful! Please log in.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    }
  };

  return (
    <div className="register-page-new">
      <div className="register-container">
        {/* Background Elements */}
        <div className="bg-elements">
          <div className="bg-circle bg-circle-1"></div>
          <div className="bg-circle bg-circle-2"></div>
          <div className="bg-circle bg-circle-3"></div>
          <div className="bg-lines">
            <div className="line line-1"></div>
            <div className="line line-2"></div>
            <div className="line line-3"></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="register-content">
          <div className="register-card">
            {/* Header */}
            <div className="register-header">
              <div className="logo-section">
                <img 
                  src="/lezit-logo-removebg-preview.png" 
                  alt="LEZIT TRANSPORTS" 
                  className="register-logo"
                />
                <h1 className="register-title">Join LEZIT TRANSPORTS</h1>
                <p className="register-subtitle">Create your account and start your journey</p>
              </div>
            </div>

            {/* Form */}
            <div className="register-form-section">
              <form onSubmit={handleSubmit(onSubmit)} className="register-form-new">
                <div className="form-group">
                  <div className="input-wrapper">
                    <div className="input-icon">
                      <i className="fas fa-user"></i>
                    </div>
                    <input
                      type="text"
                      id="name"
                      className={`form-input ${errors.name ? 'error' : ''}`}
                      placeholder="Full name"
                      {...register('name')}
                    />
                    <div className="input-line"></div>
                  </div>
                  {errors.name && (
                    <div className="error-message">
                      <i className="fas fa-exclamation-circle"></i>
                      {errors.name.message}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <div className="input-wrapper">
                    <div className="input-icon">
                      <i className="fas fa-envelope"></i>
                    </div>
                    <input
                      type="email"
                      id="email"
                      className={`form-input ${errors.email ? 'error' : ''}`}
                      placeholder="Email address"
                      {...register('email')}
                    />
                    <div className="input-line"></div>
                  </div>
                  {errors.email && (
                    <div className="error-message">
                      <i className="fas fa-exclamation-circle"></i>
                      {errors.email.message}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <div className="input-wrapper">
                    <div className="input-icon">
                      <i className="fas fa-phone"></i>
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      className={`form-input ${errors.phone ? 'error' : ''}`}
                      placeholder="Phone number"
                      {...register('phone')}
                    />
                    <div className="input-line"></div>
                  </div>
                  {errors.phone && (
                    <div className="error-message">
                      <i className="fas fa-exclamation-circle"></i>
                      {errors.phone.message}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <div className="input-wrapper">
                    <div className="input-icon">
                      <i className="fas fa-lock"></i>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      className={`form-input ${errors.password ? 'error' : ''}`}
                      placeholder="Password"
                      {...register('password')}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                    <div className="input-line"></div>
                  </div>
                  {errors.password && (
                    <div className="error-message">
                      <i className="fas fa-exclamation-circle"></i>
                      {errors.password.message}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <div className="input-wrapper">
                    <div className="input-icon">
                      <i className="fas fa-lock"></i>
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                      placeholder="Confirm password"
                      {...register('confirmPassword')}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                    <div className="input-line"></div>
                  </div>
                  {errors.confirmPassword && (
                    <div className="error-message">
                      <i className="fas fa-exclamation-circle"></i>
                      {errors.confirmPassword.message}
                    </div>
                  )}
                </div>

                <div className="form-options">
                  <label className="checkbox-wrapper">
                    <input type="checkbox" className="checkbox-input" required />
                    <span className="checkbox-custom"></span>
                    <span className="checkbox-label">
                      I agree to the{' '}
                      <a href="/terms" className="terms-link">Terms of Service</a>
                      {' '}and{' '}
                      <a href="/privacy" className="terms-link">Privacy Policy</a>
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="register-submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="spinner"></div>
                      Creating account...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-user-plus"></i>
                      Create Account
                    </>
                  )}
                </button>

                <div className="role-selection-section">
                  <div className="role-divider">
                    <span>Want to join our network?</span>
                  </div>
                  
                  <div className="role-buttons">
                    <Link to="/vendor-register" className="role-btn vendor-btn">
                      <i className="fas fa-building"></i>
                      <div className="role-btn-content">
                        <h4>Become a Vendor</h4>
                        <p>Provide vehicles and services</p>
                      </div>
                    </Link>
                    
                    <Link to="/driver-register" className="role-btn driver-btn">
                      <i className="fas fa-car"></i>
                      <div className="role-btn-content">
                        <h4>Become a Driver</h4>
                        <p>Drive for our platform</p>
                      </div>
                    </Link>
                  </div>
                </div>

                <div className="register-divider">
                  <span>or</span>
                </div>

                <div className="social-login">
                  <button 
                    type="button" 
                    className="social-btn google-btn"
                    onClick={() => {
                      const apiBase = process.env.REACT_APP_API_URL?.replace('/api', '') || 'https://lezit-transports-backend.onrender.com';
                      window.location.href = `${apiBase}/api/auth/google`;
                    }}
                  >
                    <i className="fab fa-google"></i>
                    Continue with Google
                  </button>
                  <button 
                    type="button" 
                    className="social-btn facebook-btn"
                    onClick={() => {
                      const apiBase = process.env.REACT_APP_API_URL?.replace('/api', '') || 'https://lezit-transports-backend.onrender.com';
                      window.location.href = `${apiBase}/api/auth/facebook`;
                    }}
                  >
                    <i className="fab fa-facebook-f"></i>
                    Continue with Facebook
                  </button>
                </div>

                <div className="register-footer">
                  <p>
                    Already have an account?{' '}
                    <Link to="/login" className="login-link">
                      Sign in
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

export default Register; 