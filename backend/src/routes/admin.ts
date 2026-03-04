import express from 'express';
import { adminAuth } from '../middleware/auth';
import { 
  getAdminStats, 
  getAdminUsers, 
  getAdminBookings, 
  updateBookingStatus, 
  updateUserStatus, 
  updateServiceStatus,
  getAdminServiceProviders,
  createAdminServiceProvider,
  updateAdminServiceProvider,
  removeAdminServiceProvider,
  getAdminDrivers,
  createAdminDriver,
  updateAdminDriver,
  removeAdminDriver
} from '../controllers/adminController';

const router = express.Router();

// All admin routes require admin authentication
router.use(adminAuth);

// Dashboard statistics
router.get('/stats', getAdminStats);

// User management
router.get('/users', getAdminUsers);
router.put('/users/:userId/status', updateUserStatus);

// Booking management
router.get('/bookings', getAdminBookings);
router.put('/bookings/:bookingId/status', updateBookingStatus);

// Service providers management
router.get('/service-providers', getAdminServiceProviders);
router.post('/service-providers', createAdminServiceProvider);
router.put('/service-providers/:providerId', updateAdminServiceProvider);
router.delete('/service-providers/:providerId', removeAdminServiceProvider);

// Drivers management
router.get('/drivers', getAdminDrivers);
router.post('/drivers', createAdminDriver);
router.put('/drivers/:driverId', updateAdminDriver);
router.delete('/drivers/:driverId', removeAdminDriver);

// Service management
router.put('/services/:serviceId/status', updateServiceStatus);

export default router; 