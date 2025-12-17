import { Request, Response } from 'express';
import PurchaseOrder from '../models/PurchaseOrder';
import Booking from '../models/Booking';
import SalesOrder from '../models/SalesOrder';
import { generatePurchaseOrderNumber } from '../utils/idGenerator';
import { createTimelineEntry } from '../utils/timelineHelper';
import { AuthRequest } from '../types';

/**
 * Create Purchase Order for Service Provider (Step 9: Create Purchase Order to Service Provider)
 */
export const createPurchaseOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { salesOrderId, providerId, items, subtotal, taxes, totalAmount, advanceAmount } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    // Find and validate sales order
    const salesOrder = await SalesOrder.findById(salesOrderId);
    if (!salesOrder) {
      res.status(404).json({ success: false, message: 'Sales order not found' });
      return;
    }

    // Check if PO already exists for this SO
    const existingPO = await PurchaseOrder.findOne({ salesOrderId });
    if (existingPO) {
      res.status(400).json({
        success: false,
        message: 'Purchase order already exists for this sales order',
        data: existingPO
      });
      return;
    }

    // Find booking
    const booking = await Booking.findById(salesOrder.bookingId);
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    // Generate Purchase Order number
    const purchaseOrderNumber = await generatePurchaseOrderNumber(PurchaseOrder);

    // Calculate amounts
    const advance = advanceAmount || 0;
    const balance = totalAmount - advance;

    // Create Purchase Order
    const purchaseOrder = await PurchaseOrder.create({
      purchaseOrderNumber,
      bookingId: booking._id,
      orderId: booking.orderId,
      salesOrderId: salesOrder._id,
      providerId: providerId || booking.assignedVendor,
      items: items || salesOrder.items,
      subtotal: subtotal || salesOrder.subtotal,
      taxes: taxes || 0,
      totalAmount: totalAmount || salesOrder.totalAmount,
      advanceAmount: advance,
      balanceAmount: balance,
      status: 'sent'
    });

    // Update booking
    booking.purchaseOrderId = purchaseOrder._id as any;
    await booking.save();

    // Create timeline entry
    await createTimelineEntry({
      bookingId: String(booking._id),
      orderId: booking.orderId || undefined,
      action: 'Purchase Order Created',
      description: `Purchase Order ${purchaseOrderNumber} created for provider. Advance: ₹${advance}, Balance: ₹${balance}`,
      updatedBy: String(userId),
      updatedByRole: (req.user?.role as any) || 'admin'
    });

    res.status(201).json({
      success: true,
      message: 'Purchase order created successfully',
      data: purchaseOrder
    });
  } catch (error: any) {
    console.error('Error creating purchase order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create purchase order',
      error: error.message
    });
  }
};

/**
 * Acknowledge Purchase Order (Provider acknowledges PO)
 */
export const acknowledgePurchaseOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { purchaseOrderId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const purchaseOrder = await PurchaseOrder.findById(purchaseOrderId);
    if (!purchaseOrder) {
      res.status(404).json({ success: false, message: 'Purchase order not found' });
      return;
    }

    // Verify the user is the provider
    if (String(purchaseOrder.providerId) !== String(userId)) {
      res.status(403).json({
        success: false,
        message: 'You are not authorized to acknowledge this purchase order'
      });
      return;
    }

    purchaseOrder.status = 'acknowledged';
    purchaseOrder.acknowledgedAt = new Date();
    await purchaseOrder.save();

    // Get booking for timeline
    const booking = await Booking.findById(purchaseOrder.bookingId);
    if (booking) {
      await createTimelineEntry({
        bookingId: String(booking._id),
        orderId: booking.orderId || undefined,
        action: 'Purchase Order Acknowledged',
        description: `Purchase Order ${purchaseOrder.purchaseOrderNumber} acknowledged by provider`,
        updatedBy: String(userId),
        updatedByRole: 'vendor'
      });
    }

    res.json({
      success: true,
      message: 'Purchase order acknowledged successfully',
      data: purchaseOrder
    });
  } catch (error: any) {
    console.error('Error acknowledging purchase order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to acknowledge purchase order',
      error: error.message
    });
  }
};

/**
 * Get Purchase Order by ID
 */
export const getPurchaseOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { purchaseOrderId } = req.params;

    const purchaseOrder = await PurchaseOrder.findById(purchaseOrderId)
      .populate('providerId', 'name email phone businessName')
      .populate('bookingId')
      .populate('salesOrderId');

    if (!purchaseOrder) {
      res.status(404).json({
        success: false,
        message: 'Purchase order not found'
      });
      return;
    }

    res.json({
      success: true,
      data: purchaseOrder
    });
  } catch (error: any) {
    console.error('Error fetching purchase order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch purchase order',
      error: error.message
    });
  }
};

/**
 * Get Purchase Orders by Booking ID
 */
export const getPurchaseOrdersByBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.params;

    const purchaseOrders = await PurchaseOrder.find({ bookingId })
      .populate('providerId', 'name email businessName')
      .populate('salesOrderId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: purchaseOrders
    });
  } catch (error: any) {
    console.error('Error fetching purchase orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch purchase orders',
      error: error.message
    });
  }
};

/**
 * Get Purchase Orders by Provider (Vendor view)
 */
export const getPurchaseOrdersByProvider = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const purchaseOrders = await PurchaseOrder.find({ providerId: userId })
      .populate('bookingId', 'pickupLocation dropLocation pickupDate')
      .populate('salesOrderId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await PurchaseOrder.countDocuments({ providerId: userId });

    res.json({
      success: true,
      data: {
        purchaseOrders,
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
    console.error('Error fetching purchase orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch purchase orders',
      error: error.message
    });
  }
};

/**
 * Update Purchase Order status (Admin only)
 */
export const updatePurchaseOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { purchaseOrderId } = req.params;
    const { status } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const purchaseOrder = await PurchaseOrder.findById(purchaseOrderId);
    if (!purchaseOrder) {
      res.status(404).json({ success: false, message: 'Purchase order not found' });
      return;
    }

    const previousStatus = purchaseOrder.status;
    purchaseOrder.status = status;
    await purchaseOrder.save();

    // Get booking for timeline
    const booking = await Booking.findById(purchaseOrder.bookingId);
    if (booking) {
      await createTimelineEntry({
        bookingId: String(booking._id),
        orderId: booking.orderId || undefined,
        action: 'Purchase Order Status Updated',
        description: `Purchase Order ${purchaseOrder.purchaseOrderNumber} status changed from ${previousStatus} to ${status}`,
        updatedBy: String(userId),
        updatedByRole: (req.user?.role as any) || 'admin',
        previousValue: { status: previousStatus },
        newValue: { status }
      });
    }

    res.json({
      success: true,
      message: 'Purchase order status updated successfully',
      data: purchaseOrder
    });
  } catch (error: any) {
    console.error('Error updating purchase order status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update purchase order status',
      error: error.message
    });
  }
};

