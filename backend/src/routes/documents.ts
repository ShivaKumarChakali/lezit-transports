import express from 'express';
import { body } from 'express-validator';
import {
  uploadDocument,
  getDocumentsByBooking,
  getDocumentById,
  deleteDocument,
  getDocumentFile,
  upload
} from '../controllers/documentController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// Validation middleware
const uploadDocumentValidation = [
  body('bookingId').notEmpty().withMessage('Booking ID is required'),
  body('documentType')
    .isIn(['receipt', 'acknowledgement', 'slip', 'invoice', 'bill', 'quotation', 'sales_order', 'purchase_order', 'other'])
    .withMessage('Invalid document type'),
  body('documentName').optional().isString(),
  body('description').optional().isString().isLength({ max: 500 }),
  body('isPhysicalCopy').optional().isBoolean(),
  body('physicalCopyLocation').optional().isString()
];

// All routes require authentication
router.use(protect);

// Routes
router.post('/upload', authorize('admin'), upload.single('file'), uploadDocumentValidation, uploadDocument);
router.get('/booking/:bookingId', getDocumentsByBooking);
router.get('/:documentId/file', getDocumentFile);
router.get('/:documentId', getDocumentById);
router.delete('/:documentId', authorize('admin'), deleteDocument);

export default router;

