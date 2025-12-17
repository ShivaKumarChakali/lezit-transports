import { Request, Response } from 'express';
import Quotation from '../models/Quotation';
import Booking from '../models/Booking';
import User from '../models/User';
import { generateQuotationNumber } from '../utils/idGenerator';
import { createTimelineEntry } from '../utils/timelineHelper';
import { AuthRequest } from '../types';
import { sendQuotationEmail } from '../utils/emailService';

/**
 * Create a new quotation (Step 5: Make a Reasonable Quotation)
 */
export const createQuotation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId, providerId, items, subtotal, taxes, discount, totalAmount, termsAndConditions, validUntil } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    // Find booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    // Generate quotation number
    const quotationNumber = await generateQuotationNumber(Quotation);

    // Calculate totals
    const calculatedTotal = (subtotal || 0) + (taxes || 0) - (discount || 0);

    // Create quotation
    const quotation = await Quotation.create({
      quotationNumber,
      bookingId,
      orderId: booking.orderId,
      customerId: booking.userId,
      providerId: providerId || booking.assignedVendor,
      items: items || [],
      subtotal: subtotal || 0,
      taxes: taxes || 0,
      discount: discount || 0,
      totalAmount: totalAmount || calculatedTotal,
      termsAndConditions,
      validUntil: validUntil ? new Date(validUntil) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days default
      status: 'draft'
    });

    // Update booking with quotation ID
    booking.quotationId = quotation._id as any;
    await booking.save();

    // Create timeline entry
    await createTimelineEntry({
      bookingId: String(booking._id),
      orderId: booking.orderId || undefined,
      action: 'Quotation Created',
      description: `Quotation ${quotationNumber} created for amount ₹${quotation.totalAmount}`,
      updatedBy: String(userId),
      updatedByRole: (req.user?.role as any) || 'admin'
    });

    res.status(201).json({
      success: true,
      message: 'Quotation created successfully',
      data: quotation
    });
  } catch (error: any) {
    console.error('Error creating quotation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create quotation',
      error: error.message
    });
  }
};

/**
 * Share quotation with customer (Step 5: Send quotation through all channels)
 */
export const shareQuotation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { quotationId } = req.params;
    const { channels } = req.body; // ['email', 'whatsapp', 'sms']
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const quotation = await Quotation.findById(quotationId)
      .populate('customerId', 'name email phone');

    if (!quotation) {
      res.status(404).json({ success: false, message: 'Quotation not found' });
      return;
    }

    // Fetch the booking separately
    const booking = await Booking.findById(quotation.bookingId);
    
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found for this quotation' });
      return;
    }

    // Update quotation status
    quotation.status = 'sent';
    quotation.sentAt = new Date();
    await quotation.save();

    // Update booking status
    if (booking.orderStatus === 'updated' || booking.orderStatus === 'primary') {
      booking.orderStatus = 'quotation_shared';
      await booking.save();
    }

    // Send via email if requested
    if (!channels || channels.includes('email')) {
      try {
        const customer = await User.findById(quotation.customerId);
        const emailToUse = customer?.email || booking.email;
        
        if (emailToUse) {
          await sendQuotationEmail({
            quotationNumber: quotation.quotationNumber,
            customerName: customer?.name || 'Customer',
            items: quotation.items,
            subtotal: quotation.subtotal,
            taxes: quotation.taxes || 0,
            discount: quotation.discount || 0,
            totalAmount: quotation.totalAmount,
            termsAndConditions: quotation.termsAndConditions || '',
            validUntil: quotation.validUntil,
            bookingId: String(booking._id),
            orderId: booking.orderId || undefined
          }, emailToUse);
        }
      } catch (emailError) {
        console.error('Failed to send quotation email:', emailError);
      }
    }

    // TODO: Send via WhatsApp if requested
    // TODO: Send via SMS if requested

    // Create timeline entry
    await createTimelineEntry({
      bookingId: String(booking._id),
      orderId: booking.orderId || undefined,
      action: 'Quotation Shared',
      description: `Quotation ${quotation.quotationNumber} shared via ${(channels || ['email']).join(', ')}`,
      updatedBy: String(userId),
      updatedByRole: (req.user?.role as any) || 'admin'
    });

    res.json({
      success: true,
      message: 'Quotation shared successfully',
      data: quotation
    });
  } catch (error: any) {
    console.error('Error sharing quotation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to share quotation',
      error: error.message
    });
  }
};

