import express from 'express';
import { body } from 'express-validator';
import {
  createSalesOrder,
  getSalesOrderById,
  getSalesOrdersByBooking,
  updateSalesOrderStatus,
  getAllSalesOrders
} from '../controllers/salesOrderController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// Validation middleware
const createSalesOrderValidation = [
  body('quotationId').notEmpty().withMessage('Quotation ID is required'),
  body('advanceAmount').optional().isFloat({ min: 0 }).withMessage('Advance amount must be a positive number')
];

const updateStatusValidation = [
  body('status')
    .isIn(['draft', 'confirmed', 'in_progress', 'completed', 'cancelled'])
    .withMessage('Invalid status value')
];

// All routes require authentication
router.use(protect);

// Routes
router.post('/', authorize('admin'), createSalesOrderValidation, createSalesOrder);
router.get('/booking/:bookingId', getSalesOrdersByBooking);
router.get('/all', authorize('admin'), getAllSalesOrders);
router.get('/:salesOrderId', getSalesOrderById);
router.put('/:salesOrderId/status', authorize('admin'), updateStatusValidation, updateSalesOrderStatus);

export default router;

