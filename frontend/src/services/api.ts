import axios, { AxiosResponse } from 'axios';
import { User, Service, Booking, ApiResponse, DashboardStats, AdminUser, AdminBooking, VendorDashboard, DriverDashboard, Vehicle } from '../types';
import { navigationService } from './navigation';

// Create axios instance with base configuration
// Use environment variable if available, otherwise default to Render production URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://lezit-transports-backend.onrender.com/api';

console.log('🔧 API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
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
    // Log error details for debugging
    if (error.response) {
      console.error('❌ API Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        fullURL: `${error.config?.baseURL}${error.config?.url}`,
        data: error.response.data
      });
    } else if (error.request) {
      console.error('❌ Network Error - No response received:', {
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        fullURL: `${error.config?.baseURL}${error.config?.url}`
      });
    } else {
      console.error('❌ Request Error:', error.message);
    }

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

  getBookingByOrderId: async (orderId: string): Promise<ApiResponse<Booking>> => {
    const response: AxiosResponse<ApiResponse<Booking>> = await api.get(`/bookings/order/${orderId}`);
    return response.data;
  },

  getBookingTimeline: async (bookingId: string): Promise<ApiResponse<any[]>> => {
    const response: AxiosResponse<ApiResponse<any[]>> = await api.get(`/bookings/${bookingId}/timeline`);
    return response.data;
  },

  updateBookingDetails: async (bookingId: string, details: any): Promise<ApiResponse<Booking>> => {
    const response: AxiosResponse<ApiResponse<Booking>> = await api.put(`/bookings/${bookingId}/details`, details);
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
    email: string;
    phone: string;
    subject: string;
    message: string;
  }): Promise<ApiResponse<{ message: string }>> => {
    const response: AxiosResponse<ApiResponse<{ message: string }>> = await api.post('/contact/contact', messageData);
    return response.data;
  },
};

// Quotations API
export const quotationsAPI = {
  createQuotation: async (quotationData: {
    bookingId: string;
    items: Array<{ description: string; quantity?: number; unitPrice?: number; total: number }>;
    subtotal: number;
    taxes?: number;
    discount?: number;
    totalAmount: number;
    validUntil: string;
    termsAndConditions?: string;
  }): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.post('/quotations', quotationData);
    return response.data;
  },

  getQuotationById: async (quotationId: string): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.get(`/quotations/${quotationId}`);
    return response.data;
  },

  getQuotationsByBooking: async (bookingId: string): Promise<ApiResponse<any[]>> => {
    const response: AxiosResponse<ApiResponse<any[]>> = await api.get(`/quotations/booking/${bookingId}`);
    return response.data;
  },

  shareQuotation: async (quotationId: string, shareData?: { email?: string; phone?: string }): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.post(`/quotations/${quotationId}/share`, shareData || {});
    return response.data;
  },

  approveQuotation: async (quotationId: string): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.post(`/quotations/${quotationId}/approve`);
    return response.data;
  },

  rejectQuotation: async (quotationId: string, reason?: string): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.post(`/quotations/${quotationId}/reject`, { reason });
    return response.data;
  },
};

// Sales Orders API
export const salesOrdersAPI = {
  createSalesOrder: async (salesOrderData: {
    quotationId: string;
    advanceAmount?: number;
  }): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.post('/sales-orders', salesOrderData);
    return response.data;
  },

  getSalesOrderById: async (salesOrderId: string): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.get(`/sales-orders/${salesOrderId}`);
    return response.data;
  },

  getSalesOrdersByBooking: async (bookingId: string): Promise<ApiResponse<any[]>> => {
    const response: AxiosResponse<ApiResponse<any[]>> = await api.get(`/sales-orders/booking/${bookingId}`);
    return response.data;
  },

  updateSalesOrderStatus: async (salesOrderId: string, status: string): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.put(`/sales-orders/${salesOrderId}/status`, { status });
    return response.data;
  },

  getAllSalesOrders: async (page = 1, limit = 20): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.get(`/sales-orders/all?page=${page}&limit=${limit}`);
    return response.data;
  },
};

