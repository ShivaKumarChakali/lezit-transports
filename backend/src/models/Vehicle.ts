import mongoose, { Document, Schema } from 'mongoose';

export interface IVehicle extends Document {
  _id: string;
  vendorId: mongoose.Types.ObjectId;
  name: string;
  type: 'car' | 'suv' | 'van' | 'bus' | 'truck' | 'bike';
  make: string;
  vehicleModel: string;
  year: number;
  licensePlate: string;
  capacity: number;
  features: string[];
  pricePerKm: number;
  basePrice: number;
  isAvailable: boolean;
  isActive: boolean;
  images: string[];
  documents: {
    rc: string;
    insurance: string;
    permit: string;
  };
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  rating: number;
  totalBookings: number;
  createdAt: Date;
  updatedAt: Date;
}

const VehicleSchema = new Schema<IVehicle>({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Vendor ID is required']
  },
  name: {
    type: String,
    required: [true, 'Vehicle name is required']
  },
  type: {
    type: String,
    enum: ['car', 'suv', 'van', 'bus', 'truck', 'bike'],
    required: [true, 'Vehicle type is required']
  },
  make: {
    type: String,
    required: [true, 'Vehicle make is required']
  },
  vehicleModel: {
    type: String,
    required: [true, 'Vehicle model is required']
  },
  year: {
    type: Number,
    required: [true, 'Vehicle year is required'],
    min: [1990, 'Vehicle year cannot be before 1990'],
    max: [new Date().getFullYear() + 1, 'Vehicle year cannot be in the future']
  },
  licensePlate: {
    type: String,
    required: [true, 'License plate is required'],
    unique: true
  },
  capacity: {
    type: Number,
    required: [true, 'Vehicle capacity is required'],
    min: [1, 'Capacity must be at least 1']
  },
  features: [{
    type: String
  }],
  pricePerKm: {
    type: Number,
    required: [true, 'Price per km is required'],
    min: [0, 'Price per km cannot be negative']
  },
  basePrice: {
    type: Number,
    required: [true, 'Base price is required'],
    min: [0, 'Base price cannot be negative']
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  images: [{
    type: String
  }],
  documents: {
    rc: {
      type: String,
      required: [true, 'RC document is required']
    },
    insurance: {
      type: String,
      required: [true, 'Insurance document is required']
    },
    permit: String
  },
  location: {
    latitude: {
      type: Number,
      required: [true, 'Latitude is required']
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required']
    },
    address: {
      type: String,
      required: [true, 'Address is required']
    }
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot exceed 5']
  },
  totalBookings: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries
VehicleSchema.index({ vendorId: 1 });
VehicleSchema.index({ type: 1 });
VehicleSchema.index({ isAvailable: 1, isActive: 1 });
VehicleSchema.index({ location: '2dsphere' });

export default mongoose.model<IVehicle>('Vehicle', VehicleSchema);
