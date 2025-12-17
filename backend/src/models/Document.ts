import mongoose, { Document, Schema } from 'mongoose';
import { IDocument } from '../types';

export interface IDocumentDocument extends Omit<IDocument, '_id'>, Document {}

const documentSchema = new Schema<IDocumentDocument>({
  bookingId: {
    type: Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  } as any,
  orderId: {
    type: String
  },
  documentType: {
    type: String,
    enum: ['receipt', 'acknowledgement', 'slip', 'invoice', 'bill', 'quotation', 'sales_order', 'purchase_order', 'other'],
    required: true
  },
  documentName: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number
  },
  mimeType: {
    type: String
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  } as any,
  description: {
    type: String
  },
  isPhysicalCopy: {
    type: Boolean,
    default: false
  },
  physicalCopyLocation: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes
documentSchema.index({ bookingId: 1 });
documentSchema.index({ orderId: 1 });
documentSchema.index({ documentType: 1 });
documentSchema.index({ uploadedBy: 1 });

export default mongoose.model<IDocumentDocument>('Document', documentSchema);

