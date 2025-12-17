import { Request, Response } from 'express';
import FinancialTransaction from '../models/FinancialTransaction';
import Booking from '../models/Booking';
import SalesOrder from '../models/SalesOrder';
import PurchaseOrder from '../models/PurchaseOrder';
import { generateTransactionNumber, generateReceiptNumber } from '../utils/idGenerator';
import { createTimelineEntry } from '../utils/timelineHelper';
import { AuthRequest } from '../types';

/**
 * Record Customer Advance Payment (Step 6: Receive Advance)
 */
export const recordCustomerAdvance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId, amount, paymentMethod, paymentReference, receiptUrl, description } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    // Generate transaction number
    const transactionNumber = await generateTransactionNumber(FinancialTransaction);
    const receiptNumber = generateReceiptNumber();

    // Create transaction
    const transaction = await FinancialTransaction.create({
      transactionNumber,
      bookingId: booking._id as any,
      orderId: booking.orderId || undefined,
      transactionType: 'customer_advance',
      amount,
      paymentMethod,
      paymentReference,
      receiptNumber,
      receiptUrl,
      description: description || `Advance payment for booking ${booking.orderId}`,
      status: 'completed',
      transactionDate: new Date(),
      createdBy: userId as any
    });

    // Update booking payment status if advance is received
    if (booking.paymentStatus === 'pending') {
      booking.paymentStatus = 'paid';
      await booking.save();
    }

    // If sales order exists, update advance amount
    if (booking.salesOrderId) {
      const salesOrder = await SalesOrder.findById(booking.salesOrderId);
      if (salesOrder) {
        const currentAdvance = salesOrder.advanceAmount || 0;
        salesOrder.advanceAmount = currentAdvance + amount;
        salesOrder.balanceAmount = Math.max(0, salesOrder.totalAmount - salesOrder.advanceAmount);
        await salesOrder.save();
      }
    }

    // Create timeline entry
    await createTimelineEntry({
      bookingId: String(booking._id),
      orderId: booking.orderId || undefined,
      action: 'Customer Advance Payment Received',
      description: `Advance payment of ₹${amount} received via ${paymentMethod}. Receipt: ${receiptNumber}`,
      updatedBy: String(userId),
      updatedByRole: (req.user?.role as any) || 'admin',
      metadata: { transactionId: String(transaction._id), receiptNumber }
    });

    res.status(201).json({
      success: true,
      message: 'Advance payment recorded successfully',
      data: transaction
    });
  } catch (error: any) {
    console.error('Error recording customer advance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record advance payment',
      error: error.message
    });
  }
};

/**
 * Record Provider Advance Payment (Step 6: Pay Advance to Provider)
 */
export const recordProviderAdvance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId, amount, paymentMethod, paymentReference, receiptUrl, description } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    // Generate transaction number
    const transactionNumber = await generateTransactionNumber(FinancialTransaction);
    const receiptNumber = generateReceiptNumber();

    // Create transaction
    const transaction = await FinancialTransaction.create({
      transactionNumber,
      bookingId: booking._id as any,
      orderId: booking.orderId || undefined,
      transactionType: 'provider_advance',
      amount,
      paymentMethod,
      paymentReference,
      receiptNumber,
      receiptUrl,
      description: description || `Advance payment to provider for booking ${booking.orderId}`,
      status: 'completed',
      transactionDate: new Date(),
      createdBy: userId as any
    });

    // Update purchase order advance amount
    if (booking.purchaseOrderId) {
      const purchaseOrder = await PurchaseOrder.findById(booking.purchaseOrderId);
      if (purchaseOrder) {
        const currentAdvance = purchaseOrder.advanceAmount || 0;
        purchaseOrder.advanceAmount = currentAdvance + amount;
        purchaseOrder.balanceAmount = Math.max(0, purchaseOrder.totalAmount - purchaseOrder.advanceAmount);
        await purchaseOrder.save();
      }
    }

    // Create timeline entry
    await createTimelineEntry({
      bookingId: String(booking._id),
      orderId: booking.orderId || undefined,
      action: 'Provider Advance Payment Made',
      description: `Advance payment of ₹${amount} made to provider via ${paymentMethod}. Receipt: ${receiptNumber}`,
      updatedBy: String(userId),
      updatedByRole: (req.user?.role as any) || 'admin',
      metadata: { transactionId: String(transaction._id), receiptNumber }
    });

    res.status(201).json({
      success: true,
      message: 'Provider advance payment recorded successfully',
      data: transaction
    });
  } catch (error: any) {
    console.error('Error recording provider advance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record provider advance payment',
      error: error.message
    });
  }
};

/**
 * Record Customer Balance Payment (Step 14: Close All Dues)
 */
