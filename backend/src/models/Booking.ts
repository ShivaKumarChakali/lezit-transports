import mongoose, { Document, Schema } from 'mongoose';
import { IBooking } from '../types';

export interface IBookingDocument extends Omit<IBooking, '_id'>, Document {}

const bookingSchema = new Schema<IBookingDocument>({
  orderId: {
    type: String
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  } as any,
  sourcePlatform: {
    type: String,
    enum: ['phone', 'email', 'whatsapp', 'website', 'facebook', 'instagram', 'linkedin', 'mobile_app', 'direct_office'],
    default: 'website'
  },
  serviceType: {
    type: String,
    enum: ['person', 'goods'],
    required: true
  },
  serviceCategory: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  pickupLocation: {
    type: String,
    required: [true, 'Pickup location is required']
  },
  dropLocation: {
    type: String,
    required: [true, 'Drop location is required']
  },
  pickupDate: {
    type: Date,
    required: [true, 'Pickup date is required']
  },
  pickupTime: {
    type: String,
    required: [true, 'Pickup time is required']
  },
  dropDate: {
    type: Date
  },
  dropTime: {
    type: String
  },
  numberOfPersons: {
    type: Number,
    min: [1, 'Number of persons must be at least 1']
  },
  goodsDescription: {
    type: String
  },
  vehicleType: {
    type: String
  },
  driverRequired: {
    type: Boolean,
    default: true
  },
  orderStatus: {
    type: String,
    enum: ['primary', 'updated', 'quotation_shared', 'confirmed', 'in_progress', 'pending_payment', 'completed', 'pending_feedback', 'cancelled'],
    default: 'primary'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  // Vendor and driver assignment
  assignedVendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle'
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String
  },
  specialInstructions: {
    type: String,
    maxlength: [500, 'Special instructions cannot exceed 500 characters']
  },
  // Related document references
  quotationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quotation'
  },
  salesOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SalesOrder'
  },
  purchaseOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PurchaseOrder'
  },
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice'
  },
  billId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bill'
  }
}, {
  timestamps: true
});

// Index for better query performance
bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ orderStatus: 1 });
bookingSchema.index({ orderId: 1 }, { unique: true, sparse: true });
bookingSchema.index({ pickupDate: 1 });
bookingSchema.index({ sourcePlatform: 1 });

export default mongoose.model<IBookingDocument>('Booking', bookingSchema); 