import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
    navigate('/');
  };

  const handleMobileLinkClick = () => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  };

  return (
    <nav className="shadow-lg" style={{ backgroundColor: '#000000', borderBottom: '2px solid #d4af37' }}>
      <div className="container py-2">
        <div className="d-flex align-items-center justify-content-between gap-2">
          <Link className="d-flex align-items-center" to="/">
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
                e.currentTarget.style.display = 'none';
              }}
            />
          </Link>

          <button
            className="btn btn-outline-light d-lg-none"
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation"
            aria-expanded={isMobileMenuOpen}
          >
            <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>

          <div className="d-none d-lg-flex flex-wrap align-items-center gap-2">
            <Link className="legacy-nav-link px-3 py-2 text-decoration-none rounded" to="/">Home</Link>
            <Link className="legacy-nav-link px-3 py-2 text-decoration-none rounded" to="/services">Services</Link>
            {isAuthenticated && user?.role === 'user' && (
              <Link className="legacy-nav-link px-3 py-2 text-decoration-none rounded" to="/bookings">My Bookings</Link>
            )}
            {isAuthenticated && user?.role === 'vendor' && (
              <Link className="legacy-nav-link px-3 py-2 text-decoration-none rounded" to="/vendor-dashboard">Dashboard</Link>
            )}
            {isAuthenticated && user?.role === 'driver' && (
              <Link className="legacy-nav-link px-3 py-2 text-decoration-none rounded" to="/driver-dashboard">Dashboard</Link>
            )}
            {isAuthenticated && user?.role === 'admin' && (
              <Link className="legacy-nav-link px-3 py-2 text-decoration-none rounded" to="/admin">Admin</Link>
            )}
            <Link className="legacy-nav-link px-3 py-2 text-decoration-none rounded" to="/provider">
              <i className="fas fa-briefcase me-1"></i>
              Become a Partner
            </Link>
            <Link className="legacy-nav-link px-3 py-2 text-decoration-none rounded" to="/contact">Contact</Link>
          </div>

          <div className="d-none d-lg-flex align-items-center gap-2">
            {isAuthenticated ? (
              <>
                <div className="dropdown" ref={dropdownRef}>
                  <button
                    className="btn btn-light dropdown-toggle"
                    type="button"
                    onClick={toggleDropdown}
                    style={{ color: '#000000', fontWeight: 600 }}
                  >
                    <i className="fas fa-user me-2"></i>
                    {user?.name}
                  </button>
                  <ul className={`dropdown-menu ${isDropdownOpen ? 'show' : ''}`}>
                    <li>
                      <Link className="dropdown-item" to="/profile" onClick={() => setIsDropdownOpen(false)}>
                        <i className="fas fa-user-cog me-2"></i>
                        Profile
                      </Link>
                    </li>
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
                <button className="btn btn-outline-light" onClick={handleLogout} title="Logout">
                  <i className="fas fa-sign-out-alt me-2"></i>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link className="btn" to="/login" style={{ borderColor: '#d4af37', color: '#f8f8f8' }}>
                  Login
                </Link>
                <Link className="btn" to="/register" style={{ backgroundColor: '#d4af37', borderColor: '#d4af37', color: '#000000', fontWeight: 600 }}>
                  Register
                </Link>
              </>
            )}
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="d-lg-none mt-2 pt-2 border-top" style={{ borderColor: 'rgba(255,255,255,0.25)' }}>
            <div className="d-flex flex-column gap-1">
              <Link className="legacy-nav-link px-2 py-2 text-decoration-none rounded" to="/" onClick={handleMobileLinkClick}>Home</Link>
              <Link className="legacy-nav-link px-2 py-2 text-decoration-none rounded" to="/services" onClick={handleMobileLinkClick}>Services</Link>
              {isAuthenticated && user?.role === 'user' && (
                <Link className="legacy-nav-link px-2 py-2 text-decoration-none rounded" to="/bookings" onClick={handleMobileLinkClick}>My Bookings</Link>
              )}
              {isAuthenticated && user?.role === 'vendor' && (
                <Link className="legacy-nav-link px-2 py-2 text-decoration-none rounded" to="/vendor-dashboard" onClick={handleMobileLinkClick}>Dashboard</Link>
              )}
              {isAuthenticated && user?.role === 'driver' && (
                <Link className="legacy-nav-link px-2 py-2 text-decoration-none rounded" to="/driver-dashboard" onClick={handleMobileLinkClick}>Dashboard</Link>
              )}
              {isAuthenticated && user?.role === 'admin' && (
                <Link className="legacy-nav-link px-2 py-2 text-decoration-none rounded" to="/admin" onClick={handleMobileLinkClick}>Admin</Link>
              )}
              <Link className="legacy-nav-link px-2 py-2 text-decoration-none rounded" to="/provider" onClick={handleMobileLinkClick}>
                <i className="fas fa-briefcase me-1"></i>
                Become a Partner
              </Link>
              <Link className="legacy-nav-link px-2 py-2 text-decoration-none rounded" to="/contact" onClick={handleMobileLinkClick}>Contact</Link>
            </div>

            <div className="d-flex flex-column gap-2 mt-2">
              {isAuthenticated ? (
                <>
                  <Link className="btn btn-light" to="/profile" onClick={handleMobileLinkClick}>Profile</Link>
                  <button className="btn btn-outline-light" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt me-2"></i>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link className="btn" to="/login" style={{ borderColor: '#d4af37', color: '#f8f8f8' }} onClick={handleMobileLinkClick}>
                    Login
                  </Link>
                  <Link className="btn" to="/register" style={{ backgroundColor: '#d4af37', borderColor: '#d4af37', color: '#000000', fontWeight: 600 }} onClick={handleMobileLinkClick}>
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Header; 