export const recordCustomerBalance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId, amount, paymentMethod, paymentReference, receiptUrl, description } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    // Generate transaction number
    const transactionNumber = await generateTransactionNumber(FinancialTransaction);
    const receiptNumber = generateReceiptNumber();

    // Create transaction
    const transaction = await FinancialTransaction.create({
      transactionNumber,
      bookingId: booking._id as any,
      orderId: booking.orderId || undefined,
      transactionType: 'customer_balance',
      amount,
      paymentMethod,
      paymentReference,
      receiptNumber,
      receiptUrl,
      description: description || `Balance payment for booking ${booking.orderId}`,
      status: 'completed',
      transactionDate: new Date(),
      createdBy: userId as any
    });

    // Update sales order
    if (booking.salesOrderId) {
      const salesOrder = await SalesOrder.findById(booking.salesOrderId);
      if (salesOrder) {
        const currentAdvance = salesOrder.advanceAmount || 0;
        const currentBalance = salesOrder.balanceAmount || salesOrder.totalAmount;
        
        salesOrder.advanceAmount = currentAdvance + amount;
        salesOrder.balanceAmount = Math.max(0, currentBalance - amount);
        
        // If balance is zero, update booking status
        if (salesOrder.balanceAmount === 0) {
          booking.orderStatus = 'completed';
          booking.status = 'completed';
        }
        
        await salesOrder.save();
      }
    }

    await booking.save();

    // Create timeline entry
    await createTimelineEntry({
      bookingId: String(booking._id),
      orderId: booking.orderId || undefined,
      action: 'Customer Balance Payment Received',
      description: `Balance payment of ₹${amount} received via ${paymentMethod}. Receipt: ${receiptNumber}`,
      updatedBy: String(userId),
      updatedByRole: (req.user?.role as any) || 'admin',
      metadata: { transactionId: String(transaction._id), receiptNumber }
    });

    res.status(201).json({
      success: true,
      message: 'Balance payment recorded successfully',
      data: transaction
    });
  } catch (error: any) {
    console.error('Error recording customer balance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record balance payment',
      error: error.message
    });
  }
};

/**
 * Record Provider Balance Payment (Step 14: Pay Dues to Provider)
 */
export const recordProviderBalance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId, amount, paymentMethod, paymentReference, receiptUrl, description } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    // Generate transaction number
    const transactionNumber = await generateTransactionNumber(FinancialTransaction);
    const receiptNumber = generateReceiptNumber();

    // Create transaction
    const transaction = await FinancialTransaction.create({
      transactionNumber,
      bookingId: booking._id as any,
      orderId: booking.orderId || undefined,
      transactionType: 'provider_balance',
      amount,
      paymentMethod,
      paymentReference,
      receiptNumber,
      receiptUrl,
      description: description || `Balance payment to provider for booking ${booking.orderId}`,
      status: 'completed',
      transactionDate: new Date(),
      createdBy: userId as any
    });

    // Update purchase order
    if (booking.purchaseOrderId) {
      const purchaseOrder = await PurchaseOrder.findById(booking.purchaseOrderId);
      if (purchaseOrder) {
        const currentAdvance = purchaseOrder.advanceAmount || 0;
        const currentBalance = purchaseOrder.balanceAmount || purchaseOrder.totalAmount;
        
        purchaseOrder.advanceAmount = currentAdvance + amount;
        purchaseOrder.balanceAmount = Math.max(0, currentBalance - amount);
        await purchaseOrder.save();
      }
    }

    // Create timeline entry
    await createTimelineEntry({
      bookingId: String(booking._id),
      orderId: booking.orderId || undefined,
      action: 'Provider Balance Payment Made',
      description: `Balance payment of ₹${amount} made to provider via ${paymentMethod}. Receipt: ${receiptNumber}`,
      updatedBy: String(userId),
      updatedByRole: (req.user?.role as any) || 'admin',
      metadata: { transactionId: String(transaction._id), receiptNumber }
    });

    res.status(201).json({
      success: true,
      message: 'Provider balance payment recorded successfully',
      data: transaction
    });
  } catch (error: any) {
    console.error('Error recording provider balance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record provider balance payment',
      error: error.message
    });
  }
};

/**
 * Get transactions by booking ID
 */
export const getTransactionsByBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.params;

    const transactions = await FinancialTransaction.find({ bookingId })
      .populate('createdBy', 'name email role')
      .sort({ transactionDate: -1, createdAt: -1 });

    // Calculate totals
    const totals = transactions.reduce((acc, txn) => {
      if (txn.transactionType.startsWith('customer_')) {
        acc.customerPaid += txn.amount;
      } else if (txn.transactionType.startsWith('provider_')) {
        acc.providerPaid += txn.amount;
      }
      return acc;
    }, { customerPaid: 0, providerPaid: 0 });

    res.json({
      success: true,
      data: {
        transactions,
        totals
      }
    });
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions',
      error: error.message
    });
  }
};

/**
 * Get transaction by ID
 */
export const getTransactionById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { transactionId } = req.params;

    const transaction = await FinancialTransaction.findById(transactionId)
      .populate('createdBy', 'name email role')
      .populate('bookingId');

    if (!transaction) {
      res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
      return;
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error: any) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction',
      error: error.message
    });
  }
};

/**
 * Get all transactions (Admin only)
 */
export const getAllTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;
    const transactionType = req.query.transactionType as string;

    const query: any = {};
    if (transactionType) {
      query.transactionType = transactionType;
    }

    const transactions = await FinancialTransaction.find(query)
      .populate('createdBy', 'name email role')
      .populate('bookingId', 'orderId')
      .sort({ transactionDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await FinancialTransaction.countDocuments(query);

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalTransactions: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions',
      error: error.message
    });
  }
};

