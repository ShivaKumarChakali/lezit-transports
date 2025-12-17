import mongoose, { Document, Schema } from 'mongoose';
import { IPurchaseOrder } from '../types';

export interface IPurchaseOrderDocument extends Omit<IPurchaseOrder, '_id'>, Document {}

const purchaseOrderItemSchema = new Schema({
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

const purchaseOrderSchema = new Schema<IPurchaseOrderDocument>({
  purchaseOrderNumber: {
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
  salesOrderId: {
    type: Schema.Types.ObjectId,
    ref: 'SalesOrder'
  } as any,
  providerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  } as any,
  items: [purchaseOrderItemSchema],
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
    enum: ['draft', 'sent', 'acknowledged', 'in_progress', 'completed', 'cancelled'],
    default: 'draft'
  },
  acknowledgedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
purchaseOrderSchema.index({ bookingId: 1 });
purchaseOrderSchema.index({ orderId: 1 });
purchaseOrderSchema.index({ purchaseOrderNumber: 1 }, { unique: true });
purchaseOrderSchema.index({ providerId: 1 });
purchaseOrderSchema.index({ salesOrderId: 1 });
purchaseOrderSchema.index({ status: 1 });

export default mongoose.model<IPurchaseOrderDocument>('PurchaseOrder', purchaseOrderSchema);

