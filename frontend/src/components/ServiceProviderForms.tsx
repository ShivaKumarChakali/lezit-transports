import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { providerAPI } from '../services/api';

type ProviderFormValues = {
  entityType: 'individual' | 'non-individual';
  businessName?: string;
  fullName: string;
  mobile: string;
  email: string;
  address: string;
  transportType: 'passenger' | 'goods';
};

type DriverFormValues = ProviderFormValues & {
  hasLicence: 'yes' | 'no';
  drivingFor: string; // comma separated or single
};

const ServiceProviderForms: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'provider' | 'vehicle' | 'driver'>('provider');

  return (
    <div>
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'provider' ? 'active' : ''}`} onClick={() => setActiveTab('provider')}>Service Provider</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'vehicle' ? 'active' : ''}`} onClick={() => setActiveTab('vehicle')}>Vehicle Owner</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'driver' ? 'active' : ''}`} onClick={() => setActiveTab('driver')}>Lezit Driver</button>
        </li>
      </ul>

      <div>
        {activeTab === 'provider' && <ProviderForm />}
        {activeTab === 'vehicle' && <VehicleOwnerForm />}
        {activeTab === 'driver' && <DriverForm />}
      </div>
    </div>
  );
};

const ProviderForm: React.FC = () => {
  const { register, handleSubmit, watch, reset } = useForm<ProviderFormValues>({ defaultValues: { entityType: 'individual', transportType: 'passenger' } });
  const entityType = watch('entityType');

  const onSubmit = async (data: ProviderFormValues) => {
    try {
      const payload = {
        requestType: 'service-provider',
        entityType: data.entityType,
        businessName: data.businessName,
        fullName: data.fullName,
        mobile: data.mobile,
        email: data.email,
        address: data.address,
        transportType: data.transportType,
      };
      console.log('Submitting ProviderForm:', payload);
      await providerAPI.createProviderRequest(payload);
      alert('Request submitted successfully');
      reset();
    } catch (err: any) {
      alert('Failed to submit request: ' + err.message);
      console.error('Error details:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-3">
        <label className="form-label">Individual / Non-Individual</label>
        <div>
          <div className="form-check form-check-inline">
            <input className="form-check-input" {...register('entityType')} type="radio" value="individual" defaultChecked />
            <label className="form-check-label">Individual</label>
          </div>
          <div className="form-check form-check-inline">
            <input className="form-check-input" {...register('entityType')} type="radio" value="non-individual" />
            <label className="form-check-label">Non-Individual (Company, Partnership)</label>
          </div>
        </div>
      </div>

      {entityType === 'non-individual' && (
        <div className="mb-3">
          <label className="form-label">Name of the Business</label>
          <input className="form-control" {...register('businessName')} />
        </div>
      )}

      <div className="mb-3">
        <label className="form-label">Full Name</label>
        <input className="form-control" {...register('fullName', { required: true })} />
      </div>

      <div className="mb-3">
        <label className="form-label">Mobile Number</label>
        <input className="form-control" {...register('mobile', { required: true })} />
      </div>

      <div className="mb-3">
        <label className="form-label">Email ID</label>
        <input className="form-control" {...register('email', { required: true })} />
      </div>

      <div className="mb-3">
        <label className="form-label">Office / Work Address</label>
        <textarea className="form-control" {...register('address')} />
      </div>

      <div className="mb-3">
        <label className="form-label">Transportation Type</label>
        <select className="form-select" {...register('transportType')}>
          <option value="passenger">Passenger</option>
          <option value="goods">Goods</option>
        </select>
      </div>

      <button className="btn btn-primary" type="submit">Submit Request</button>
    </form>
  );
};

const VehicleOwnerForm: React.FC = () => {
  const { register, handleSubmit, watch, reset } = useForm<ProviderFormValues>({ defaultValues: { entityType: 'individual', transportType: 'passenger' } });
  const entityType = watch('entityType');

  const onSubmit = async (data: ProviderFormValues) => {
    try {
      const payload = {
        requestType: 'vehicle-owner',
        entityType: data.entityType,
        businessName: data.businessName,
        fullName: data.fullName,
        mobile: data.mobile,
        email: data.email,
        address: data.address,
        transportType: data.transportType,
      };
      console.log('Submitting VehicleOwnerForm:', payload);
      await providerAPI.createProviderRequest(payload);
      alert('Request submitted successfully');
      reset();
    } catch (err: any) {
      alert('Failed to submit request: ' + err.message);
      console.error('Error details:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-3">
        <label className="form-label">Individual / Non-Individual</label>
        <div>
          <div className="form-check form-check-inline">
            <input className="form-check-input" {...register('entityType')} type="radio" value="individual" defaultChecked />
            <label className="form-check-label">Individual</label>
          </div>
          <div className="form-check form-check-inline">
            <input className="form-check-input" {...register('entityType')} type="radio" value="non-individual" />
            <label className="form-check-label">Non-Individual (Organisation)</label>
          </div>
        </div>
      </div>

      {entityType === 'non-individual' && (
        <div className="mb-3">
          <label className="form-label">Name of the Business</label>
          <input className="form-control" {...register('businessName')} />
        </div>
      )}

      <div className="mb-3">
        <label className="form-label">Full Name</label>
        <input className="form-control" {...register('fullName', { required: true })} />
      </div>

      <div className="mb-3">
        <label className="form-label">Mobile Number</label>
        <input className="form-control" {...register('mobile', { required: true })} />
      </div>

      <div className="mb-3">
        <label className="form-label">Email ID</label>
        <input className="form-control" {...register('email', { required: true })} />
      </div>

      <div className="mb-3">
        <label className="form-label">Office / Work Address</label>
        <textarea className="form-control" {...register('address')} />
      </div>

      <div className="mb-3">
        <label className="form-label">Transportation Vehicle Type</label>
        <select className="form-select" {...register('transportType')}>
          <option value="passenger">Passenger</option>
          <option value="goods">Goods</option>
        </select>
      </div>

      <button className="btn btn-primary" type="submit">Submit Request</button>
    </form>
  );
};

const DriverForm: React.FC = () => {
  const { register, handleSubmit, watch, reset } = useForm<DriverFormValues>({ defaultValues: { entityType: 'individual', transportType: 'passenger', hasLicence: 'yes', drivingFor: 'Car' } });
  const entityType = watch('entityType');

  const onSubmit = async (data: DriverFormValues) => {
    try {
      const payload = {
        requestType: 'driver',
        entityType: data.entityType,
        businessName: data.businessName,
        fullName: data.fullName,
        mobile: data.mobile,
        email: data.email,
        address: data.address,
        transportType: data.transportType,
        hasLicence: data.hasLicence === 'yes',
        drivingFor: data.drivingFor,
      };
      console.log('Submitting DriverForm:', payload);
      await providerAPI.createProviderRequest(payload);
      alert('Request submitted successfully');
      reset();
    } catch (err: any) {
      alert('Failed to submit request: ' + err.message);
      console.error('Error details:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-3">
        <label className="form-label">Individual / Non-Individual</label>
        <div>
          <div className="form-check form-check-inline">
            <input className="form-check-input" {...register('entityType')} type="radio" value="individual" defaultChecked />
            <label className="form-check-label">Individual</label>
          </div>
          <div className="form-check form-check-inline">
            <input className="form-check-input" {...register('entityType')} type="radio" value="non-individual" />
            <label className="form-check-label">Non-Individual (Organisation)</label>
          </div>
        </div>
      </div>

      {entityType === 'non-individual' && (
        <div className="mb-3">
          <label className="form-label">Name of the Business</label>
          <input className="form-control" {...register('businessName')} />
        </div>
      )}

      <div className="mb-3">
        <label className="form-label">Full Name</label>
        <input className="form-control" {...register('fullName', { required: true })} />
      </div>

      <div className="mb-3">
        <label className="form-label">Mobile Number</label>
        <input className="form-control" {...register('mobile', { required: true })} />
      </div>

      <div className="mb-3">
        <label className="form-label">Email ID</label>
        <input className="form-control" {...register('email', { required: true })} />
      </div>

      <div className="mb-3">
        <label className="form-label">Office / Work Address</label>
        <textarea className="form-control" {...register('address')} />
      </div>

      <div className="mb-3">
        <label className="form-label">Had valid Driving Licence?</label>
        <div>
          <div className="form-check form-check-inline">
            <input className="form-check-input" {...register('hasLicence')} type="radio" value="yes" defaultChecked />
            <label className="form-check-label">Yes</label>
          </div>
          <div className="form-check form-check-inline">
            <input className="form-check-input" {...register('hasLicence')} type="radio" value="no" />
            <label className="form-check-label">No</label>
          </div>
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">Driving for</label>
        <select className="form-select" {...register('drivingFor')}>
          <option>Bike</option>
          <option>Auto</option>
          <option>Car</option>
          <option>Tempo Traveller</option>
          <option>Bus</option>
          <option>Mini truck</option>
          <option>Truck</option>
        </select>
      </div>

      <button className="btn btn-primary" type="submit">Submit Request</button>
    </form>
  );
};

export default ServiceProviderForms;
