import axios, { AxiosResponse } from 'axios';
import { User, Service, Booking, ApiResponse, DashboardStats, AdminUser, AdminBooking, VendorDashboard, DriverDashboard, Vehicle } from '../types';
import { navigationService } from './navigation';

// Determine backend base URL (use env var, prefer localhost during development)
const getBaseURL = (): string => {
  // If running on localhost, prioritize local backend
  try {
    if (typeof window !== 'undefined' && window.location.hostname.includes('localhost')) {
      return 'http://localhost:5001/api';
    }
  } catch (e) {
    // ignore
  }

  // Check for explicit env variable
  const envUrl = (process.env as any).REACT_APP_API_URL as string | undefined;
  if (envUrl) return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;

  // Fallback to deployed backend
  return 'https://lezit-transports-backend.onrender.com/api';
};

// Create axios instance with base configuration
const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Use navigation service for proper SPA navigation
      navigationService.redirectToLogin();
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials: { email: string; password: string }): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response: AxiosResponse<ApiResponse<{ user: User; token: string }>> = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData: {
    name: string;
    email: string;
    password: string;
    phone: string;
  }): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response: AxiosResponse<ApiResponse<{ user: User; token: string }>> = await api.post('/auth/register', userData);
    return response.data;
  },

  getCurrentUser: async (): Promise<ApiResponse<{ user: User }>> => {
    const response: AxiosResponse<ApiResponse<{ user: User }>> = await api.get('/auth/me');
    return response.data;
  },
};

// Provider requests API
export const providerAPI = {
  createProviderRequest: async (payload: any) => {
    console.log('🌐 Provider Request - URL:', `${api.defaults.baseURL}/provider-requests`);
    console.log('🌐 Provider Request - Payload:', payload);
    const response = await api.post('/provider-requests', payload);
    console.log('📨 Provider API response:', response.data);
    return response.data;
  },
  getProviderRequests: async () => {
    console.log('🌐 Fetching provider requests from:', `${api.defaults.baseURL}/provider-requests`);
    const response = await api.get('/provider-requests');
    return response.data;
  }
};

// Services API
export const servicesAPI = {
  getServices: async (): Promise<ApiResponse<Service[]>> => {
    console.log('🌐 Making API request to:', api.defaults.baseURL + '/services');
    const response: AxiosResponse<ApiResponse<Service[]>> = await api.get('/services');
    console.log('📨 API response received:', response.data);
    return response.data;
  },

  getServiceById: async (id: string): Promise<ApiResponse<Service>> => {
    const response: AxiosResponse<ApiResponse<Service>> = await api.get(`/services/${id}`);
    return response.data;
  },
};

// Bookings API
export const bookingsAPI = {
  createBooking: async (bookingData: {
    serviceType: 'person' | 'goods';
    serviceCategory: string;
    pickupLocation: string;
    dropLocation: string;
    pickupDate: string;
    pickupTime: string;
    totalAmount: number;
    numberOfPersons?: number;
    goodsDescription?: string;
    contactPhone: string;
    specialInstructions?: string;
  }): Promise<ApiResponse<Booking>> => {
    const response: AxiosResponse<ApiResponse<Booking>> = await api.post('/bookings', bookingData);
    return response.data;
  },

  getMyBookings: async (): Promise<ApiResponse<{ bookings: Booking[]; pagination: any }>> => {
    const response: AxiosResponse<ApiResponse<{ bookings: Booking[]; pagination: any }>> = await api.get('/bookings/my-bookings');
    return response.data;
  },

  getBookingById: async (id: string): Promise<ApiResponse<Booking>> => {
    const response: AxiosResponse<ApiResponse<Booking>> = await api.get(`/bookings/${id}`);
    return response.data;
  },

  cancelBooking: async (bookingId: string): Promise<ApiResponse<Booking>> => {
    const response: AxiosResponse<ApiResponse<Booking>> = await api.put(`/bookings/${bookingId}/cancel`);
    return response.data;
  },

  updateBookingStatus: async (bookingId: string, status: string): Promise<ApiResponse<Booking>> => {
    const response: AxiosResponse<ApiResponse<Booking>> = await api.put(`/admin/bookings/${bookingId}/status`, { status });
    return response.data;
  },
};

// Admin API
export const adminAPI = {
  getAdminStats: async (): Promise<ApiResponse<DashboardStats>> => {
    const response: AxiosResponse<ApiResponse<DashboardStats>> = await api.get('/admin/stats');
    return response.data;
  },

  getAdminUsers: async (): Promise<ApiResponse<AdminUser[]>> => {
    const response: AxiosResponse<ApiResponse<AdminUser[]>> = await api.get('/admin/users');
    return response.data;
  },

  getAdminBookings: async (): Promise<ApiResponse<AdminBooking[]>> => {
    const response: AxiosResponse<ApiResponse<AdminBooking[]>> = await api.get('/admin/bookings');
    return response.data;
  },

  updateUserStatus: async (userId: string, isActive: boolean): Promise<ApiResponse<AdminUser>> => {
    const response: AxiosResponse<ApiResponse<AdminUser>> = await api.put(`/admin/users/${userId}/status`, { isActive });
    return response.data;
  },

  updateServiceStatus: async (serviceId: string, isActive: boolean): Promise<ApiResponse<Service>> => {
    const response: AxiosResponse<ApiResponse<Service>> = await api.put(`/admin/services/${serviceId}/status`, { isActive });
    return response.data;
  },
};

