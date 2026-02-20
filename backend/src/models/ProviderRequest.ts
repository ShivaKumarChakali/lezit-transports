import mongoose, { Schema, Document } from 'mongoose';

export interface IProviderRequest extends Document {
  requestType: 'service-provider' | 'vehicle-owner' | 'driver';
  entityType?: 'individual' | 'non-individual';
  businessName?: string;
  fullName: string;
  mobile: string;
  email?: string;
  address?: string;
  transportType?: 'passenger' | 'goods';
  hasLicence?: boolean;
  drivingFor?: string;
  status: 'new' | 'reviewed' | 'accepted' | 'rejected';
}

const ProviderRequestSchema: Schema = new Schema(
  {
    requestType: { type: String, enum: ['service-provider', 'vehicle-owner', 'driver'], required: true },
    entityType: { type: String, enum: ['individual', 'non-individual'] },
    businessName: { type: String },
    fullName: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String },
    address: { type: String },
    transportType: { type: String, enum: ['passenger', 'goods'] },
    hasLicence: { type: Boolean },
    drivingFor: { type: String },
    status: { type: String, enum: ['new', 'reviewed', 'accepted', 'rejected'], default: 'new' }
  },
  { timestamps: true }
);

export default mongoose.model<IProviderRequest>('ProviderRequest', ProviderRequestSchema);
