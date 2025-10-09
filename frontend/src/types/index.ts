export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin' | 'vendor' | 'driver';
  isActive?: boolean;
  // Vendor-specific fields
  businessName?: string;
  businessType?: 'car_rental' | 'taxi_service' | 'bus_service' | 'truck_service' | 'other';
  businessLicense?: string;
  businessAddress?: string;
  // Driver-specific fields
  licenseNumber?: string;
  licenseExpiry?: string;
  vehicleType?: 'car' | 'suv' | 'van' | 'bus' | 'truck' | 'bike';
  experience?: number;
  rating?: number;
  // Common fields
  bankDetails?: {
    accountNumber?: string;
    ifscCode?: string;
    accountHolderName?: string;
  };
  documents?: {
    aadhar?: string;
    pan?: string;
    license?: string;
    vehicleRC?: string;
    insurance?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface Service {
  _id: string;
  name: string;
  category: 'person' | 'goods';
  description: string;
  basePrice: number;
  pricePerKm?: number;
  isActive: boolean;
}

export interface Booking {
  _id: string;
  userId: string | { _id: string; name: string; email: string; phone?: string };
  serviceType: 'person' | 'goods';
  serviceCategory: string;
  email: string;
  pickupLocation: string;
  dropLocation: string;
  pickupDate: string;
  pickupTime: string;
  dropDate?: string;
  dropTime?: string;
  numberOfPersons?: number;
  goodsDescription?: string;
  vehicleType?: string;
  driverRequired?: boolean;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod?: string;
  specialInstructions?: string;
  assignedVendor?: string | { _id: string; name: string; businessName?: string };
  assignedDriver?: string | { _id: string; name: string; phone?: string };
  vehicleId?: string | { _id: string; name: string; type: string; licensePlate?: string };
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalBookings: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface BookingsResponse {
  bookings: Booking[];
  pagination: PaginationInfo;
}

// Admin Dashboard Types
export interface DashboardStats {
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  pendingBookings: number;
  activeServices: number;
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminBooking {
  _id: string;
  userId: string;
  serviceType: string;
  serviceCategory: string;
  pickupLocation: string;
  dropLocation: string;
  pickupDate: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
}

export interface AdminService {
  _id: string;
  name: string;
  category: string;
  description: string;
  basePrice: number;
  isActive: boolean;
}

// Vehicle Types
export interface Vehicle {
  _id: string;
  vendorId: string;
  name: string;
  type: 'car' | 'suv' | 'van' | 'bus' | 'truck' | 'bike';
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  capacity: number;
  features: string[];
  pricePerKm: number;
  basePrice: number;
  isAvailable: boolean;
  isActive: boolean;
  images: string[];
  documents: {
    rc: string;
    insurance: string;
    permit?: string;
  };
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  rating: number;
  totalBookings: number;
  createdAt: string;
  updatedAt: string;
}

// Vendor Dashboard Types
export interface VendorDashboardStats {
  totalVehicles: number;
  availableVehicles: number;
  totalBookings: number;
  completedBookings: number;
  pendingBookings: number;
  totalEarnings: number;
}

export interface VendorDashboard {
  vehicles: Vehicle[];
  recentBookings: Booking[];
  statistics: VendorDashboardStats;
}

// Driver Dashboard Types
export interface DriverDashboardStats {
  totalBookings: number;
  completedBookings: number;
  inProgressBookings: number;
  pendingBookings: number;
  totalEarnings: number;
}

export interface DriverDashboard {
  driver: User;
  recentBookings: Booking[];
  statistics: DriverDashboardStats;
} 