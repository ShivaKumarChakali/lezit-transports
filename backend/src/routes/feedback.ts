import express from 'express';
import { body } from 'express-validator';
import {
  submitFeedback,
  getFeedbackByBooking,
  getFeedbackById,
  updateFeedbackStatus,
  getAllFeedback
} from '../controllers/feedbackController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// Validation middleware
const submitFeedbackValidation = [
  body('bookingId').notEmpty().withMessage('Booking ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isString().isLength({ max: 1000 }),
  body('categories').optional().isObject()
];

const updateStatusValidation = [
  body('status')
    .isIn(['pending', 'submitted', 'reviewed'])
    .withMessage('Invalid status value')
];

// All routes require authentication
router.use(protect);

// Routes
router.post('/', submitFeedbackValidation, submitFeedback);
router.get('/booking/:bookingId', getFeedbackByBooking);
router.get('/all', authorize('admin'), getAllFeedback);
router.get('/:feedbackId', getFeedbackById);
router.put('/:feedbackId/status', authorize('admin'), updateStatusValidation, updateFeedbackStatus);

export default router;

