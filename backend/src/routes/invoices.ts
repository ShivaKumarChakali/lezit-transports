import express from 'express';
import { body } from 'express-validator';
import {
  generateInvoice,
  sendInvoice,
  markInvoicePaid,
  getInvoiceById,
  getInvoicesByBooking,
  getAllInvoices
} from '../controllers/invoiceController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// Validation middleware
const generateInvoiceValidation = [
  body('salesOrderId').notEmpty().withMessage('Sales Order ID is required'),
  body('dueDate').optional().isISO8601().withMessage('Due date must be a valid date')
];

// All routes require authentication
router.use(protect);

// Routes
router.post('/', authorize('admin'), generateInvoiceValidation, generateInvoice);
router.get('/booking/:bookingId', getInvoicesByBooking);
router.get('/all', authorize('admin'), getAllInvoices);
router.get('/:invoiceId', getInvoiceById);
router.post('/:invoiceId/send', authorize('admin'), sendInvoice);
router.put('/:invoiceId/paid', authorize('admin'), markInvoicePaid);

export default router;

