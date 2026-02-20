import { Request, Response } from 'express';
import Booking from '../models/Booking';
import User from '../models/User';
import { sendBookingConfirmation, sendBookingCancellation } from '../utils/emailService';
import { AuthRequest } from '../types';
import { generateOrderId } from '../utils/idGenerator';
import { createTimelineEntry, getTimelineEntries } from '../utils/timelineHelper';
import Timeline from '../models/Timeline';

// Create a new booking (Order Intake - Step 1)
export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const adminId = req.user?.id || 'system'; // Admin creating order on behalf of customer
    
    // If userId not in token, allow admin to create for customer
    const customerUserId = req.body.userId || userId;
    
    if (!customerUserId && req.user?.role !== 'admin') {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    // Generate unique Order ID
    let orderId = generateOrderId();
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 10) {
      const existing = await Booking.findOne({ orderId });
      if (!existing) {
        isUnique = true;
      } else {
        orderId = generateOrderId();
        attempts++;
      }
    }

    const bookingData = {
      ...req.body,
      userId: customerUserId,
      orderId,
      orderStatus: 'primary', // Step 1: Order received
      status: 'pending', // Legacy status
      sourcePlatform: req.body.sourcePlatform || 'website'
    };

    const booking = await Booking.create(bookingData);

    // Create timeline entry
    await createTimelineEntry({
      bookingId: String(booking._id),
      orderId: booking.orderId,
      action: 'Order Created',
      description: `Order received from ${booking.sourcePlatform || 'website'}. Order ID: ${orderId}`,
      updatedBy: String(adminId),
      updatedByRole: (req.user?.role as any) || 'admin'
    });

    // Send confirmation email (non-blocking)
    try {
      const user = await User.findById(userId);
      const emailToUse = req.body.email || user?.email;

      if (emailToUse) {
        const emailData = {
          bookingId: booking._id,
          userName: user?.name || 'Customer',
          serviceType: booking.serviceType,
          serviceCategory: booking.serviceCategory,
          pickupLocation: booking.pickupLocation,
          dropLocation: booking.dropLocation,
          pickupDate: booking.pickupDate,
          pickupTime: booking.pickupTime,
          vehicleType: booking.vehicleType,
          totalAmount: booking.totalAmount
        };

        setImmediate(() => {
          sendBookingConfirmation(emailData, emailToUse).catch((emailError) => {
            console.error('Failed to send confirmation email:', emailError);
          });
        });
      }
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the booking creation if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });
  } catch (error: any) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: error.message
    });
  }
};

// Get user's bookings with pagination
export const getMyBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const bookings = await Booking.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Booking.countDocuments({ userId });

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalBookings: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error: any) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message
    });
  }
};

// Get booking by ID
export const getBookingById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const bookingId = req.params.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    // Admin can view any booking, others can only view their own
    const query: any = { _id: bookingId };
    if (userRole !== 'admin') {
      query.userId = userId;
    }

    const booking = await Booking.findOne(query)
      .populate('assignedVendor', 'name email phone businessName')
      .populate('assignedDriver', 'name email phone')
      .populate('vehicleId')
      .populate('quotationId')
      .populate('salesOrderId')
      .populate('purchaseOrderId')
      .populate('invoiceId')
      .populate('billId');

    if (!booking) {
      res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
      return;
    }

    // Get timeline if requested
    let timeline: any[] = [];
    if (req.query.includeTimeline === 'true') {
      timeline = await getTimelineEntries(bookingId) as any[];
    }

    res.json({
      success: true,
      data: {
        booking,
        ...(req.query.includeTimeline === 'true' && { timeline })
      }
    });
  } catch (error: any) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking',
      error: error.message
    });
  }
};

// Get booking by Order ID
export const getBookingByOrderId = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orderId = req.params.orderId;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const query: any = { orderId };
    if (userRole !== 'admin') {
      query.userId = userId;
    }

    const booking = await Booking.findOne(query)
      .populate('assignedVendor', 'name email phone businessName')
      .populate('assignedDriver', 'name email phone')
      .populate('vehicleId');

    if (!booking) {
      res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
      return;
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error: any) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking',
      error: error.message
    });
  }
};

