import express from 'express';
import { body } from 'express-validator';
import {
  createPurchaseOrder,
  acknowledgePurchaseOrder,
  getPurchaseOrderById,
  getPurchaseOrdersByBooking,
  getPurchaseOrdersByProvider,
  updatePurchaseOrderStatus
} from '../controllers/purchaseOrderController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// Validation middleware
const createPurchaseOrderValidation = [
  body('salesOrderId').notEmpty().withMessage('Sales Order ID is required'),
  body('providerId').notEmpty().withMessage('Provider ID is required'),
  body('totalAmount').isFloat({ min: 0 }).withMessage('Total amount must be a positive number'),
  body('advanceAmount').optional().isFloat({ min: 0 }).withMessage('Advance amount must be a positive number')
];

const updateStatusValidation = [
  body('status')
    .isIn(['draft', 'sent', 'acknowledged', 'in_progress', 'completed', 'cancelled'])
    .withMessage('Invalid status value')
];

// All routes require authentication
router.use(protect);

// Routes
router.post('/', authorize('admin'), createPurchaseOrderValidation, createPurchaseOrder);
router.get('/provider/my-orders', getPurchaseOrdersByProvider); // Vendor's own POs
router.get('/booking/:bookingId', getPurchaseOrdersByBooking);
router.get('/:purchaseOrderId', getPurchaseOrderById);
router.post('/:purchaseOrderId/acknowledge', acknowledgePurchaseOrder); // Vendor can acknowledge
router.put('/:purchaseOrderId/status', authorize('admin'), updateStatusValidation, updatePurchaseOrderStatus);

export default router;

