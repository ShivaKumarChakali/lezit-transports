import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import { Service } from '../types';
import { toast } from 'react-toastify';

const Services: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      console.log('🔍 Fetching services...');
      const response = await apiService.getServices();
      console.log('📡 Services response:', response);
      
      if (response.success) {
        console.log('✅ Services loaded successfully:', response.data);
        setServices(response.data || []);
      } else {
        console.error('❌ Services response failed:', response.message);
        toast.error(response.message || 'Failed to load services');
      }
    } catch (error) {
      console.error('💥 Error fetching services:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        response: (error as any)?.response?.data
      });
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to load services: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(service => service.category === selectedCategory);

  const categories = [
    { id: 'all', name: 'All Services', icon: 'fas fa-th' },
    { id: 'person', name: 'Person Transportation', icon: 'fas fa-users' },
    { id: 'goods', name: 'Goods Transportation', icon: 'fas fa-truck' },
    { id: 'business', name: 'Business Solutions', icon: 'fas fa-building' }
  ];

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold text-primary mb-3">Our Services</h1>
        <p className="lead text-muted">
          Comprehensive transportation solutions for all your needs
        </p>
      </div>

      {/* Category Filter */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="d-flex flex-wrap justify-content-center gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`btn ${selectedCategory === category.id ? 'btn-primary' : 'btn-outline-primary'} rounded-pill px-4 py-2`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <i className={`${category.icon} me-2`}></i>
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="row g-4">
        {filteredServices.length === 0 ? (
          <div className="col-12 text-center">
            <div className="py-5">
              <i className="fas fa-search fa-3x text-muted mb-3"></i>
              <h4 className="text-muted">No services found</h4>
              <p className="text-muted">Try selecting a different category</p>
            </div>
          </div>
        ) : (
          filteredServices.map((service) => {
            // Get appropriate icon based on service category
            const getServiceIcon = (category: string) => {
              switch (category) {
                case 'person':
                  return 'fas fa-users';
                case 'goods':
                  return 'fas fa-truck';
                case 'business':
                  return 'fas fa-building';
                default:
                  return 'fas fa-cog';
              }
            };

            return (
              <div key={service._id} className="col-lg-4 col-md-6">
                <div className="card h-100 feature-card border-0 shadow-sm">
                  <div className="card-body text-center p-4">
                    <div className="service-icon mb-3">
                      <i className={getServiceIcon(service.category)}></i>
                    </div>
                    <h5 className="card-title">{service.name}</h5>
                    <p className="card-text text-muted">
                      {service.description}
                    </p>
                    
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <span className="text-primary fw-bold">₹{service.basePrice}</span>
                        {service.pricePerKm && (
                          <span className="text-muted ms-2">+ ₹{service.pricePerKm}/km</span>
                        )}
                      </div>
                      <span className={`badge ${service.isActive ? 'bg-success' : 'bg-secondary'}`}>
                        {service.isActive ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                    
                    <div className="d-grid">
                      {isAuthenticated ? (
                        <Link 
                          to={`/bookings/new?service=${service._id}`}
                          className="btn btn-primary"
                        >
                          <i className="fas fa-calendar-plus me-2"></i>
                          Book Now
                        </Link>
                      ) : (
                        <Link 
                          to="/login"
                          className="btn btn-outline-primary"
                        >
                          <i className="fas fa-sign-in-alt me-2"></i>
                          Login to Book
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Call to Action */}
      <div className="row mt-5">
        <div className="col-12">
          <div className="bg-primary text-white rounded-3 p-5 text-center">
            <h3 className="mb-3">Need a Custom Solution?</h3>
            <p className="mb-4">
              Contact us for specialized transportation requirements and bulk bookings
            </p>
            <div className="d-flex justify-content-center gap-3">
              <Link to="/contact" className="btn btn-light">
                <i className="fas fa-phone me-2"></i>
                Contact Us
              </Link>
              <Link to="/register" className="btn btn-outline-light">
                <i className="fas fa-user-plus me-2"></i>
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services; 