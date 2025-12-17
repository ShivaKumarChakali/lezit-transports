import mongoose, { Document, Schema } from 'mongoose';
import { IFinancialTransaction } from '../types';

export interface IFinancialTransactionDocument extends Omit<IFinancialTransaction, '_id'>, Document {}

const financialTransactionSchema = new Schema<IFinancialTransactionDocument>({
  transactionNumber: {
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
  transactionType: {
    type: String,
    enum: ['customer_advance', 'customer_balance', 'customer_refund', 'provider_advance', 'provider_balance', 'provider_refund'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'upi', 'card', 'cheque', 'other'],
    required: true
  },
  paymentReference: {
    type: String
  },
  receiptNumber: {
    type: String
  },
  receiptUrl: {
    type: String
  },
  description: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  } as any
}, {
  timestamps: true
});

// Indexes
financialTransactionSchema.index({ bookingId: 1 });
financialTransactionSchema.index({ orderId: 1 });
financialTransactionSchema.index({ transactionNumber: 1 }, { unique: true });
financialTransactionSchema.index({ transactionType: 1 });
financialTransactionSchema.index({ status: 1 });
financialTransactionSchema.index({ transactionDate: -1 });

export default mongoose.model<IFinancialTransactionDocument>('FinancialTransaction', financialTransactionSchema);

