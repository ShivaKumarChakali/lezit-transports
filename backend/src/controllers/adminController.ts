import { Request, Response } from 'express';
import { AuthRequest } from '../types';
import User from '../models/User';
import Booking from '../models/Booking';
import Service from '../models/Service';

const allowedLegacyStatuses = ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'];
const allowedOrderStatuses = [
  'primary',
  'confirmation_call_pending',
  'details_confirmed',
  'provider_search',
  'updated',
  'not_available',
  'quotation_shared',
  'quoted',
  'advance_received',
  'customer_id_generated',
  'sales_order_created',
  'purchase_order_created',
  'transactions_updated',
  'in_progress_cid',
  'in_progress_so',
  'in_progress_po',
  'in_progress_txn',
  'in_progress_oc',
  'order_completed',
  'invoice_bill_generated',
  'dues_closed',
  'closure_pending',
  'closure_payment_pending',
  'closure_feedback_pending',
  'closure_completed',
  'documented',
  'details_updated_online_offline',
  'confirmed',
  'in_progress',
  'pending_payment',
  'completed',
  'pending_feedback',
  'expired',
  'cancelled'
];

const orderToLegacyStatusMap: Record<string, string> = {
  cancelled: 'cancelled',
  order_completed: 'completed',
  closure_completed: 'completed',
  details_confirmed: 'confirmed',
  customer_id_generated: 'confirmed',
  sales_order_created: 'confirmed',
  purchase_order_created: 'confirmed',
  in_progress_cid: 'in-progress',
  in_progress_so: 'in-progress',
  in_progress_po: 'in-progress',
  in_progress_txn: 'in-progress',
  in_progress_oc: 'in-progress'
};

// Get dashboard statistics
export const getAdminStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Get total users
    const totalUsers = await User.countDocuments();
    
    // Get total bookings
    const totalBookings = await Booking.countDocuments();
    
    // Get total revenue
    const revenueResult = await Booking.aggregate([
      { $match: { status: { $in: ['confirmed', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;
    
    // Get pending bookings
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    
    // Get active services
    const activeServices = await Service.countDocuments({ isActive: true });

    res.json({
      success: true,
      data: {
        totalUsers,
        totalBookings,
        totalRevenue,
        pendingBookings,
        activeServices
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
};

// Get all users
export const getAdminUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
};

// Get all bookings with user details
export const getAdminBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bookings = await Booking.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings'
    });
  }
};

// Update booking status
export const updateBookingStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.params;
    const { status, orderStatus } = req.body;

    if (!status && !orderStatus) {
      res.status(400).json({
        success: false,
        message: 'Either status or orderStatus is required'
      });
      return;
    }

    if (status && !allowedLegacyStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
      return;
    }

    if (orderStatus && !allowedOrderStatuses.includes(orderStatus)) {
      res.status(400).json({
        success: false,
        message: 'Invalid order status value'
      });
      return;
    }

    const updates: any = {};
    if (status) updates.status = status;
    if (orderStatus) updates.orderStatus = orderStatus;
    if (!status && orderStatus && orderToLegacyStatusMap[orderStatus]) {
      updates.status = orderToLegacyStatusMap[orderStatus];
    }

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      updates,
      { new: true }
    ).populate('userId', 'name email');

    if (!booking) {
      res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
      return;
    }

    res.json({
      success: true,
      data: booking,
      message: 'Booking status updated successfully'
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking status'
    });
  }
};

// Update user status (activate/deactivate)
export const updateUserStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    // Prevent admin from deactivating themselves
    if (userId === req.user?.id && !isActive) {
      res.status(400).json({
        success: false,
        message: 'Cannot deactivate your own account'
      });
      return;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.json({
      success: true,
      data: user,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status'
    });
  }
};