// Purchase Orders API
export const purchaseOrdersAPI = {
  createPurchaseOrder: async (purchaseOrderData: {
    salesOrderId: string;
    providerId: string;
    items: Array<{ description: string; quantity?: number; unitPrice?: number; total: number }>;
    subtotal: number;
    taxes?: number;
    totalAmount: number;
    advanceAmount?: number;
    deliveryTerms?: string;
  }): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.post('/purchase-orders', purchaseOrderData);
    return response.data;
  },

  getPurchaseOrderById: async (purchaseOrderId: string): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.get(`/purchase-orders/${purchaseOrderId}`);
    return response.data;
  },

  getPurchaseOrdersByBooking: async (bookingId: string): Promise<ApiResponse<any[]>> => {
    const response: AxiosResponse<ApiResponse<any[]>> = await api.get(`/purchase-orders/booking/${bookingId}`);
    return response.data;
  },

  getPurchaseOrdersByProvider: async (page = 1, limit = 20): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.get(`/purchase-orders/provider/my-orders?page=${page}&limit=${limit}`);
    return response.data;
  },

  acknowledgePurchaseOrder: async (purchaseOrderId: string): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.post(`/purchase-orders/${purchaseOrderId}/acknowledge`);
    return response.data;
  },

  updatePurchaseOrderStatus: async (purchaseOrderId: string, status: string): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.put(`/purchase-orders/${purchaseOrderId}/status`, { status });
    return response.data;
  },
};

// Financial Transactions API
export const financialTransactionsAPI = {
  recordCustomerAdvance: async (transactionData: {
    bookingId: string;
    amount: number;
    paymentMethod: 'cash' | 'bank_transfer' | 'upi' | 'card' | 'cheque' | 'other';
    paymentReference?: string;
    receiptUrl?: string;
    description?: string;
  }): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.post('/financial-transactions/customer/advance', transactionData);
    return response.data;
  },

  recordProviderAdvance: async (transactionData: {
    bookingId: string;
    amount: number;
    paymentMethod: 'cash' | 'bank_transfer' | 'upi' | 'card' | 'cheque' | 'other';
    paymentReference?: string;
    receiptUrl?: string;
    description?: string;
  }): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.post('/financial-transactions/provider/advance', transactionData);
    return response.data;
  },

  recordCustomerBalance: async (transactionData: {
    bookingId: string;
    amount: number;
    paymentMethod: 'cash' | 'bank_transfer' | 'upi' | 'card' | 'cheque' | 'other';
    paymentReference?: string;
    receiptUrl?: string;
    description?: string;
  }): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.post('/financial-transactions/customer/balance', transactionData);
    return response.data;
  },

  recordProviderBalance: async (transactionData: {
    bookingId: string;
    amount: number;
    paymentMethod: 'cash' | 'bank_transfer' | 'upi' | 'card' | 'cheque' | 'other';
    paymentReference?: string;
    receiptUrl?: string;
    description?: string;
  }): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.post('/financial-transactions/provider/balance', transactionData);
    return response.data;
  },

  getTransactionsByBooking: async (bookingId: string): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.get(`/financial-transactions/booking/${bookingId}`);
    return response.data;
  },

  getTransactionById: async (transactionId: string): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.get(`/financial-transactions/${transactionId}`);
    return response.data;
  },

  getAllTransactions: async (page = 1, limit = 50, transactionType?: string): Promise<ApiResponse<any>> => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (transactionType) params.append('transactionType', transactionType);
    const response: AxiosResponse<ApiResponse<any>> = await api.get(`/financial-transactions/all?${params}`);
    return response.data;
  },
};

// Invoices API
export const invoicesAPI = {
  generateInvoice: async (invoiceData: {
    salesOrderId: string;
    dueDate?: string;
  }): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.post('/invoices', invoiceData);
    return response.data;
  },

  sendInvoice: async (invoiceId: string): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.post(`/invoices/${invoiceId}/send`);
    return response.data;
  },

  markInvoicePaid: async (invoiceId: string): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.put(`/invoices/${invoiceId}/paid`);
    return response.data;
  },

  getInvoiceById: async (invoiceId: string): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.get(`/invoices/${invoiceId}`);
    return response.data;
  },

  getInvoicesByBooking: async (bookingId: string): Promise<ApiResponse<any[]>> => {
    const response: AxiosResponse<ApiResponse<any[]>> = await api.get(`/invoices/booking/${bookingId}`);
    return response.data;
  },

  getAllInvoices: async (page = 1, limit = 20, status?: string): Promise<ApiResponse<any>> => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (status) params.append('status', status);
    const response: AxiosResponse<ApiResponse<any>> = await api.get(`/invoices/all?${params}`);
    return response.data;
  },
};

