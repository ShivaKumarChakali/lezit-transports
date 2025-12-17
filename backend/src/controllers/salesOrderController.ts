import { Request, Response } from 'express';
import SalesOrder from '../models/SalesOrder';
import Booking from '../models/Booking';
import Quotation from '../models/Quotation';
import { generateSalesOrderNumber } from '../utils/idGenerator';
import { createTimelineEntry } from '../utils/timelineHelper';
import { AuthRequest } from '../types';

/**
 * Convert approved quotation to Sales Order (Step 8: Convert Quotation Into Sales Order)
 */
export const createSalesOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { quotationId, advanceAmount } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    // Find and validate quotation
    const quotation = await Quotation.findById(quotationId);
    if (!quotation) {
      res.status(404).json({ success: false, message: 'Quotation not found' });
      return;
    }

    if (quotation.status !== 'approved') {
      res.status(400).json({
        success: false,
        message: `Cannot create sales order from quotation with status: ${quotation.status}. Quotation must be approved.`
      });
      return;
    }

    // Check if sales order already exists
    const existingSO = await SalesOrder.findOne({ quotationId });
    if (existingSO) {
      res.status(400).json({
        success: false,
        message: 'Sales order already exists for this quotation',
        data: existingSO
      });
      return;
    }

    // Find booking
    const booking = await Booking.findById(quotation.bookingId);
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    // Generate Sales Order number
    const salesOrderNumber = await generateSalesOrderNumber(SalesOrder);

    // Calculate amounts
    const advance = advanceAmount || 0;
    const balance = quotation.totalAmount - advance;

    // Create Sales Order
    const salesOrder = await SalesOrder.create({
      salesOrderNumber,
      bookingId: booking._id,
      orderId: booking.orderId,
      quotationId: quotation._id,
      customerId: quotation.customerId,
      items: quotation.items,
      subtotal: quotation.subtotal,
      taxes: quotation.taxes || 0,
      discount: quotation.discount || 0,
      totalAmount: quotation.totalAmount,
      advanceAmount: advance,
      balanceAmount: balance,
      status: 'confirmed'
    });

    // Update booking
    booking.salesOrderId = salesOrder._id as any;
    booking.orderStatus = 'in_progress';
    booking.status = 'in-progress';
    await booking.save();

    // Create timeline entry
    await createTimelineEntry({
      bookingId: String(booking._id),
      orderId: booking.orderId || undefined,
      action: 'Sales Order Created',
      description: `Sales Order ${salesOrderNumber} created from approved quotation. Advance: ₹${advance}, Balance: ₹${balance}`,
      updatedBy: String(userId),
      updatedByRole: (req.user?.role as any) || 'admin',
      previousValue: { orderStatus: booking.orderStatus, status: booking.status },
      newValue: { orderStatus: 'in_progress', status: 'in-progress' }
    });

    res.status(201).json({
      success: true,
      message: 'Sales order created successfully',
      data: salesOrder
    });
  } catch (error: any) {
    console.error('Error creating sales order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create sales order',
      error: error.message
    });
  }
};

/**
 * Get Sales Order by ID
 */
export const getSalesOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { salesOrderId } = req.params;

    const salesOrder = await SalesOrder.findById(salesOrderId)
      .populate('customerId', 'name email phone')
      .populate('bookingId')
      .populate('quotationId');

    if (!salesOrder) {
      res.status(404).json({
        success: false,
        message: 'Sales order not found'
      });
      return;
    }

    res.json({
      success: true,
      data: salesOrder
    });
  } catch (error: any) {
    console.error('Error fetching sales order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sales order',
      error: error.message
    });
  }
};

/**
 * Get Sales Orders by Booking ID
 */
export const getSalesOrdersByBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.params;

    const salesOrders = await SalesOrder.find({ bookingId })
      .populate('customerId', 'name email')
      .populate('quotationId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: salesOrders
    });
  } catch (error: any) {
    console.error('Error fetching sales orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sales orders',
      error: error.message
    });
  }
};

/**
 * Update Sales Order status
 */
export const updateSalesOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { salesOrderId } = req.params;
    const { status } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const salesOrder = await SalesOrder.findById(salesOrderId);
    if (!salesOrder) {
      res.status(404).json({ success: false, message: 'Sales order not found' });
      return;
    }

    const previousStatus = salesOrder.status;
    salesOrder.status = status;
    await salesOrder.save();

    // Get booking to update timeline
    const booking = await Booking.findById(salesOrder.bookingId);
    if (booking) {
      // Update booking status based on SO status
      if (status === 'completed') {
        booking.orderStatus = 'pending_payment';
        booking.status = 'completed';
        await booking.save();
      }

      // Create timeline entry
      await createTimelineEntry({
        bookingId: String(booking._id),
        orderId: booking.orderId || undefined,
        action: 'Sales Order Status Updated',
        description: `Sales Order ${salesOrder.salesOrderNumber} status changed from ${previousStatus} to ${status}`,
        updatedBy: String(userId),
        updatedByRole: (req.user?.role as any) || 'admin',
        previousValue: { status: previousStatus },
        newValue: { status }
      });
    }

    res.json({
      success: true,
      message: 'Sales order status updated successfully',
      data: salesOrder
    });
  } catch (error: any) {
    console.error('Error updating sales order status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update sales order status',
      error: error.message
    });
  }
};

/**
 * Get all Sales Orders (Admin only)
 */
export const getAllSalesOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status as string;

    const query: any = {};
    if (status) {
      query.status = status;
    }

    const salesOrders = await SalesOrder.find(query)
      .populate('customerId', 'name email phone')
      .populate('bookingId', 'pickupLocation dropLocation pickupDate')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await SalesOrder.countDocuments(query);

    res.json({
      success: true,
      data: {
        salesOrders,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalOrders: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error: any) {
    console.error('Error fetching sales orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sales orders',
      error: error.message
    });
  }
};