// Update service status (activate/deactivate)
export const updateServiceStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { serviceId } = req.params;
    const { isActive } = req.body;

    const service = await Service.findByIdAndUpdate(
      serviceId,
      { isActive },
      { new: true }
    );

    if (!service) {
      res.status(404).json({
        success: false,
        message: 'Service not found'
      });
      return;
    }

    res.json({
      success: true,
      data: service,
      message: `Service ${isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Error updating service status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update service status'
    });
  }
}; 

// Get all service providers
export const getAdminServiceProviders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const providers = await User.find({ role: 'vendor' }, '-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      data: providers
    });
  } catch (error) {
    console.error('Error fetching service providers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service providers'
    });
  }
};

// Create service provider
export const createAdminServiceProvider = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      name,
      email,
      phone,
      businessName,
      businessType,
      businessLicense,
      businessAddress,
      password
    } = req.body;

    if (!name || !email || !phone || !businessName || !businessType || !businessLicense || !businessAddress) {
      res.status(400).json({
        success: false,
        message: 'Missing required provider fields'
      });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
      return;
    }

    const provider = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password: password || 'Temp@123456',
      role: 'vendor',
      businessName,
      businessType,
      businessLicense,
      businessAddress,
      isActive: true
    });

    const providerData = await User.findById(provider._id).select('-password');

    res.status(201).json({
      success: true,
      message: 'Service provider added successfully',
      data: providerData
    });
  } catch (error) {
    console.error('Error creating service provider:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create service provider'
    });
  }
};

// Update service provider
export const updateAdminServiceProvider = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { providerId } = req.params;
    const allowedFields = [
      'name',
      'email',
      'phone',
      'businessName',
      'businessType',
      'businessLicense',
      'businessAddress',
      'isActive'
    ];

    const updateData: any = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = field === 'email' ? String(req.body[field]).toLowerCase() : req.body[field];
      }
    });

    const provider = await User.findOneAndUpdate(
      { _id: providerId, role: 'vendor' },
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!provider) {
      res.status(404).json({
        success: false,
        message: 'Service provider not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Service provider updated successfully',
      data: provider
    });
  } catch (error) {
    console.error('Error updating service provider:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update service provider'
    });
  }
};

// Remove service provider
export const removeAdminServiceProvider = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { providerId } = req.params;

    const provider = await User.findOneAndDelete({ _id: providerId, role: 'vendor' });

    if (!provider) {
      res.status(404).json({
        success: false,
        message: 'Service provider not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Service provider removed successfully'
    });
  } catch (error) {
    console.error('Error removing service provider:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove service provider'
    });
  }
};

// Get all drivers
export const getAdminDrivers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const drivers = await User.find({ role: 'driver' }, '-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      data: drivers
    });
  } catch (error) {
    console.error('Error fetching drivers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch drivers'
    });
  }
};

// Create driver
export const createAdminDriver = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      name,
      email,
      phone,
      licenseNumber,
      licenseExpiry,
      vehicleType,
      experience,
      password
    } = req.body;

    if (!name || !email || !phone || !licenseNumber || !licenseExpiry || !vehicleType) {
      res.status(400).json({
        success: false,
        message: 'Missing required driver fields'
      });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
      return;
    }

    const driver = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password: password || 'Temp@123456',
      role: 'driver',
      licenseNumber,
      licenseExpiry,
      vehicleType,
      experience: Number(experience) || 0,
      isActive: true,
      isAvailable: true
    });

    const driverData = await User.findById(driver._id).select('-password');

    res.status(201).json({
      success: true,
      message: 'Driver added successfully',
      data: driverData
    });
  } catch (error) {
    console.error('Error creating driver:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create driver'
    });
  }
};

// Update driver
export const updateAdminDriver = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { driverId } = req.params;
    const allowedFields = [
      'name',
      'email',
      'phone',
      'licenseNumber',
      'licenseExpiry',
      'vehicleType',
      'experience',
      'isActive',
      'isAvailable'
    ];

    const updateData: any = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = field === 'email' ? String(req.body[field]).toLowerCase() : req.body[field];
      }
    });

    const driver = await User.findOneAndUpdate(
      { _id: driverId, role: 'driver' },
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!driver) {
      res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Driver updated successfully',
      data: driver
    });
  } catch (error) {
    console.error('Error updating driver:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update driver'
    });
  }
};

// Remove driver
export const removeAdminDriver = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { driverId } = req.params;

    const driver = await User.findOneAndDelete({ _id: driverId, role: 'driver' });

    if (!driver) {
      res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Driver removed successfully'
    });
  } catch (error) {
    console.error('Error removing driver:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove driver'
    });
  }
};