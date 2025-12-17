import mongoose, { Document, Schema } from 'mongoose';
import { IFeedback } from '../types';

export interface IFeedbackDocument extends Omit<IFeedback, '_id'>, Document {}

const feedbackCategoriesSchema = new Schema({
  service: {
    type: Number,
    min: 1,
    max: 5
  },
  communication: {
    type: Number,
    min: 1,
    max: 5
  },
  punctuality: {
    type: Number,
    min: 1,
    max: 5
  },
  vehicle: {
    type: Number,
    min: 1,
    max: 5
  },
  driver: {
    type: Number,
    min: 1,
    max: 5
  }
}, { _id: false });

const feedbackSchema = new Schema<IFeedbackDocument>({
  bookingId: {
    type: Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  } as any,
  orderId: {
    type: String
  },
  feedbackFrom: {
    type: String,
    enum: ['customer', 'provider'],
    required: true
  },
  feedbackFromId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  } as any,
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  categories: feedbackCategoriesSchema,
  status: {
    type: String,
    enum: ['pending', 'submitted', 'reviewed'],
    default: 'pending'
  },
  submittedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
feedbackSchema.index({ bookingId: 1 });
feedbackSchema.index({ orderId: 1 });
feedbackSchema.index({ feedbackFrom: 1, feedbackFromId: 1 });
feedbackSchema.index({ status: 1 });

// Compound index to ensure one feedback per booking per feedbackFrom
feedbackSchema.index({ bookingId: 1, feedbackFrom: 1, feedbackFromId: 1 }, { unique: true });

export default mongoose.model<IFeedbackDocument>('Feedback', feedbackSchema);

