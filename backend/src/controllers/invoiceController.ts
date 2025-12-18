import { Request, Response } from 'express';
import Invoice from '../models/Invoice';
import Booking from '../models/Booking';
import SalesOrder from '../models/SalesOrder';
import { generateInvoiceNumber } from '../utils/idGenerator';
import { createTimelineEntry } from '../utils/timelineHelper';
import { AuthRequest } from '../types';
import { sendInvoiceEmail } from '../utils/emailService';

/**
 * Generate Invoice from Sales Order (Step 13: Generate Invoice & Bills)
 */
export const generateInvoice = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { salesOrderId, dueDate } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    // Find and validate sales order
    const salesOrder = await SalesOrder.findById(salesOrderId).populate('customerId');
    if (!salesOrder) {
      res.status(404).json({ success: false, message: 'Sales order not found' });
      return;
    }

    // Check if invoice already exists
    const existingInvoice = await Invoice.findOne({ salesOrderId });
    if (existingInvoice) {
      res.status(400).json({
        success: false,
        message: 'Invoice already exists for this sales order',
        data: existingInvoice
      });
      return;
    }

    // Find booking
    const booking = await Booking.findById(salesOrder.bookingId);
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    // Generate Invoice number
    const invoiceNumber = await generateInvoiceNumber(Invoice);

    // Calculate amounts
    const advancePaid = salesOrder.advanceAmount || 0;
    const balanceDue = salesOrder.balanceAmount || salesOrder.totalAmount;

    // Create Invoice
    const invoice = await Invoice.create({
      invoiceNumber,
      bookingId: booking._id,
      orderId: booking.orderId,
      salesOrderId: salesOrder._id,
      customerId: salesOrder.customerId,
      items: salesOrder.items,
      subtotal: salesOrder.subtotal,
      taxes: salesOrder.taxes || 0,
      discount: salesOrder.discount || 0,
      totalAmount: salesOrder.totalAmount,
      advancePaid,
      balanceDue,
      status: 'sent',
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days default
    });

    // Update booking
    booking.invoiceId = invoice._id as any;
    booking.orderStatus = 'pending_payment';
    await booking.save();

    // Create timeline entry
    await createTimelineEntry({
      bookingId: String(booking._id),
      orderId: booking.orderId || undefined,
      action: 'Invoice Generated',
      description: `Invoice ${invoiceNumber} generated for Sales Order ${salesOrder.salesOrderNumber}. Balance Due: ₹${balanceDue}`,
      updatedBy: String(userId),
      updatedByRole: (req.user?.role as any) || 'admin'
    });

    res.status(201).json({
      success: true,
      message: 'Invoice generated successfully',
      data: invoice
    });
  } catch (error: any) {
    console.error('Error generating invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate invoice',
      error: error.message
    });
  }
};

/**
 * Send Invoice to Customer
 */
export const sendInvoice = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { invoiceId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const invoice = await Invoice.findById(invoiceId)
      .populate('customerId', 'name email')
      .populate('bookingId')
      .populate('salesOrderId');

    if (!invoice) {
      res.status(404).json({ success: false, message: 'Invoice not found' });
      return;
    }

    // Update invoice status
    invoice.status = 'sent';
    invoice.sentAt = new Date();
    await invoice.save();

    const customer = invoice.customerId as any;
    const booking = invoice.bookingId as any;

    // Send invoice via email
    try {
      if (customer?.email) {
        await sendInvoiceEmail({
          invoiceNumber: invoice.invoiceNumber,
          customerName: customer.name || 'Customer',
          items: invoice.items,
          subtotal: invoice.subtotal,
          taxes: invoice.taxes || 0,
          discount: invoice.discount || 0,
          totalAmount: invoice.totalAmount,
          advancePaid: invoice.advancePaid || 0,
          balanceDue: invoice.balanceDue || 0,
          dueDate: invoice.dueDate,
          orderId: booking?.orderId
        }, customer.email);
      }
    } catch (emailError) {
      console.error('Failed to send invoice email:', emailError);
      // Continue even if email fails
    }

    // Create timeline entry
    if (booking) {
      await createTimelineEntry({
        bookingId: String(booking._id),
        orderId: booking.orderId || undefined,
        action: 'Invoice Sent',
        description: `Invoice ${invoice.invoiceNumber} sent to customer via email`,
        updatedBy: String(userId),
        updatedByRole: (req.user?.role as any) || 'admin'
      });
    }

    res.json({
      success: true,
      message: 'Invoice sent successfully',
      data: invoice
    });
  } catch (error: any) {
    console.error('Error sending invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send invoice',
      error: error.message
    });
  }
};

/**
 * Mark Invoice as Paid
 */
export const markInvoicePaid = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { invoiceId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const invoice = await Invoice.findById(invoiceId).populate('bookingId');
    if (!invoice) {
      res.status(404).json({ success: false, message: 'Invoice not found' });
      return;
    }

    invoice.status = 'paid';
    invoice.paidAt = new Date();
    await invoice.save();

    const booking = invoice.bookingId as any;

    // Update booking status
    if (booking && invoice.balanceDue === 0) {
      booking.orderStatus = 'completed';
      booking.status = 'completed';
      booking.paymentStatus = 'paid';
      await booking.save();
    }

    // Create timeline entry
    if (booking) {
      await createTimelineEntry({
        bookingId: String(booking._id),
        orderId: booking.orderId || undefined,
        action: 'Invoice Paid',
        description: `Invoice ${invoice.invoiceNumber} marked as paid`,
        updatedBy: String(userId),
        updatedByRole: (req.user?.role as any) || 'admin'
      });
    }

    res.json({
      success: true,
      message: 'Invoice marked as paid',
      data: invoice
    });
  } catch (error: any) {
    console.error('Error marking invoice as paid:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark invoice as paid',
      error: error.message
    });
  }
};

/**
 * Get Invoice by ID
 */
export const getInvoiceById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { invoiceId } = req.params;

    const invoice = await Invoice.findById(invoiceId)
      .populate('customerId', 'name email phone')
      .populate('bookingId')
      .populate('salesOrderId');

    if (!invoice) {
      res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
      return;
    }

    res.json({
      success: true,
      data: invoice
    });
  } catch (error: any) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoice',
      error: error.message
    });
  }
};

/**
 * Get Invoices by Booking ID
 */
export const getInvoicesByBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.params;

    const invoices = await Invoice.find({ bookingId })
      .populate('customerId', 'name email')
      .populate('salesOrderId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: invoices
    });
  } catch (error: any) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoices',
      error: error.message
    });
  }
};

/**
 * Get all Invoices (Admin only)
 */
export const getAllInvoices = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status as string;

    const query: any = {};
    if (status) {
      query.status = status;
    }

    const invoices = await Invoice.find(query)
      .populate('customerId', 'name email phone')
      .populate('bookingId', 'orderId pickupLocation dropLocation')
      .populate('salesOrderId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Invoice.countDocuments(query);

    res.json({
      success: true,
      data: {
        invoices,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalInvoices: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error: any) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoices',
      error: error.message
    });
  }
};

