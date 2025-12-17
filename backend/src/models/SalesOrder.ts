import mongoose, { Document, Schema } from 'mongoose';
import { ISalesOrder } from '../types';

export interface ISalesOrderDocument extends Omit<ISalesOrder, '_id'>, Document {}

const salesOrderItemSchema = new Schema({
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

const salesOrderSchema = new Schema<ISalesOrderDocument>({
  salesOrderNumber: {
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
  quotationId: {
    type: Schema.Types.ObjectId,
    ref: 'Quotation'
  } as any,
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  } as any,
  items: [salesOrderItemSchema],
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
  advanceAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  balanceAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['draft', 'confirmed', 'in_progress', 'completed', 'cancelled'],
    default: 'draft'
  }
}, {
  timestamps: true
});

// Indexes
salesOrderSchema.index({ bookingId: 1 });
salesOrderSchema.index({ orderId: 1 });
salesOrderSchema.index({ salesOrderNumber: 1 }, { unique: true });
salesOrderSchema.index({ customerId: 1 });
salesOrderSchema.index({ quotationId: 1 });
salesOrderSchema.index({ status: 1 });

export default mongoose.model<ISalesOrderDocument>('SalesOrder', salesOrderSchema);

