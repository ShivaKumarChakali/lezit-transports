import mongoose, { Document, Schema } from 'mongoose';
import { IInvoice } from '../types';

export interface IInvoiceDocument extends Omit<IInvoice, '_id'>, Document {}

const invoiceItemSchema = new Schema({
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

const invoiceSchema = new Schema<IInvoiceDocument>({
  invoiceNumber: {
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
    ref: 'SalesOrder',
    required: true
  } as any,
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  } as any,
  items: [invoiceItemSchema],
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
invoiceSchema.index({ bookingId: 1 });
invoiceSchema.index({ orderId: 1 });
invoiceSchema.index({ invoiceNumber: 1 }, { unique: true });
invoiceSchema.index({ salesOrderId: 1 });
invoiceSchema.index({ customerId: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ dueDate: 1 });

export default mongoose.model<IInvoiceDocument>('Invoice', invoiceSchema);

