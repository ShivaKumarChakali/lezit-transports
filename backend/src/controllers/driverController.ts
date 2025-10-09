import { Request, Response } from 'express';
import User from '../models/User';
import Booking from '../models/Booking';
import { AuthRequest } from '../types';

// Get driver dashboard data
export const getDriverDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const driverId = req.user?.id;

    // Get driver's bookings
    const bookings = await Booking.find({ assignedDriver: driverId })
      .populate('userId', 'name email phone')
      .populate('assignedVendor', 'businessName')
      .populate('vehicleId', 'name type licensePlate')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Get statistics
    const totalBookings = await Booking.countDocuments({ assignedDriver: driverId });
    const completedBookings = await Booking.countDocuments({ 
      assignedDriver: driverId, 
      status: 'completed' 
    });
    const inProgressBookings = await Booking.countDocuments({ 
      assignedDriver: driverId, 
      status: 'in-progress' 
    });
    const pendingBookings = await Booking.countDocuments({ 
      assignedDriver: driverId, 
      status: 'pending' 
    });

    // Calculate total earnings
    const earningsData = await Booking.aggregate([
      { $match: { assignedDriver: new (require('mongoose')).Types.ObjectId(driverId), status: 'completed' } },
      { $group: { _id: null, totalEarnings: { $sum: '$totalAmount' } } }
    ]);

    const totalEarnings = earningsData.length > 0 ? earningsData[0].totalEarnings : 0;

    // Get driver profile
    const driver = await User.findById(driverId)
      .select('name email phone licenseNumber licenseExpiry vehicleType experience rating')
      .lean();

    return res.json({
      success: true,
      data: {
        driver,
        recentBookings: bookings,
        statistics: {
          totalBookings,
          completedBookings,
          inProgressBookings,
          pendingBookings,
          totalEarnings
        }
      }
    });
  } catch (error) {
    console.error('Error fetching driver dashboard:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get driver's bookings
export const getDriverBookings = async (req: AuthRequest, res: Response) => {
  try {
    const driverId = req.user?.id;
    const { page = 1, limit = 10, status } = req.query;

    const filter: any = { assignedDriver: driverId };
    if (status) {
      filter.status = status;
    }

    const bookings = await Booking.find(filter)
      .populate('userId', 'name email phone')
      .populate('assignedVendor', 'businessName')
      .populate('vehicleId', 'name type licensePlate')
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit))
      .lean();

    const total = await Booking.countDocuments(filter);

    return res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          current: Number(page),
          pages: Math.ceil(total / Number(limit)),
          total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching driver bookings:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update driver availability
export const updateDriverAvailability = async (req: AuthRequest, res: Response) => {
  try {
    const driverId = req.user?.id;
    const { isAvailable } = req.body;

    const driver = await User.findByIdAndUpdate(
      driverId,
      { isAvailable },
      { new: true }
    ).select('name email phone isAvailable');

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    return res.json({
      success: true,
      message: 'Availability updated successfully',
      data: driver
    });
  } catch (error) {
    console.error('Error updating driver availability:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update booking status (driver)
export const updateBookingStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;
    const driverId = req.user?.id;

    const booking = await Booking.findOneAndUpdate(
      { _id: bookingId, assignedDriver: driverId },
      { status },
      { new: true, runValidators: true }
    ).populate('userId', 'name email phone')
     .populate('vehicleId', 'name type licensePlate');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    return res.json({
      success: true,
      message: 'Booking status updated successfully',
      data: booking
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update driver profile
export const updateDriverProfile = async (req: AuthRequest, res: Response) => {
  try {
    const driverId = req.user?.id;
    const allowedFields = ['name', 'phone', 'licenseNumber', 'licenseExpiry', 'vehicleType', 'experience'];

    const updateData: any = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const driver = await User.findByIdAndUpdate(
      driverId,
      updateData,
      { new: true, runValidators: true }
    ).select('name email phone licenseNumber licenseExpiry vehicleType experience rating');

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      data: driver
    });
  } catch (error) {
    console.error('Error updating driver profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get available drivers
export const getAvailableDrivers = async (req: Request, res: Response) => {
  try {
    const { vehicleType, location } = req.query;

    const filter: any = { 
      role: 'driver', 
      isActive: true,
      isAvailable: true
    };

    if (vehicleType) {
      filter.vehicleType = vehicleType;
    }

    const drivers = await User.find(filter)
      .select('name phone licenseNumber vehicleType experience rating location')
      .lean();

    return res.json({
      success: true,
      data: drivers
    });
  } catch (error) {
    console.error('Error fetching available drivers:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