/**
 * Approve quotation (Step 5: Customer accepts quotation)
 */
export const approveQuotation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { quotationId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const quotation = await Quotation.findById(quotationId);

    if (!quotation) {
      res.status(404).json({ success: false, message: 'Quotation not found' });
      return;
    }

    if (quotation.status !== 'sent') {
      res.status(400).json({
        success: false,
        message: `Cannot approve quotation with status: ${quotation.status}`
      });
      return;
    }

    if (new Date(quotation.validUntil) < new Date()) {
      res.status(400).json({
        success: false,
        message: 'Quotation has expired'
      });
      return;
    }

    // Fetch the booking
    const Booking = (await import('../models/Booking')).default;
    const booking = await Booking.findById(quotation.bookingId);
    
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found for this quotation' });
      return;
    }

    // Update quotation
    quotation.status = 'approved';
    quotation.approvedAt = new Date();
    quotation.approvedBy = userId as any;
    await quotation.save();

    // Update booking status
    booking.orderStatus = 'confirmed';
    booking.status = 'confirmed';
    await booking.save();

    // Create timeline entry
    await createTimelineEntry({
      bookingId: String(booking._id),
      orderId: booking.orderId || undefined,
      action: 'Quotation Approved',
      description: `Quotation ${quotation.quotationNumber} approved by customer`,
      updatedBy: String(userId),
      updatedByRole: (req.user?.role as any) || 'user',
      previousValue: { quotationStatus: 'sent', orderStatus: booking.orderStatus },
      newValue: { quotationStatus: 'approved', orderStatus: 'confirmed' }
    });

    res.json({
      success: true,
      message: 'Quotation approved successfully',
      data: quotation
    });
  } catch (error: any) {
    console.error('Error approving quotation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve quotation',
      error: error.message
    });
  }
};

/**
 * Reject quotation
 */
export const rejectQuotation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { quotationId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const quotation = await Quotation.findById(quotationId);

    if (!quotation) {
      res.status(404).json({ success: false, message: 'Quotation not found' });
      return;
    }

    // Fetch the booking
    const Booking = (await import('../models/Booking')).default;
    const booking = await Booking.findById(quotation.bookingId);
    
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found for this quotation' });
      return;
    }

    quotation.status = 'rejected';
    await quotation.save();

    // Create timeline entry
    await createTimelineEntry({
      bookingId: String(booking._id),
      orderId: booking.orderId || undefined,
      action: 'Quotation Rejected',
      description: `Quotation ${quotation.quotationNumber} rejected by customer`,
      updatedBy: String(userId),
      updatedByRole: (req.user?.role as any) || 'user'
    });

    res.json({
      success: true,
      message: 'Quotation rejected',
      data: quotation
    });
  } catch (error: any) {
    console.error('Error rejecting quotation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject quotation',
      error: error.message
    });
  }
};

/**
 * Get quotation by ID
 */
export const getQuotationById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { quotationId } = req.params;

    const quotation = await Quotation.findById(quotationId)
      .populate('customerId', 'name email phone')
      .populate('providerId', 'name email phone businessName')
      .populate('bookingId');

    if (!quotation) {
      res.status(404).json({
        success: false,
        message: 'Quotation not found'
      });
      return;
    }

    res.json({
      success: true,
      data: quotation
    });
  } catch (error: any) {
    console.error('Error fetching quotation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quotation',
      error: error.message
    });
  }
};

/**
 * Get quotations by booking ID
 */
export const getQuotationsByBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.params;

    const quotations = await Quotation.find({ bookingId })
      .populate('customerId', 'name email')
      .populate('providerId', 'name email businessName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: quotations
    });
  } catch (error: any) {
    console.error('Error fetching quotations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quotations',
      error: error.message
    });
  }
};

