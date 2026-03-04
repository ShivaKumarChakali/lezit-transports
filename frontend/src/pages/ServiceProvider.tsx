import React from 'react';
import ServiceProviderForms from '../components/ServiceProviderForms';

const ServiceProviderPage: React.FC = () => {
  return (
    <div className="container py-4 py-lg-5 partner-page">
      <div className="partner-page-hero mb-4 mb-lg-5">
        <span className="partner-badge">Join the LEZIT Network</span>
        <h2 className="partner-title mt-3 mb-2">Service Provider & Driver Requests</h2>
        <p className="partner-subtitle mb-0">Choose a form below to submit your request to join as a service provider, vehicle owner, or driver.</p>
      </div>

      <div className="partner-form-card">
        <ServiceProviderForms />
      </div>
    </div>
  );
};

export default ServiceProviderPage;