// Contact API
export const contactAPI = {
  sendContactMessage: async (messageData: {
    name: string;
    email?: string;
    phone: string;
    subject?: string;
    message?: string;
  }): Promise<ApiResponse<{ message: string }>> => {
    const response: AxiosResponse<ApiResponse<{ message: string }>> = await api.post('/contact/contact', messageData);
    return response.data;
  },
};

// Main API service object that combines all APIs
const apiService = {
  // Auth methods
  login: authAPI.login,
  register: authAPI.register,
  getCurrentUser: authAPI.getCurrentUser,

  // Services methods
  getServices: servicesAPI.getServices,
  getServiceById: servicesAPI.getServiceById,

  // Bookings methods
  createBooking: bookingsAPI.createBooking,
  getMyBookings: bookingsAPI.getMyBookings,
  getBookingById: bookingsAPI.getBookingById,
  cancelBooking: bookingsAPI.cancelBooking,
  updateBookingStatus: bookingsAPI.updateBookingStatus,

  // Admin methods
  getAdminStats: adminAPI.getAdminStats,
  getAdminUsers: adminAPI.getAdminUsers,
  getAdminBookings: adminAPI.getAdminBookings,
  updateUserStatus: adminAPI.updateUserStatus,
  updateServiceStatus: adminAPI.updateServiceStatus,

  // Contact methods
  sendContactMessage: contactAPI.sendContactMessage,

  // Vendor methods
  vendor: {
    getDashboard: async (): Promise<ApiResponse<VendorDashboard>> => {
      const response: AxiosResponse<ApiResponse<VendorDashboard>> = await api.get('/vendor/dashboard');
      return response.data;
    },
    getVehicles: async (page = 1, limit = 10): Promise<ApiResponse<{ vehicles: Vehicle[]; pagination: any }>> => {
      const response: AxiosResponse<ApiResponse<{ vehicles: Vehicle[]; pagination: any }>> = await api.get(`/vendor/vehicles?page=${page}&limit=${limit}`);
      return response.data;
    },
    addVehicle: async (vehicleData: any): Promise<ApiResponse<Vehicle>> => {
      const response: AxiosResponse<ApiResponse<Vehicle>> = await api.post('/vendor/vehicles', vehicleData);
      return response.data;
    },
    updateVehicle: async (vehicleId: string, vehicleData: any): Promise<ApiResponse<Vehicle>> => {
      const response: AxiosResponse<ApiResponse<Vehicle>> = await api.put(`/vendor/vehicles/${vehicleId}`, vehicleData);
      return response.data;
    },
    deleteVehicle: async (vehicleId: string): Promise<ApiResponse<void>> => {
      const response: AxiosResponse<ApiResponse<void>> = await api.delete(`/vendor/vehicles/${vehicleId}`);
      return response.data;
    },
    getBookings: async (page = 1, limit = 10, status?: string): Promise<ApiResponse<{ bookings: Booking[]; pagination: any }>> => {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (status) params.append('status', status);
      const response: AxiosResponse<ApiResponse<{ bookings: Booking[]; pagination: any }>> = await api.get(`/vendor/bookings?${params}`);
      return response.data;
    },
    updateBookingStatus: async (bookingId: string, status: string): Promise<ApiResponse<Booking>> => {
      const response: AxiosResponse<ApiResponse<Booking>> = await api.put(`/vendor/bookings/${bookingId}/status`, { status });
      return response.data;
    },
  },

  // Driver methods
  driver: {
    getDashboard: async (): Promise<ApiResponse<DriverDashboard>> => {
      const response: AxiosResponse<ApiResponse<DriverDashboard>> = await api.get('/driver/dashboard');
      return response.data;
    },
    getBookings: async (page = 1, limit = 10, status?: string): Promise<ApiResponse<{ bookings: Booking[]; pagination: any }>> => {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (status) params.append('status', status);
      const response: AxiosResponse<ApiResponse<{ bookings: Booking[]; pagination: any }>> = await api.get(`/driver/bookings?${params}`);
      return response.data;
    },
    updateAvailability: async (isAvailable: boolean): Promise<ApiResponse<User>> => {
      const response: AxiosResponse<ApiResponse<User>> = await api.put('/driver/availability', { isAvailable });
      return response.data;
    },
    updateBookingStatus: async (bookingId: string, status: string): Promise<ApiResponse<Booking>> => {
      const response: AxiosResponse<ApiResponse<Booking>> = await api.put(`/driver/bookings/${bookingId}/status`, { status });
      return response.data;
    },
    updateProfile: async (profileData: any): Promise<ApiResponse<User>> => {
      const response: AxiosResponse<ApiResponse<User>> = await api.put('/driver/profile', profileData);
      return response.data;
    },
    getAvailableDrivers: async (vehicleType?: string, location?: string): Promise<ApiResponse<User[]>> => {
      const params = new URLSearchParams();
      if (vehicleType) params.append('vehicleType', vehicleType);
      if (location) params.append('location', location);
      const response: AxiosResponse<ApiResponse<User[]>> = await api.get(`/driver/available?${params}`);
      return response.data;
    },
  },
};

export { apiService };
export default apiService;
