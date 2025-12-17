import express from 'express';
import { body } from 'express-validator';
import {
  recordCustomerAdvance,
  recordProviderAdvance,
  recordCustomerBalance,
  recordProviderBalance,
  getTransactionsByBooking,
  getTransactionById,
  getAllTransactions
} from '../controllers/financialTransactionController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// Validation middleware
const transactionValidation = [
  body('bookingId').notEmpty().withMessage('Booking ID is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('paymentMethod')
    .isIn(['cash', 'bank_transfer', 'upi', 'card', 'cheque', 'other'])
    .withMessage('Invalid payment method'),
  body('paymentReference').optional().isString(),
  body('receiptUrl').optional().isURL().withMessage('Receipt URL must be a valid URL'),
  body('description').optional().isString().isLength({ max: 500 })
];

// All routes require authentication
router.use(protect);

// Routes
router.post('/customer/advance', authorize('admin'), transactionValidation, recordCustomerAdvance);
router.post('/customer/balance', authorize('admin'), transactionValidation, recordCustomerBalance);
router.post('/provider/advance', authorize('admin'), transactionValidation, recordProviderAdvance);
router.post('/provider/balance', authorize('admin'), transactionValidation, recordProviderBalance);
router.get('/booking/:bookingId', getTransactionsByBooking);
router.get('/all', authorize('admin'), getAllTransactions);
router.get('/:transactionId', getTransactionById);

export default router;

