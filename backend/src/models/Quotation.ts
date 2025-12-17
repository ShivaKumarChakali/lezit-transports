import mongoose, { Document, Schema } from 'mongoose';
import { IQuotation } from '../types';

export interface IQuotationDocument extends Omit<IQuotation, '_id'>, Document {}

const quotationItemSchema = new Schema({
  description: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    min: 0
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

const quotationSchema = new Schema<IQuotationDocument>({
  quotationNumber: {
    type: String,
    required: true
  },
  bookingId: {
    type: Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  } as any,
  orderId: {
    type: String
  },
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  } as any,
  providerId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  } as any,
  items: [quotationItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  taxes: {
    type: Number,
    default: 0,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  termsAndConditions: {
    type: String
  },
  validUntil: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'approved', 'expired', 'rejected'],
    default: 'draft'
  },
  sentAt: {
    type: Date
  },
  approvedAt: {
    type: Date
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  } as any
}, {
  timestamps: true
});

// Indexes
quotationSchema.index({ bookingId: 1 });
quotationSchema.index({ orderId: 1 });
quotationSchema.index({ quotationNumber: 1 }, { unique: true });
quotationSchema.index({ customerId: 1 });
quotationSchema.index({ status: 1 });
quotationSchema.index({ validUntil: 1 });

export default mongoose.model<IQuotationDocument>('Quotation', quotationSchema);

