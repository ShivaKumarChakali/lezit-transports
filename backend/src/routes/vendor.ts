import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import {
  getVendorDashboard,
  getVendorVehicles,
  addVehicle,
  updateVehicle,
  deleteVehicle,
  getVendorBookings,
  updateBookingStatus
} from '../controllers/vendorController';

const router = express.Router();

// All routes require vendor authentication
router.use(authenticateToken);
router.use(requireRole('vendor'));

// Dashboard
router.get('/dashboard', getVendorDashboard);

// Vehicle management
router.get('/vehicles', getVendorVehicles);
router.post('/vehicles', addVehicle);
router.put('/vehicles/:vehicleId', updateVehicle);
router.delete('/vehicles/:vehicleId', deleteVehicle);

// Booking management
router.get('/bookings', getVendorBookings);
router.put('/bookings/:bookingId/status', updateBookingStatus);

export default router;
