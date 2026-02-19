import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debug: Log user info to console
  console.log('Header - User:', user);
  console.log('Header - User role:', user?.role);
  console.log('Header - Is authenticated:', isAuthenticated);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-black shadow-sm">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <img 
            src="/lezit-logo-removebg-preview.png" 
            alt="LEZIT TRANSPORTS" 
            className="navbar-logo"
            style={{ 
              height: '45px', 
              width: 'auto',
              filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))'
            }}
            onError={(e) => {
              console.error('Logo failed to load');
              e.currentTarget.style.display = 'none';
            }}
          />
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/services">Services</Link>
            </li>
            {isAuthenticated && user?.role === 'user' && (
              <li className="nav-item">
                <Link className="nav-link" to="/bookings">My Bookings</Link>
              </li>
            )}
            {isAuthenticated && user?.role === 'vendor' && (
              <li className="nav-item">
                <Link className="nav-link" to="/vendor-dashboard">Dashboard</Link>
              </li>
            )}
            {isAuthenticated && user?.role === 'driver' && (
              <li className="nav-item">
                <Link className="nav-link" to="/driver-dashboard">Dashboard</Link>
              </li>
            )}
            {isAuthenticated && user?.role === 'admin' && (
              <li className="nav-item">
                <Link className="nav-link" to="/admin">Admin</Link>
              </li>
            )}
            <li className="nav-item">
              <Link className="nav-link" to="/provider">
                <i className="fas fa-briefcase me-1"></i>
                Become a Partner
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/contact">Contact</Link>
            </li>
          </ul>
          
          <div className="navbar-nav">
            {isAuthenticated ? (
              <div className="d-flex align-items-center">
                <div className="dropdown me-3" ref={dropdownRef}>
                  <button 
                    className="btn btn-outline-light dropdown-toggle" 
                    type="button" 
                    onClick={toggleDropdown}
                  >
                    <i className="fas fa-user me-2"></i>
                    {user?.name} 
                    {user?.role === 'admin' && <span className="badge bg-danger ms-1">Admin</span>}
                    {user?.role === 'vendor' && <span className="badge bg-primary ms-1">Vendor</span>}
                    {user?.role === 'driver' && <span className="badge bg-success ms-1">Driver</span>}
                  </button>
                  <ul className={`dropdown-menu ${isDropdownOpen ? 'show' : ''}`}>
                    <li>
                      <Link className="dropdown-item" to="/profile" onClick={() => setIsDropdownOpen(false)}>
                        <i className="fas fa-user-cog me-2"></i>
                        Profile
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/bookings" onClick={() => setIsDropdownOpen(false)}>
                        <i className="fas fa-calendar me-2"></i>
                        My Bookings
                      </Link>
                    </li>
                    {user?.role === 'admin' && (
                      <li>
                        <Link className="dropdown-item text-primary" to="/admin" onClick={() => setIsDropdownOpen(false)}>
                          <i className="fas fa-tachometer-alt me-2"></i>
                          Admin Dashboard
                        </Link>
                      </li>
                    )}
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button 
                        className="dropdown-item text-danger" 
                        onClick={() => {
                          setIsDropdownOpen(false);
                          handleLogout();
                        }}
                      >
                        <i className="fas fa-sign-out-alt me-2"></i>
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
                <button 
                  className="btn btn-outline-danger" 
                  onClick={handleLogout}
                  title="Logout"
                >
                  <i className="fas fa-sign-out-alt me-2"></i>
                  Logout
                </button>
              </div>
            ) : (
              <div className="d-flex">
                <Link className="btn btn-outline-light me-2" to="/login">
                  Login
                </Link>
                <Link className="btn btn-primary" to="/register">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header; 