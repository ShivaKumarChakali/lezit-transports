import express from 'express';
import { body } from 'express-validator';
import {
  generateBill,
  sendBill,
  markBillPaid,
  getBillById,
  getBillsByBooking,
  getBillsByProvider
} from '../controllers/billController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// Validation middleware
const generateBillValidation = [
  body('purchaseOrderId').notEmpty().withMessage('Purchase Order ID is required'),
  body('dueDate').optional().isISO8601().withMessage('Due date must be a valid date')
];

// All routes require authentication
router.use(protect);

// Routes
router.post('/', authorize('admin'), generateBillValidation, generateBill);
router.get('/provider/my-bills', getBillsByProvider); // Vendor's own bills
router.get('/booking/:bookingId', getBillsByBooking);
router.get('/:billId', getBillById);
router.post('/:billId/send', authorize('admin'), sendBill);
router.put('/:billId/paid', authorize('admin'), markBillPaid);

export default router;

