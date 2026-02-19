import React from 'react';
import ServiceProviderForms from '../components/ServiceProviderForms';

const ServiceProviderPage: React.FC = () => {
  return (
    <div className="container py-4">
      <h2 className="mb-4">Service Provider & Driver Requests</h2>
      <p className="text-muted">Choose a form below to submit your request to join as a service provider, vehicle owner, or driver.</p>
      <ServiceProviderForms />
    </div>
  );
};

export default ServiceProviderPage;
