import express from 'express';
import { body } from 'express-validator';
import { submitContactForm, submitSupportRequest } from '../controllers/contactController';

const router = express.Router();

// Contact form validation
const contactFormValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .optional({ checkFalsy: true })
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('phone')
    .trim()
    .isLength({ min: 10, max: 15 })
    .withMessage('Please provide a valid phone number'),
  body('subject')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Subject must be between 5 and 100 characters'),
  body('message')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message must be between 10 and 1000 characters')
];

// Support request validation
const supportRequestValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .optional({ checkFalsy: true })
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('category')
    .optional({ checkFalsy: true })
    .isIn(['technical', 'billing', 'booking', 'general', 'complaint'])
    .withMessage('Please select a valid category'),
  body('priority')
    .optional({ checkFalsy: true })
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Please select a valid priority level'),
  body('subject')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Subject must be between 5 and 100 characters'),
  body('description')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters')
];

// Routes
router.post('/contact', contactFormValidation, submitContactForm);
router.post('/support', supportRequestValidation, submitSupportRequest);

export default router; 