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
    .isIn(['person', 'goods'])
    .withMessage('Service type must be either person or goods'),
  body('serviceCategory')
    .notEmpty()
    .withMessage('Service category is required'),
  body('pickupLocation')
    .notEmpty()
    .withMessage('Pickup location is required'),
  body('dropLocation')
    .notEmpty()
    .withMessage('Drop location is required'),
  body('pickupDate')
    .isISO8601()
    .withMessage('Pickup date must be a valid date'),
  body('pickupTime')
    .notEmpty()
    .withMessage('Pickup time is required'),
  body('totalAmount')
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
    .isIn(['primary', 'updated', 'quotation_shared', 'confirmed', 'in_progress', 'pending_payment', 'completed', 'pending_feedback', 'cancelled'])
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