// Bills API
export const billsAPI = {
  generateBill: async (billData: {
    purchaseOrderId: string;
    dueDate?: string;
  }): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.post('/bills', billData);
    return response.data;
  },

  sendBill: async (billId: string): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.post(`/bills/${billId}/send`);
    return response.data;
  },

  markBillPaid: async (billId: string): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.put(`/bills/${billId}/paid`);
    return response.data;
  },

  getBillById: async (billId: string): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.get(`/bills/${billId}`);
    return response.data;
  },

  getBillsByBooking: async (bookingId: string): Promise<ApiResponse<any[]>> => {
    const response: AxiosResponse<ApiResponse<any[]>> = await api.get(`/bills/booking/${bookingId}`);
    return response.data;
  },

  getBillsByProvider: async (page = 1, limit = 20): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.get(`/bills/provider/my-bills?page=${page}&limit=${limit}`);
    return response.data;
  },
};

// Documents API
export const documentsAPI = {
  uploadDocument: async (bookingId: string, file: File, documentData: {
    documentType: 'receipt' | 'acknowledgement' | 'slip' | 'invoice' | 'bill' | 'quotation' | 'sales_order' | 'purchase_order' | 'other';
    documentName?: string;
    description?: string;
    isPhysicalCopy?: boolean;
    physicalCopyLocation?: string;
  }): Promise<ApiResponse<any>> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bookingId', bookingId);
    formData.append('documentType', documentData.documentType);
    if (documentData.documentName) formData.append('documentName', documentData.documentName);
    if (documentData.description) formData.append('description', documentData.description);
    if (documentData.isPhysicalCopy !== undefined) formData.append('isPhysicalCopy', documentData.isPhysicalCopy.toString());
    if (documentData.physicalCopyLocation) formData.append('physicalCopyLocation', documentData.physicalCopyLocation);

    const response: AxiosResponse<ApiResponse<any>> = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getDocumentsByBooking: async (bookingId: string, documentType?: string): Promise<ApiResponse<any[]>> => {
    const params = documentType ? `?documentType=${documentType}` : '';
    const response: AxiosResponse<ApiResponse<any[]>> = await api.get(`/documents/booking/${bookingId}${params}`);
    return response.data;
  },

  getDocumentById: async (documentId: string): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.get(`/documents/${documentId}`);
    return response.data;
  },

  deleteDocument: async (documentId: string): Promise<ApiResponse<void>> => {
    const response: AxiosResponse<ApiResponse<void>> = await api.delete(`/documents/${documentId}`);
    return response.data;
  },

  getDocumentFile: async (documentId: string): Promise<Blob> => {
    const response = await api.get(`/documents/${documentId}/file`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

// Feedback API
export const feedbackAPI = {
  submitFeedback: async (feedbackData: {
    bookingId: string;
    rating: number;
    comment?: string;
    categories?: Record<string, any>;
  }): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.post('/feedback', feedbackData);
    return response.data;
  },

  getFeedbackByBooking: async (bookingId: string): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.get(`/feedback/booking/${bookingId}`);
    return response.data;
  },

  getFeedbackById: async (feedbackId: string): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.get(`/feedback/${feedbackId}`);
    return response.data;
  },

  updateFeedbackStatus: async (feedbackId: string, status: string): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.put(`/feedback/${feedbackId}/status`, { status });
    return response.data;
  },

  getAllFeedback: async (page = 1, limit = 20, feedbackFrom?: string): Promise<ApiResponse<any>> => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (feedbackFrom) params.append('feedbackFrom', feedbackFrom);
    const response: AxiosResponse<ApiResponse<any>> = await api.get(`/feedback/all?${params}`);
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
  getBookingByOrderId: bookingsAPI.getBookingByOrderId,
  getBookingTimeline: bookingsAPI.getBookingTimeline,
  updateBookingDetails: bookingsAPI.updateBookingDetails,

  // Admin methods
  getAdminStats: adminAPI.getAdminStats,
  getAdminUsers: adminAPI.getAdminUsers,
  getAdminBookings: adminAPI.getAdminBookings,
  updateUserStatus: adminAPI.updateUserStatus,
  updateServiceStatus: adminAPI.updateServiceStatus,

  // Contact methods
  sendContactMessage: contactAPI.sendContactMessage,

  // Quotation methods
  quotations: quotationsAPI,

  // Sales Order methods
  salesOrders: salesOrdersAPI,

  // Purchase Order methods
  purchaseOrders: purchaseOrdersAPI,

  // Financial Transaction methods
  financialTransactions: financialTransactionsAPI,

  // Invoice methods
  invoices: invoicesAPI,

  // Bill methods
  bills: billsAPI,

  // Document methods
  documents: documentsAPI,

  // Feedback methods
  feedback: feedbackAPI,

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
