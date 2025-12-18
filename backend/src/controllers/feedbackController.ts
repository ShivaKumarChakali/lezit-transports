import { Request, Response } from 'express';
import Feedback from '../models/Feedback';
import Booking from '../models/Booking';
import { createTimelineEntry } from '../utils/timelineHelper';
import { AuthRequest } from '../types';

/**
 * Submit Feedback (Step 16: Collect Feedback From Both Customer & Service Provider)
 */
export const submitFeedback = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId, rating, comment, categories } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    // Validate booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    // Determine feedback from (customer or provider)
    let feedbackFrom: 'customer' | 'provider' = 'customer';
    if (userRole === 'vendor' || userRole === 'driver') {
      feedbackFrom = 'provider';
    } else if (String(booking.userId) === String(userId)) {
      feedbackFrom = 'customer';
    } else if (String(booking.assignedVendor) === String(userId) || String(booking.assignedDriver) === String(userId)) {
      feedbackFrom = 'provider';
    }

    // Check if feedback already exists
    const existingFeedback = await Feedback.findOne({
      bookingId,
      feedbackFrom,
      feedbackFromId: userId
    });

    if (existingFeedback) {
      res.status(400).json({
        success: false,
        message: `Feedback already submitted by ${feedbackFrom}`,
        data: existingFeedback
      });
      return;
    }

    // Create feedback
    const feedback = await Feedback.create({
      bookingId: booking._id,
      orderId: booking.orderId,
      feedbackFrom,
      feedbackFromId: userId,
      rating,
      comment,
      categories,
      status: 'submitted',
      submittedAt: new Date()
    });

    // Check if both feedbacks are submitted
    const customerFeedback = await Feedback.findOne({ bookingId, feedbackFrom: 'customer' });
    const providerFeedback = await Feedback.findOne({ bookingId, feedbackFrom: 'provider' });

    // Update booking status
    if (customerFeedback && providerFeedback) {
      booking.orderStatus = 'completed';
      await booking.save();

      await createTimelineEntry({
        bookingId: String(booking._id),
        orderId: booking.orderId || undefined,
        action: 'Order Completed - All Feedback Received',
        description: 'Both customer and provider feedback received. Order marked as completed.',
        updatedBy: String(userId),
        updatedByRole: (userRole as any) || 'user'
      });
    } else {
      booking.orderStatus = 'pending_feedback';
      await booking.save();

      await createTimelineEntry({
        bookingId: String(booking._id),
        orderId: booking.orderId || undefined,
        action: 'Feedback Submitted',
        description: `${feedbackFrom === 'customer' ? 'Customer' : 'Provider'} feedback submitted. Waiting for ${feedbackFrom === 'customer' ? 'provider' : 'customer'} feedback.`,
        updatedBy: String(userId),
        updatedByRole: (userRole as any) || 'user'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: feedback,
      allFeedbackReceived: !!(customerFeedback && providerFeedback)
    });
  } catch (error: any) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback',
      error: error.message
    });
  }
};

/**
 * Get Feedback by Booking ID
 */
export const getFeedbackByBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.params;

    const feedbacks = await Feedback.find({ bookingId })
      .populate('feedbackFromId', 'name email role')
      .sort({ createdAt: -1 });

    const customerFeedback = feedbacks.find(f => f.feedbackFrom === 'customer');
    const providerFeedback = feedbacks.find(f => f.feedbackFrom === 'provider');

    res.json({
      success: true,
      data: {
        feedbacks,
        customerFeedback,
        providerFeedback,
        allFeedbackReceived: !!(customerFeedback && providerFeedback)
      }
    });
  } catch (error: any) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback',
      error: error.message
    });
  }
};

/**
 * Get Feedback by ID
 */
export const getFeedbackById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { feedbackId } = req.params;

    const feedback = await Feedback.findById(feedbackId)
      .populate('feedbackFromId', 'name email role')
      .populate('bookingId');

    if (!feedback) {
      res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
      return;
    }

    res.json({
      success: true,
      data: feedback
    });
  } catch (error: any) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback',
      error: error.message
    });
  }
};

/**
 * Update Feedback (Admin only - for review status)
 */
export const updateFeedbackStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { feedbackId } = req.params;
    const { status } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
      res.status(404).json({ success: false, message: 'Feedback not found' });
      return;
    }

    feedback.status = status;
    await feedback.save();

    res.json({
      success: true,
      message: 'Feedback status updated successfully',
      data: feedback
    });
  } catch (error: any) {
    console.error('Error updating feedback status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update feedback status',
      error: error.message
    });
  }
};

/**
 * Get all Feedback (Admin only)
 */
export const getAllFeedback = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const feedbackFrom = req.query.feedbackFrom as string;

    const query: any = {};
    if (feedbackFrom) {
      query.feedbackFrom = feedbackFrom;
    }

    const feedbacks = await Feedback.find(query)
      .populate('feedbackFromId', 'name email role')
      .populate('bookingId', 'orderId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Feedback.countDocuments(query);

    res.json({
      success: true,
      data: {
        feedbacks,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalFeedback: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error: any) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback',
      error: error.message
    });
  }
};

