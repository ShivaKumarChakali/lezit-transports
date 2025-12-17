import express from 'express';
import { body } from 'express-validator';
import {
  createQuotation,
  shareQuotation,
  approveQuotation,
  rejectQuotation,
  getQuotationById,
  getQuotationsByBooking
} from '../controllers/quotationController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// Validation middleware
const createQuotationValidation = [
  body('bookingId').notEmpty().withMessage('Booking ID is required'),
  body('items').isArray().withMessage('Items must be an array'),
  body('subtotal').isFloat({ min: 0 }).withMessage('Subtotal must be a positive number'),
  body('totalAmount').isFloat({ min: 0 }).withMessage('Total amount must be a positive number'),
  body('validUntil').optional().isISO8601().withMessage('Valid until must be a valid date')
];

// All routes require authentication
router.use(protect);

// Routes
router.post('/', authorize('admin'), createQuotationValidation, createQuotation);
router.get('/booking/:bookingId', getQuotationsByBooking);
router.get('/:quotationId', getQuotationById);
router.post('/:quotationId/share', authorize('admin'), shareQuotation);
router.post('/:quotationId/approve', approveQuotation); // Customer can approve
router.post('/:quotationId/reject', rejectQuotation); // Customer can reject

export default router;

