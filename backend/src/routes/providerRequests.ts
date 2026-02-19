import express from 'express';
import { body } from 'express-validator';
import { createProviderRequest, listProviderRequests } from '../controllers/providerRequestController';
import { authenticateToken, requireRole, adminAuth } from '../middleware/auth';

const router = express.Router();

// Public endpoint to create a provider request
const validationRules = [
  body('requestType').isIn(['service-provider', 'vehicle-owner', 'driver']).withMessage('Invalid request type'),
  body('entityType').isIn(['individual', 'non-individual']).withMessage('Invalid entity type'),
  body('fullName').notEmpty().withMessage('Full name is required'),
  body('mobile').notEmpty().withMessage('Mobile number is required'),
  body('email').isEmail().withMessage('Valid email is required')
];

router.post('/', validationRules, createProviderRequest);

// Admin listing of requests
router.get('/', authenticateToken, requireRole('admin'), listProviderRequests);

export default router;
