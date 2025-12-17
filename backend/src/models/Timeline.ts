import mongoose, { Document, Schema } from 'mongoose';
import { ITimeline } from '../types';

export interface ITimelineDocument extends Omit<ITimeline, '_id'>, Document {}

const timelineSchema = new Schema<ITimelineDocument>({
  bookingId: {
    type: Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  } as any,
  orderId: {
    type: String
  },
  action: {
    type: String,
    required: [true, 'Action is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  } as any,
  updatedByRole: {
    type: String,
    enum: ['admin', 'user', 'vendor', 'driver', 'system'],
    default: 'system'
  },
  previousValue: {
    type: Schema.Types.Mixed
  },
  newValue: {
    type: Schema.Types.Mixed
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
timelineSchema.index({ bookingId: 1, createdAt: -1 });
timelineSchema.index({ orderId: 1 });
timelineSchema.index({ updatedBy: 1 });

export default mongoose.model<ITimelineDocument>('Timeline', timelineSchema);