// Update booking order details (Step 3: Validate & Maintain Order Details)
export const updateBookingDetails = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bookingId = req.params.id;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
      return;
    }

    // Track changes for timeline
    const previousValues: any = {};
    const newValues: any = {};
    const updates: any = {};

    // Check what changed
    const allowedFields = ['pickupLocation', 'dropLocation', 'pickupDate', 'pickupTime', 'numberOfPersons', 'goodsDescription', 'vehicleType'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined && req.body[field] !== booking.get(field)) {
        previousValues[field] = booking.get(field);
        newValues[field] = req.body[field];
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      res.status(400).json({
        success: false,
        message: 'No changes detected'
      });
      return;
    }

    // Count how many times this order has been updated
    const timelineCount = await Timeline.countDocuments({
      bookingId,
      action: 'Order Details Updated'
    });
    const updateNumber = timelineCount + 1;

    // Update order status to 'updated' if not already beyond that
    if (!['quotation_shared', 'confirmed', 'in_progress', 'pending_payment', 'completed'].includes(booking.orderStatus)) {
      updates.orderStatus = 'updated';
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      updates,
      { new: true }
    );

    // Create timeline entry
    await createTimelineEntry({
      bookingId: String(booking._id),
      orderId: booking.orderId,
      action: updateNumber === 1 ? 'Order Details Updated' : `Order Details Updated (Update ${updateNumber})`,
      description: `Order details updated. Changes: ${Object.keys(newValues).join(', ')}`,
      updatedBy: userId?.toString() || 'system',
      updatedByRole: (userRole as any) || 'admin',
      previousValue: previousValues,
      newValue: newValues
    });

    res.json({
      success: true,
      message: 'Booking details updated successfully',
      data: updatedBooking
    });
  } catch (error: any) {
    console.error('Error updating booking details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking details',
      error: error.message
    });
  }
};

// Update booking status (admin only) - supports both legacy status and orderStatus
export const updateBookingStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bookingId = req.params.id;
    const userId = req.user?.id;
    const { status, orderStatus } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
      return;
    }

    const previousStatus = booking.status;
    const previousOrderStatus = booking.orderStatus;

    const updates: any = {};
    if (status) {
      updates.status = status;
      // Map legacy status to orderStatus if orderStatus not provided
      if (!orderStatus) {
        const statusMap: Record<string, string> = {
          'pending': 'primary',
          'confirmed': 'confirmed',
          'in-progress': 'in_progress',
          'completed': 'completed',
          'cancelled': 'cancelled'
        };
        if (statusMap[status]) {
          updates.orderStatus = statusMap[status];
        }
      }
    }
    if (orderStatus) {
      updates.orderStatus = orderStatus;
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      updates,
      { new: true }
    );

    // Create timeline entry
    if (status || orderStatus) {
      await createTimelineEntry({
        bookingId: String(booking._id),
        orderId: booking.orderId,
        action: 'Order Status Updated',
        description: `Status changed from ${previousOrderStatus || previousStatus} to ${orderStatus || status}`,
        updatedBy: userId?.toString() || 'system',
        updatedByRole: (req.user?.role as any) || 'admin',
        previousValue: { status: previousStatus, orderStatus: previousOrderStatus },
        newValue: { status: updates.status || previousStatus, orderStatus: updates.orderStatus || previousOrderStatus }
      });
    }

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      data: updatedBooking
    });
  } catch (error: any) {
    console.error('Error updating booking status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking status',
      error: error.message
    });
  }
};

// Get booking timeline
export const getBookingTimeline = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bookingId = req.params.id;
    
    const timeline = await getTimelineEntries(bookingId);
    
    res.json({
      success: true,
      data: timeline
    });
  } catch (error: any) {
    console.error('Error fetching timeline:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch timeline',
      error: error.message
    });
  }
};

// Cancel booking
export const cancelBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const bookingId = req.params.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const booking = await Booking.findOne({ _id: bookingId, userId });

    if (!booking) {
      res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
      return;
    }

    if (booking.status === 'cancelled') {
      res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
      return;
    }

    if (booking.status === 'completed') {
      res.status(400).json({
        success: false,
        message: 'Cannot cancel completed booking'
      });
      return;
    }

    booking.status = 'cancelled';
    booking.orderStatus = 'cancelled';
    await booking.save();

    // Create timeline entry
    await createTimelineEntry({
      bookingId: String(booking._id),
      orderId: booking.orderId || undefined,
      action: 'Order Cancelled',
      description: 'Order has been cancelled by customer',
      updatedBy: String(userId),
      updatedByRole: 'user',
      previousValue: { status: booking.status, orderStatus: booking.orderStatus }
    });

    // Send cancellation email
    try {
      const user = await User.findById(userId);
      if (user) {
        const emailData = {
          bookingId: booking._id,
          userName: user.name,
          serviceType: booking.serviceType,
          serviceCategory: booking.serviceCategory
        };

        await sendBookingCancellation(emailData, user.email);
      }
    } catch (emailError) {
      console.error('Failed to send cancellation email:', emailError);
      // Don't fail the cancellation if email fails
    }

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error: any) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking',
      error: error.message
    });
  }
}; 