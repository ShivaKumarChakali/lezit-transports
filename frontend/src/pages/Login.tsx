import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const schema = yup.object({
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
}).required();

type LoginFormData = yup.InferType<typeof schema>;

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormData>({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      toast.success('Login successful!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    }
  };

  return (
    <div className="login-page-new">
      <div className="login-container">
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
        <div className="login-content">
          <div className="login-card">
            {/* Header */}
            <div className="login-header">
              <div className="logo-section">
                <img 
                  src="/lezit-logo-removebg-preview.png" 
                  alt="LEZIT TRANSPORTS" 
                  className="login-logo"
                />
                <h1 className="login-title">Welcome Back</h1>
                <p className="login-subtitle">Sign in to continue your journey</p>
              </div>
            </div>

            {/* Form */}
            <div className="login-form-section">
              <form onSubmit={handleSubmit(onSubmit)} className="login-form-new">
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

                <div className="form-options">
                  <label className="checkbox-wrapper">
                    <input type="checkbox" className="checkbox-input" />
                    <span className="checkbox-custom"></span>
                    <span className="checkbox-label">Remember me</span>
                  </label>
                  <Link to="/forgot-password" className="forgot-link">
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  className="login-submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="spinner"></div>
                      Signing in...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-sign-in-alt"></i>
                      Sign In
                    </>
                  )}
                </button>

                <div className="login-divider">
                  <span>or</span>
                </div>

                <div className="social-login">
                  <button 
                    type="button" 
                    className="social-btn google-btn"
                    onClick={() => window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/auth/google`}
                  >
                    <i className="fab fa-google"></i>
                    Continue with Google
                  </button>
                  <button 
                    type="button" 
                    className="social-btn facebook-btn"
                    onClick={() => window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/auth/facebook`}
                  >
                    <i className="fab fa-facebook-f"></i>
                    Continue with Facebook
                  </button>
                </div>

                <div className="login-footer">
                  <p>
                    Don't have an account?{' '}
                    <Link to="/register" className="register-link">
                      Create one
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

export default Login; 