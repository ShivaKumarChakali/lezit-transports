import mongoose, { Document, Schema } from 'mongoose';
import { IBill } from '../types';

export interface IBillDocument extends Omit<IBill, '_id'>, Document {}

const billItemSchema = new Schema({
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

const billSchema = new Schema<IBillDocument>({
  billNumber: {
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
  purchaseOrderId: {
    type: Schema.Types.ObjectId,
    ref: 'PurchaseOrder',
    required: true
  } as any,
  providerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  } as any,
  items: [billItemSchema],
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
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  advancePaid: {
    type: Number,
    default: 0,
    min: 0
  },
  balanceDue: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
    default: 'draft'
  },
  dueDate: {
    type: Date,
    required: true
  },
  paidAt: {
    type: Date
  },
  sentAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
billSchema.index({ bookingId: 1 });
billSchema.index({ orderId: 1 });
billSchema.index({ billNumber: 1 }, { unique: true });
billSchema.index({ purchaseOrderId: 1 });
billSchema.index({ providerId: 1 });
billSchema.index({ status: 1 });
billSchema.index({ dueDate: 1 });

export default mongoose.model<IBillDocument>('Bill', billSchema);

