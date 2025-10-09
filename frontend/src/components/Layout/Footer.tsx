import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="footer-modern">
      {/* Main Footer Content */}
      <div className="footer-main">
        <div className="container">
          <div className="row g-4">
            {/* Company Info */}
            <div className="col-lg-4 col-md-6">
              <div className="footer-widget">
                <div className="footer-logo mb-4">
                  <div className="footer-logo-container mb-3">
                    <img 
                      src="/lezit-logo-removebg-preview.png" 
                      alt="LEZIT TRANSPORTS" 
                      className="footer-logo-img"
                      style={{ 
                        height: '60px', 
                        width: 'auto',
                        filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4))'
                      }}
                      onError={(e) => {
                        console.error('Logo failed to load');
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="logo-underline"></div>
                </div>
                <p className="footer-description mb-4">
                  Your trusted partner for reliable transportation services across India. 
                  We provide safe, efficient, and affordable solutions for all your travel and logistics needs.
                </p>
                <div className="social-links">
                  <h6 className="text-white mb-3">Follow Us</h6>
                  <div className="social-icons">
                    <a href="https://www.linkedin.com/company/lezit-transports/posts/?feedView=all" className="social-icon linkedin" title="LinkedIn" target="_blank" rel="noopener noreferrer">
                      <i className="fab fa-linkedin"></i>
                    </a>
                    <a href="https://www.facebook.com/profile.php?id=61564706123578&mibextid=ZbWKwL" className="social-icon facebook" title="Facebook" target="_blank" rel="noopener noreferrer">
                      <i className="fab fa-facebook"></i>
                    </a>
                    <a href="https://www.instagram.com/lezit_transports/profilecard/?igsh=Nnc5emFhOHphNXk=" className="social-icon instagram" title="Instagram" target="_blank" rel="noopener noreferrer">
                      <i className="fab fa-instagram"></i>
                    </a>
                    <a href="https://x.com/LezitTransports?s=08" className="social-icon twitter" title="Twitter" target="_blank" rel="noopener noreferrer">
                      <i className="fab fa-twitter"></i>
                    </a>
                    <a href="https://wa.me/message/LIOA42WBIYOBK1" className="social-icon whatsapp" title="WhatsApp" target="_blank" rel="noopener noreferrer">
                      <i className="fab fa-whatsapp"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick Links */}
            <div className="col-lg-2 col-md-6">
              <div className="footer-widget">
                <h5 className="footer-title">Quick Links</h5>
                <ul className="footer-links">
                  <li>
                    <Link to="/" className="footer-link">
                      <i className="fas fa-home me-2"></i>
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link to="/services" className="footer-link">
                      <i className="fas fa-cogs me-2"></i>
                      Services
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" className="footer-link">
                      <i className="fas fa-envelope me-2"></i>
                      Contact
                    </Link>
                  </li>
                  <li>
                    <Link to="/about" className="footer-link">
                      <i className="fas fa-info-circle me-2"></i>
                      About Us
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Services */}
            <div className="col-lg-3 col-md-6">
              <div className="footer-widget">
                <h5 className="footer-title">Our Services</h5>
                <ul className="footer-links">
                  <li>
                    <span className="footer-link">
                      <i className="fas fa-users me-2"></i>
                      Person Transportation
                    </span>
                  </li>
                  <li>
                    <span className="footer-link">
                      <i className="fas fa-box me-2"></i>
                      Goods Transportation
                    </span>
                  </li>
                  <li>
                    <span className="footer-link">
                      <i className="fas fa-briefcase me-2"></i>
                      Business Travel
                    </span>
                  </li>
                  <li>
                    <span className="footer-link">
                      <i className="fas fa-calendar-alt me-2"></i>
                      Event Transportation
                    </span>
                  </li>
                  <li>
                    <span className="footer-link">
                      <i className="fas fa-route me-2"></i>
                      Interstate Travel
                    </span>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Contact Info */}
            <div className="col-lg-3 col-md-6">
              <div className="footer-widget">
                <h5 className="footer-title">Contact Info</h5>
                <div className="contact-info">
                  <div className="contact-item">
                    <div className="contact-icon">
                      <i className="fas fa-map-marker-alt"></i>
                    </div>
                    <div className="contact-details">
                      <h6 className="text-white mb-1">Address</h6>
                      <p className="mb-0">Hyderabad, Telangana, India</p>
                    </div>
                  </div>
                  
                  <div className="contact-item">
                    <div className="contact-icon">
                      <i className="fas fa-phone"></i>
                    </div>
                    <div className="contact-details">
                      <h6 className="text-white mb-1">Phone</h6>
                      <p className="mb-0">+91 98765 43210</p>
                    </div>
                  </div>
                  
                  <div className="contact-item">
                    <div className="contact-icon">
                      <i className="fas fa-envelope"></i>
                    </div>
                    <div className="contact-details">
                      <h6 className="text-white mb-1">Email</h6>
                      <p className="mb-0">info@lezittransports.com</p>
                    </div>
                  </div>
                  
                  <div className="contact-item">
                    <div className="contact-icon">
                      <i className="fas fa-clock"></i>
                    </div>
                    <div className="contact-details">
                      <h6 className="text-white mb-1">Business Hours</h6>
                      <p className="mb-0">24/7 Service Available</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6">
              <p className="copyright mb-0">
                © 2024 <strong>LEZIT TRANSPORTS</strong>. All rights reserved.
              </p>
            </div>
            <div className="col-md-6 text-md-end">
              <p className="copyright mb-0">
                Designed with <i className="fas fa-heart text-danger"></i> for reliable transportation
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="footer-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>
    </footer>
  );
};

export default Footer; 