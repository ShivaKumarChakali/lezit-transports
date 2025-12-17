/**
 * Utility functions for managing timeline/activity logs
 */

import Timeline from '../models/Timeline';

interface CreateTimelineEntryParams {
  bookingId: string;
  orderId?: string;
  action: string;
  description: string;
  updatedBy: string;
  updatedByRole?: 'admin' | 'user' | 'vendor' | 'driver' | 'system';
  previousValue?: any;
  newValue?: any;
  metadata?: Record<string, any>;
}

/**
 * Create a timeline entry for booking activities
 */
export const createTimelineEntry = async (params: CreateTimelineEntryParams): Promise<void> => {
  try {
    await Timeline.create({
      bookingId: params.bookingId,
      orderId: params.orderId,
      action: params.action,
      description: params.description,
      updatedBy: params.updatedBy,
      updatedByRole: params.updatedByRole || 'system',
      previousValue: params.previousValue,
      newValue: params.newValue,
      metadata: params.metadata || {}
    });
  } catch (error) {
    console.error('Error creating timeline entry:', error);
    // Don't throw error - timeline is non-critical
  }
};

/**
 * Get timeline entries for a booking
 */
export const getTimelineEntries = async (bookingId: string) => {
  return await Timeline.find({ bookingId })
    .sort({ createdAt: -1 })
    .populate('updatedBy', 'name email role');
};

