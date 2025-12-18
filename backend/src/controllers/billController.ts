import { Request, Response } from 'express';
import Bill from '../models/Bill';
import Booking from '../models/Booking';
import PurchaseOrder from '../models/PurchaseOrder';
import { generateBillNumber } from '../utils/idGenerator';
import { createTimelineEntry } from '../utils/timelineHelper';
import { AuthRequest } from '../types';
import { sendBillEmail } from '../utils/emailService';

/**
 * Generate Bill from Purchase Order (Step 13: Generate Invoice & Bills)
 */
export const generateBill = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { purchaseOrderId, dueDate } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    // Find and validate purchase order
    const purchaseOrder = await PurchaseOrder.findById(purchaseOrderId).populate('providerId');
    if (!purchaseOrder) {
      res.status(404).json({ success: false, message: 'Purchase order not found' });
      return;
    }

    // Check if bill already exists
    const existingBill = await Bill.findOne({ purchaseOrderId });
    if (existingBill) {
      res.status(400).json({
        success: false,
        message: 'Bill already exists for this purchase order',
        data: existingBill
      });
      return;
    }

    // Find booking
    const booking = await Booking.findById(purchaseOrder.bookingId);
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    // Generate Bill number
    const billNumber = await generateBillNumber(Bill);

    // Calculate amounts
    const advancePaid = purchaseOrder.advanceAmount || 0;
    const balanceDue = purchaseOrder.balanceAmount || purchaseOrder.totalAmount;

    // Create Bill
    const bill = await Bill.create({
      billNumber,
      bookingId: booking._id,
      orderId: booking.orderId,
      purchaseOrderId: purchaseOrder._id,
      providerId: purchaseOrder.providerId,
      items: purchaseOrder.items,
      subtotal: purchaseOrder.subtotal,
      taxes: purchaseOrder.taxes || 0,
      totalAmount: purchaseOrder.totalAmount,
      advancePaid,
      balanceDue,
      status: 'sent',
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days default
    });

    // Update booking
    booking.billId = bill._id as any;
    await booking.save();

    // Create timeline entry
    await createTimelineEntry({
      bookingId: String(booking._id),
      orderId: booking.orderId || undefined,
      action: 'Bill Generated',
      description: `Bill ${billNumber} generated for Purchase Order ${purchaseOrder.purchaseOrderNumber}. Balance Due: ₹${balanceDue}`,
      updatedBy: String(userId),
      updatedByRole: (req.user?.role as any) || 'admin'
    });

    res.status(201).json({
      success: true,
      message: 'Bill generated successfully',
      data: bill
    });
  } catch (error: any) {
    console.error('Error generating bill:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate bill',
      error: error.message
    });
  }
};

/**
 * Send Bill to Provider
 */
export const sendBill = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { billId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const bill = await Bill.findById(billId)
      .populate('providerId', 'name email phone businessName')
      .populate('bookingId')
      .populate('purchaseOrderId');

    if (!bill) {
      res.status(404).json({ success: false, message: 'Bill not found' });
      return;
    }

    // Update bill status
    bill.status = 'sent';
    bill.sentAt = new Date();
    await bill.save();

    const provider = bill.providerId as any;
    const booking = bill.bookingId as any;

    // Send bill via email
    try {
      if (provider?.email) {
        await sendBillEmail({
          billNumber: bill.billNumber,
          providerName: provider.businessName || provider.name || 'Provider',
          items: bill.items,
          subtotal: bill.subtotal,
          taxes: bill.taxes || 0,
          totalAmount: bill.totalAmount,
          advancePaid: bill.advancePaid || 0,
          balanceDue: bill.balanceDue || 0,
          dueDate: bill.dueDate,
          orderId: booking?.orderId
        }, provider.email);
      }
    } catch (emailError) {
      console.error('Failed to send bill email:', emailError);
      // Continue even if email fails
    }

    // Create timeline entry
    if (booking) {
      await createTimelineEntry({
        bookingId: String(booking._id),
        orderId: booking.orderId || undefined,
        action: 'Bill Sent',
        description: `Bill ${bill.billNumber} sent to provider via email`,
        updatedBy: String(userId),
        updatedByRole: (req.user?.role as any) || 'admin'
      });
    }

    res.json({
      success: true,
      message: 'Bill sent successfully',
      data: bill
    });
  } catch (error: any) {
    console.error('Error sending bill:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send bill',
      error: error.message
    });
  }
};

/**
 * Mark Bill as Paid
 */
export const markBillPaid = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { billId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const bill = await Bill.findById(billId).populate('bookingId');
    if (!bill) {
      res.status(404).json({ success: false, message: 'Bill not found' });
      return;
    }

    bill.status = 'paid';
    bill.paidAt = new Date();
    await bill.save();

    // Create timeline entry
    const booking = bill.bookingId as any;
    if (booking) {
      await createTimelineEntry({
        bookingId: String(booking._id),
        orderId: booking.orderId || undefined,
        action: 'Bill Paid',
        description: `Bill ${bill.billNumber} marked as paid`,
        updatedBy: String(userId),
        updatedByRole: (req.user?.role as any) || 'admin'
      });
    }

    res.json({
      success: true,
      message: 'Bill marked as paid',
      data: bill
    });
  } catch (error: any) {
    console.error('Error marking bill as paid:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark bill as paid',
      error: error.message
    });
  }
};

/**
 * Get Bill by ID
 */
export const getBillById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { billId } = req.params;

    const bill = await Bill.findById(billId)
      .populate('providerId', 'name email phone businessName')
      .populate('bookingId')
      .populate('purchaseOrderId');

    if (!bill) {
      res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
      return;
    }

    res.json({
      success: true,
      data: bill
    });
  } catch (error: any) {
    console.error('Error fetching bill:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bill',
      error: error.message
    });
  }
};

/**
 * Get Bills by Booking ID
 */
export const getBillsByBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.params;

    const bills = await Bill.find({ bookingId })
      .populate('providerId', 'name email businessName')
      .populate('purchaseOrderId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: bills
    });
  } catch (error: any) {
    console.error('Error fetching bills:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bills',
      error: error.message
    });
  }
};

/**
 * Get Bills by Provider (Vendor view)
 */
export const getBillsByProvider = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const bills = await Bill.find({ providerId: userId })
      .populate('bookingId', 'orderId pickupLocation dropLocation')
      .populate('purchaseOrderId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Bill.countDocuments({ providerId: userId });

    res.json({
      success: true,
      data: {
        bills,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalBills: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error: any) {
    console.error('Error fetching bills:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bills',
      error: error.message
    });
  }
};

