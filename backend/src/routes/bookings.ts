import express from 'express';
import { body } from 'express-validator';
import {
  createBooking,
  getMyBookings,
  getBookingById,
  getBookingByOrderId,
  updateBookingStatus,
  updateBookingDetails,
  getBookingTimeline,
  cancelBooking
} from '../controllers/bookingController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// Validation middleware
const createBookingValidation = [
  body('serviceType')
    .optional({ checkFalsy: true })
    .isIn(['person', 'goods'])
    .withMessage('Service type must be either person or goods'),
  body('serviceCategory')
    .optional({ checkFalsy: true })
    .notEmpty()
    .withMessage('Service category is required'),
  body('pickupLocation')
    .optional({ checkFalsy: true })
    .notEmpty()
    .withMessage('Pickup location is required'),
  body('dropLocation')
    .optional({ checkFalsy: true })
    .notEmpty()
    .withMessage('Drop location is required'),
  body('pickupDate')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Pickup date must be a valid date'),
  body('pickupTime')
    .optional({ checkFalsy: true })
    .notEmpty()
    .withMessage('Pickup time is required'),
  body('totalAmount')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage('Total amount must be a positive number'),
  body('numberOfPersons')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Number of persons must be at least 1'),
  body('goodsDescription')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Goods description cannot exceed 500 characters'),
  body('sourcePlatform')
    .optional()
    .isIn(['phone', 'email', 'whatsapp', 'website', 'facebook', 'instagram', 'linkedin', 'mobile_app', 'direct_office'])
    .withMessage('Invalid source platform')
];

const updateStatusValidation = [
  body('status')
    .optional()
    .isIn(['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'])
    .withMessage('Invalid status value'),
  body('orderStatus')
    .optional()
    .isIn([
      'primary',
      'confirmation_call_pending',
      'details_confirmed',
      'provider_search',
      'updated',
      'not_available',
      'quotation_shared',
      'quoted',
      'advance_received',
      'customer_id_generated',
      'sales_order_created',
      'purchase_order_created',
      'transactions_updated',
      'in_progress_cid',
      'in_progress_so',
      'in_progress_po',
      'in_progress_txn',
      'in_progress_oc',
      'order_completed',
      'invoice_bill_generated',
      'dues_closed',
      'closure_pending',
      'closure_payment_pending',
      'closure_feedback_pending',
      'closure_completed',
      'documented',
      'details_updated_online_offline',
      'confirmed',
      'in_progress',
      'pending_payment',
      'completed',
      'pending_feedback',
      'expired',
      'cancelled'
    ])
    .withMessage('Invalid order status value')
];

// Apply auth middleware to all routes
router.use(protect);

// Routes
router.post('/', createBookingValidation, createBooking);
router.get('/order/:orderId', getBookingByOrderId);
router.get('/:id/timeline', getBookingTimeline);
router.get('/my-bookings', getMyBookings);
router.get('/:id', getBookingById);
router.put('/:id/details', updateBookingDetails);
router.put('/:id/cancel', cancelBooking);

// Admin only routes
router.put('/:id/status', authorize('admin'), updateStatusValidation, updateBookingStatus);

export default router; 