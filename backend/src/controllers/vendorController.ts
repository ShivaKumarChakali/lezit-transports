import { Request, Response } from 'express';
import User from '../models/User';
import Vehicle from '../models/Vehicle';
import Booking from '../models/Booking';
import { AuthRequest } from '../types';

// Get vendor dashboard data
export const getVendorDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const vendorId = req.user?.id;

    // Get vendor's vehicles
    const vehicles = await Vehicle.find({ vendorId, isActive: true })
      .select('name type make model licensePlate capacity pricePerKm basePrice isAvailable rating totalBookings')
      .lean();

    // Get vendor's bookings
    const bookings = await Booking.find({ assignedVendor: vendorId })
      .populate('userId', 'name email phone')
      .populate('assignedDriver', 'name phone')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Get statistics
    const totalVehicles = vehicles.length;
    const availableVehicles = vehicles.filter(v => v.isAvailable).length;
    const totalBookings = await Booking.countDocuments({ assignedVendor: vendorId });
    const completedBookings = await Booking.countDocuments({ 
      assignedVendor: vendorId, 
      status: 'completed' 
    });
    const pendingBookings = await Booking.countDocuments({ 
      assignedVendor: vendorId, 
      status: 'pending' 
    });

    // Calculate total earnings
    const earningsData = await Booking.aggregate([
      { $match: { assignedVendor: new (require('mongoose')).Types.ObjectId(vendorId), status: 'completed' } },
      { $group: { _id: null, totalEarnings: { $sum: '$totalAmount' } } }
    ]);

    const totalEarnings = earningsData.length > 0 ? earningsData[0].totalEarnings : 0;

    res.json({
      success: true,
      data: {
        vehicles,
        recentBookings: bookings,
        statistics: {
          totalVehicles,
          availableVehicles,
          totalBookings,
          completedBookings,
          pendingBookings,
          totalEarnings
        }
      }
    });
  } catch (error) {
    console.error('Error fetching vendor dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get vendor's vehicles
export const getVendorVehicles = async (req: AuthRequest, res: Response) => {
  try {
    const vendorId = req.user?.id;
    const { page = 1, limit = 10 } = req.query;

    const vehicles = await Vehicle.find({ vendorId })
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit))
      .lean();

    const total = await Vehicle.countDocuments({ vendorId });

    res.json({
      success: true,
      data: {
        vehicles,
        pagination: {
          current: Number(page),
          pages: Math.ceil(total / Number(limit)),
          total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching vendor vehicles:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Add new vehicle
export const addVehicle = async (req: AuthRequest, res: Response) => {
  try {
    const vendorId = req.user?.id;
    const vehicleData = {
      ...req.body,
      vendorId
    };

    const vehicle = new Vehicle(vehicleData);
    await vehicle.save();

    return res.status(201).json({
      success: true,
      message: 'Vehicle added successfully',
      data: vehicle
    });
  } catch (error) {
    console.error('Error adding vehicle:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update vehicle
export const updateVehicle = async (req: AuthRequest, res: Response) => {
  try {
    const { vehicleId } = req.params;
    const vendorId = req.user?.id;

    const vehicle = await Vehicle.findOneAndUpdate(
      { _id: vehicleId, vendorId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    return res.json({
      success: true,
      message: 'Vehicle updated successfully',
      data: vehicle
    });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete vehicle
export const deleteVehicle = async (req: AuthRequest, res: Response) => {
  try {
    const { vehicleId } = req.params;
    const vendorId = req.user?.id;

    const vehicle = await Vehicle.findOneAndUpdate(
      { _id: vehicleId, vendorId },
      { isActive: false },
      { new: true }
    );

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    return res.json({
      success: true,
      message: 'Vehicle deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get vendor's bookings
export const getVendorBookings = async (req: AuthRequest, res: Response) => {
  try {
    const vendorId = req.user?.id;
    const { page = 1, limit = 10, status } = req.query;

    const filter: any = { assignedVendor: vendorId };
    if (status) {
      filter.status = status;
    }

    const bookings = await Booking.find(filter)
      .populate('userId', 'name email phone')
      .populate('assignedDriver', 'name phone')
      .populate('vehicleId', 'name type licensePlate')
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit))
      .lean();

    const total = await Booking.countDocuments(filter);

    res.json({
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
    console.error('Error fetching vendor bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update booking status
export const updateBookingStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;
    const vendorId = req.user?.id;

    const booking = await Booking.findOneAndUpdate(
      { _id: bookingId, assignedVendor: vendorId },
      { status },
      { new: true, runValidators: true }
    ).populate('userId', 'name email phone');

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
