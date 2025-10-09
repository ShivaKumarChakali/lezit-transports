import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import {
  getDriverDashboard,
  getDriverBookings,
  updateDriverAvailability,
  updateBookingStatus,
  updateDriverProfile,
  getAvailableDrivers
} from '../controllers/driverController';

const router = express.Router();

// Public route - get available drivers
router.get('/available', getAvailableDrivers);

// Protected routes
router.use(authenticateToken);

// Driver-specific routes
router.get('/dashboard', requireRole('driver'), getDriverDashboard);
router.get('/bookings', requireRole('driver'), getDriverBookings);
router.put('/availability', requireRole('driver'), updateDriverAvailability);
router.put('/bookings/:bookingId/status', requireRole('driver'), updateBookingStatus);
router.put('/profile', requireRole('driver'), updateDriverProfile);

export default router;
