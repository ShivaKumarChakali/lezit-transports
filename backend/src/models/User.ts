import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from '../types';

export interface IUserDocument extends Omit<IUser, '_id'>, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUserDocument>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  password: {
    type: String,
    required: function() { return !this.googleId && !this.facebookId; }, // Password required only if not OAuth
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  facebookId: {
    type: String,
    unique: true,
    sparse: true
  },
  phone: {
    type: String,
    required: function() { return !this.googleId && !this.facebookId; }, // Phone required only if not OAuth
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'vendor', 'driver'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Vendor-specific fields
  businessName: {
    type: String,
    required: function() { return this.role === 'vendor'; }
  },
  businessType: {
    type: String,
    enum: ['car_rental', 'taxi_service', 'bus_service', 'truck_service', 'other'],
    required: function() { return this.role === 'vendor'; }
  },
  businessLicense: {
    type: String,
    required: function() { return this.role === 'vendor'; }
  },
  businessAddress: {
    type: String,
    required: function() { return this.role === 'vendor'; }
  },
  // Driver-specific fields
  licenseNumber: {
    type: String,
    required: function() { return this.role === 'driver'; }
  },
  licenseExpiry: {
    type: Date,
    required: function() { return this.role === 'driver'; }
  },
  vehicleType: {
    type: String,
    enum: ['car', 'suv', 'van', 'bus', 'truck', 'bike'],
    required: function() { return this.role === 'driver'; }
  },
  experience: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  // Common fields for vendors and drivers
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    accountHolderName: String
  },
  documents: {
    aadhar: String,
    pan: String,
    license: String,
    vehicleRC: String,
    insurance: String
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUserDocument>('User', userSchema); 