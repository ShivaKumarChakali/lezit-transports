import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import { ORDER_STATUSES } from '../constants/orderStatuses';

// Import modal components (we'll create these next)
const CreateQuotationModal = ({ order, onClose, onSuccess }: any) => {
  const [formData, setFormData] = useState({
    items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
    subtotal: 0,
    taxes: 0,
    discount: 0,
    totalAmount: 0,
    validUntil: '',
    termsAndConditions: ''
  });

  const calculateTotal = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + (item.total || 0), 0);
    const totalAmount = subtotal + formData.taxes - formData.discount;
    setFormData({ ...formData, subtotal, totalAmount });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiService.quotations.createQuotation({
        bookingId: order._id || order.id,
        ...formData,
        validUntil: formData.validUntil || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      });
      if (response.success) {
        toast.success('Quotation created successfully');
        onSuccess();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create quotation');
    }
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Create Quotation</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Items</label>
                {formData.items.map((item, index) => (
                  <div key={index} className="row mb-2">
                    <div className="col-md-5">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => {
                          const newItems = [...formData.items];
                          newItems[index].description = e.target.value;
                          setFormData({ ...formData, items: newItems });
                        }}
                      />
                    </div>
                    <div className="col-md-2">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => {
                          const newItems = [...formData.items];
                          newItems[index].quantity = Number(e.target.value);
                          newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
                          setFormData({ ...formData, items: newItems });
                          calculateTotal();
                        }}
                      />
                    </div>
                    <div className="col-md-2">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Price"
                        value={item.unitPrice}
                        onChange={(e) => {
                          const newItems = [...formData.items];
                          newItems[index].unitPrice = Number(e.target.value);
                          newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
                          setFormData({ ...formData, items: newItems });
                          calculateTotal();
                        }}
                      />
                    </div>
                    <div className="col-md-2">
                      <input
                        type="number"
                        className="form-control"
                        value={item.total}
                        readOnly
                      />
                    </div>
                    <div className="col-md-1">
                      {formData.items.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => {
                            const newItems = formData.items.filter((_, i) => i !== index);
                            setFormData({ ...formData, items: newItems });
                            calculateTotal();
                          }}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      items: [...formData.items, { description: '', quantity: 1, unitPrice: 0, total: 0 }]
                    });
                  }}
                >
                  <i className="fas fa-plus me-1"></i>
                  Add Item
                </button>
              </div>
              <div className="row">
                <div className="col-md-4">
                  <label className="form-label">Subtotal</label>
                  <input type="number" className="form-control" value={formData.subtotal} readOnly />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Taxes</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.taxes}
                    onChange={(e) => {
                      setFormData({ ...formData, taxes: Number(e.target.value) });
                      calculateTotal();
                    }}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Discount</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.discount}
                    onChange={(e) => {
                      setFormData({ ...formData, discount: Number(e.target.value) });
                      calculateTotal();
                    }}
                  />
                </div>
              </div>
              <div className="mb-3 mt-3">
                <label className="form-label">Total Amount</label>
                <input type="number" className="form-control" value={formData.totalAmount} readOnly />
              </div>
              <div className="mb-3">
                <label className="form-label">Valid Until</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary">Create Quotation</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const QuotationDetailsModal = ({ quotation, onClose, onCreateSO }: any) => {
  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Quotation: {quotation.quotationNumber}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="row mb-3">
              <div className="col-md-6">
                <strong>Total Amount:</strong> ₹{quotation.totalAmount?.toLocaleString()}
              </div>
              <div className="col-md-6">
                <strong>Status:</strong>{' '}
                <span className={`badge ${
                  quotation.status === 'approved' ? 'bg-success' :
                  quotation.status === 'rejected' ? 'bg-danger' :
                  'bg-warning'
                }`}>
                  {quotation.status}
                </span>
              </div>
            </div>
            <h6>Items</h6>
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {quotation.items?.map((item: any, index: number) => (
                  <tr key={index}>
                    <td>{item.description}</td>
                    <td>{item.quantity || '-'}</td>
                    <td>₹{item.unitPrice?.toLocaleString() || '-'}</td>
                    <td>₹{item.total?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="modal-footer">
            {quotation.status === 'approved' && onCreateSO && (
              <button 
                type="button" 
                className="btn btn-success me-2"
                onClick={() => {
                  onCreateSO();
                  onClose();
                }}
              >
                <i className="fas fa-file-contract me-2"></i>
                Create Sales Order
              </button>
            )}
            <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TransactionModal = ({ order, transactionType, onClose, onSuccess }: any) => {
  const [formData, setFormData] = useState({
    amount: 0,
    paymentMethod: 'cash' as 'cash' | 'bank_transfer' | 'upi' | 'card' | 'cheque' | 'other',
    paymentReference: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let response;
      const transactionData = {
        bookingId: order._id || order.id,
        ...formData
      };

      if (transactionType === 'customer_advance') {
        response = await apiService.financialTransactions.recordCustomerAdvance(transactionData);
      } else if (transactionType === 'provider_advance') {
        response = await apiService.financialTransactions.recordProviderAdvance(transactionData);
      } else if (transactionType === 'customer_balance') {
        response = await apiService.financialTransactions.recordCustomerBalance(transactionData);
      } else if (transactionType === 'provider_balance') {
        response = await apiService.financialTransactions.recordProviderBalance(transactionData);
      }

      if (response?.success) {
        toast.success('Transaction recorded successfully');
        onSuccess();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to record transaction');
    }
  };

  const getTitle = () => {
    const titles: Record<string, string> = {
      'customer_advance': 'Record Customer Advance Payment',
      'provider_advance': 'Record Provider Advance Payment',
      'customer_balance': 'Record Customer Balance Payment',
      'provider_balance': 'Record Provider Balance Payment'
    };
    return titles[transactionType] || 'Record Transaction';
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{getTitle()}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Amount *</label>
                <input
                  type="number"
                  className="form-control"
                  required
                  min="0.01"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Payment Method *</label>
                <select
                  className="form-select"
                  required
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                >
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                  <option value="cheque">Cheque</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Payment Reference</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.paymentReference}
                  onChange={(e) => setFormData({ ...formData, paymentReference: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary">Record Transaction</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const InvoicesList: React.FC<{ order: any }> = ({ order }) => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (order && (order._id || order.id)) {
      fetchInvoices();
    }
  }, [order]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await apiService.invoices.getInvoicesByBooking(order._id || order.id);
      if (response.success && response.data) {
        setInvoices(response.data);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="spinner-border spinner-border-sm"></div>;
  if (invoices.length === 0) return <p className="text-muted small">No invoices</p>;

  return (
    <div className="list-group">
      {invoices.map((invoice: any) => (
        <div key={invoice._id} className="list-group-item">
          <div className="d-flex justify-content-between">
            <div>
              <strong>{invoice.invoiceNumber}</strong>
              <br />
              <small className="text-muted">₹{invoice.totalAmount?.toLocaleString()}</small>
            </div>
            <span className={`badge ${
              invoice.status === 'paid' ? 'bg-success' : 'bg-warning'
            }`}>
              {invoice.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

const BillsList: React.FC<{ order: any }> = ({ order }) => {
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (order && (order._id || order.id)) {
      fetchBills();
    }
  }, [order]);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const response = await apiService.bills.getBillsByBooking(order._id || order.id);
      if (response.success && response.data) {
        setBills(response.data);
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="spinner-border spinner-border-sm"></div>;
  if (bills.length === 0) return <p className="text-muted small">No bills</p>;

  return (
    <div className="list-group">
      {bills.map((bill: any) => (
        <div key={bill._id} className="list-group-item">
          <div className="d-flex justify-content-between">
            <div>
              <strong>{bill.billNumber}</strong>
              <br />
              <small className="text-muted">₹{bill.totalAmount?.toLocaleString()}</small>
            </div>
            <span className={`badge ${
              bill.status === 'paid' ? 'bg-success' : 'bg-warning'
            }`}>
              {bill.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

const DocumentUploadModal = ({ order, onClose, onSuccess }: any) => {
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    documentType: 'receipt' as 'receipt' | 'acknowledgement' | 'slip' | 'invoice' | 'bill' | 'quotation' | 'sales_order' | 'purchase_order' | 'other',
    documentName: '',
    description: '',
    isPhysicalCopy: false,
    physicalCopyLocation: ''
  });
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    setUploading(true);
    try {
      const response = await apiService.documents.uploadDocument(
        order._id || order.id,
        file,
        formData
      );
      if (response.success) {
        toast.success('Document uploaded successfully');
        onSuccess();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Upload Document</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Document Type *</label>
                <select
                  className="form-select"
                  required
                  value={formData.documentType}
                  onChange={(e) => setFormData({ ...formData, documentType: e.target.value as any })}
                >
                  <option value="receipt">Receipt</option>
                  <option value="acknowledgement">Acknowledgement</option>
                  <option value="slip">Slip</option>
                  <option value="invoice">Invoice</option>
                  <option value="bill">Bill</option>
                  <option value="quotation">Quotation</option>
                  <option value="sales_order">Sales Order</option>
                  <option value="purchase_order">Purchase Order</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">File *</label>
                <input
                  type="file"
                  className="form-control"
                  required
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Document Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.documentName}
                  onChange={(e) => setFormData({ ...formData, documentName: e.target.value })}
                  placeholder="Auto-filled from filename if empty"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={formData.isPhysicalCopy}
                    onChange={(e) => setFormData({ ...formData, isPhysicalCopy: e.target.checked })}
                  />
                  <label className="form-check-label">Physical Copy Available</label>
                </div>
              </div>
              {formData.isPhysicalCopy && (
                <div className="mb-3">
                  <label className="form-label">Physical Copy Location</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.physicalCopyLocation}
                    onChange={(e) => setFormData({ ...formData, physicalCopyLocation: e.target.value })}
                    placeholder="Where is the physical copy stored?"
                  />
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={uploading}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={uploading || !file}>
                {uploading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Uploading...
                  </>
                ) : (
                  <>
                    <i className="fas fa-upload me-2"></i>
                    Upload Document
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const OrderManagement: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'details' | 'timeline' | 'quotation' | 'financial' | 'documents'>('list');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user?.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      navigate('/');
      return;
    }
    fetchOrders();
  }, [user, navigate, filterStatus]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Fetch all bookings/orders
      const response = await apiService.getAdminBookings();
      if (response.success && response.data) {
        let filteredOrders = response.data;
        
        // Filter by status
        if (filterStatus !== 'all') {
          filteredOrders = filteredOrders.filter((order: any) => order.orderStatus === filterStatus);
        }
        
        // Filter by search term
        if (searchTerm) {
          filteredOrders = filteredOrders.filter((order: any) => 
            order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.pickupLocation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.dropLocation?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        setOrders(filteredOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusInfo = ORDER_STATUSES.find(s => s.id === status) || ORDER_STATUSES[0];
    return (
      <span className={`badge ${statusInfo.color} text-white px-3 py-2`}>
        <i className={`fas ${statusInfo.icon} me-1`}></i>
        {statusInfo.label}
      </span>
    );
  };

  const handleOrderClick = (order: any) => {
    setSelectedOrder(order);
    setActiveTab('details');
    fetchOrderDetails(order._id || order.id);
  };

  const fetchOrderDetails = async (orderId: string) => {
    try {
      // Fetch detailed order information including timeline, quotations, etc.
      // This would call multiple API endpoints
      const bookingResponse = await apiService.getBookingById(orderId);
      if (bookingResponse.success) {
        setSelectedOrder(bookingResponse.data);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h1 className="h3 mb-0">
              <i className="fas fa-shopping-cart me-2 text-primary"></i>
              Order Management
            </h1>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/bookings/new')}
            >
              <i className="fas fa-plus me-2"></i>
              New Order
            </button>
          </div>

          {/* Filters */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Search Orders</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by Order ID, pickup, or drop location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && fetchOrders()}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Filter by Status</label>
                  <select
                    className="form-select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    {ORDER_STATUSES.map(status => (
                      <option key={status.id} value={status.id}>{status.label}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2 d-flex align-items-end">
                  <button className="btn btn-outline-primary w-100" onClick={fetchOrders}>
                    <i className="fas fa-search me-2"></i>
                    Search
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedOrder && activeTab !== 'list' ? (
        // Order Details View
        <OrderDetailsView
          order={selectedOrder}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onBack={() => {
            setSelectedOrder(null);
            setActiveTab('list');
          }}
          onUpdate={fetchOrders}
        />
      ) : (
        // Orders List View
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <i className="fas fa-list me-2"></i>
                  All Orders ({orders.length})
                </h5>
              </div>
              <div className="card-body p-0">
                {orders.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                    <p className="text-muted">No orders found</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Order ID</th>
                          <th>Customer</th>
                          <th>Pickup</th>
                          <th>Drop</th>
                          <th>Date</th>
                          <th>Source</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order._id || order.id} style={{ cursor: 'pointer' }} onClick={() => handleOrderClick(order)}>
                            <td>
                              <strong className="text-primary">{order.orderId || 'N/A'}</strong>
                            </td>
                            <td>{order.userId?.name || 'N/A'}</td>
                            <td>
                              <small>{order.pickupLocation}</small>
                            </td>
                            <td>
                              <small>{order.dropLocation}</small>
                            </td>
                            <td>
                              {order.pickupDate ? new Date(order.pickupDate).toLocaleDateString() : 'N/A'}
                            </td>
                            <td>
                              <span className="badge bg-secondary">
                                {order.sourcePlatform || 'website'}
                              </span>
                            </td>
                            <td>{getStatusBadge(order.orderStatus || 'primary')}</td>
                            <td>
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOrderClick(order);
                                }}
                              >
                                <i className="fas fa-eye"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Order Details Component
const OrderDetailsView: React.FC<{
  order: any;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  onBack: () => void;
  onUpdate: () => void;
}> = ({ order, activeTab, setActiveTab, onBack, onUpdate }) => {
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (order && order._id) {
      fetchTimeline();
    }
  }, [order]);

  const fetchTimeline = async () => {
    setLoading(true);
    try {
      const response = await apiService.getBookingTimeline(order._id || order.id);
      if (response.success && response.data) {
        setTimeline(response.data);
      }
    } catch (error) {
      console.error('Error fetching timeline:', error);
      toast.error('Failed to load timeline');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row">
      <div className="col-12">
        <div className="card mb-4">
          <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <i className="fas fa-file-alt me-2"></i>
              Order Details: {order.orderId}
            </h5>
            <button className="btn btn-light btn-sm" onClick={onBack}>
              <i className="fas fa-arrow-left me-2"></i>
              Back to List
            </button>
          </div>
          <div className="card-body">
            {/* Tabs */}
            <ul className="nav nav-tabs mb-4">
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'details' ? 'active' : ''}`}
                  onClick={() => setActiveTab('details')}
                >
                  <i className="fas fa-info-circle me-2"></i>
                  Details
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'timeline' ? 'active' : ''}`}
                  onClick={() => setActiveTab('timeline')}
                >
                  <i className="fas fa-history me-2"></i>
                  Timeline
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'quotation' ? 'active' : ''}`}
                  onClick={() => setActiveTab('quotation')}
                >
                  <i className="fas fa-file-invoice me-2"></i>
                  Quotations
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'financial' ? 'active' : ''}`}
                  onClick={() => setActiveTab('financial')}
                >
                  <i className="fas fa-money-bill-wave me-2"></i>
                  Financial
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'documents' ? 'active' : ''}`}
                  onClick={() => setActiveTab('documents')}
                >
                  <i className="fas fa-file-upload me-2"></i>
                  Documents
                </button>
              </li>
            </ul>

            {/* Tab Content */}
            {activeTab === 'details' && (
              <OrderDetailsTab order={order} onUpdate={onUpdate} />
            )}
            {activeTab === 'timeline' && (
              <TimelineTab order={order} timeline={timeline} loading={loading} />
            )}
            {activeTab === 'quotation' && (
              <QuotationTab order={order} onUpdate={onUpdate} />
            )}
            {activeTab === 'financial' && (
              <FinancialTab order={order} onUpdate={onUpdate} />
            )}
            {activeTab === 'documents' && (
              <DocumentsTab order={order} onUpdate={onUpdate} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Individual Tab Components
const OrderDetailsTab: React.FC<{ order: any; onUpdate: () => void }> = ({ order, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(order);

  const handleSave = async () => {
    try {
      const response = await apiService.updateBookingDetails(order._id || order.id, {
        pickupLocation: formData.pickupLocation,
        dropLocation: formData.dropLocation,
        specialInstructions: formData.specialInstructions
      });
      if (response.success) {
        toast.success('Order updated successfully');
        setIsEditing(false);
        onUpdate();
      } else {
        throw new Error(response.message || 'Update failed');
      }
    } catch (error: any) {
      console.error('Error updating order:', error);
      toast.error(error.message || 'Failed to update order');
    }
  };

  return (
    <div className="row">
      <div className="col-md-6">
        <h6 className="mb-3">
          <i className="fas fa-map-marker-alt me-2 text-primary"></i>
          Location Details
        </h6>
        <div className="mb-3">
          <label className="form-label">Pickup Location</label>
          {isEditing ? (
            <input
              type="text"
              className="form-control"
              value={formData.pickupLocation}
              onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
            />
          ) : (
            <p className="form-control-plaintext">{order.pickupLocation}</p>
          )}
        </div>
        <div className="mb-3">
          <label className="form-label">Drop Location</label>
          {isEditing ? (
            <input
              type="text"
              className="form-control"
              value={formData.dropLocation}
              onChange={(e) => setFormData({ ...formData, dropLocation: e.target.value })}
            />
          ) : (
            <p className="form-control-plaintext">{order.dropLocation}</p>
          )}
        </div>
        <div className="mb-3">
          <label className="form-label">Pickup Date & Time</label>
          <p className="form-control-plaintext">
            {order.pickupDate ? new Date(order.pickupDate).toLocaleString() : 'N/A'}
          </p>
        </div>
        <div className="mb-3">
          <label className="form-label">Special Instructions</label>
          {isEditing ? (
            <textarea
              className="form-control"
              rows={3}
              value={formData.specialInstructions || ''}
              onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
            />
          ) : (
            <p className="form-control-plaintext">{order.specialInstructions || 'None'}</p>
          )}
        </div>
      </div>
      <div className="col-md-6">
        <h6 className="mb-3">
          <i className="fas fa-info-circle me-2 text-primary"></i>
          Order Information
        </h6>
        <div className="mb-3">
          <label className="form-label">Order ID</label>
          <p className="form-control-plaintext"><strong>{order.orderId}</strong></p>
        </div>
        <div className="mb-3">
          <label className="form-label">Source Platform</label>
          <p className="form-control-plaintext">
            <span className="badge bg-secondary">{order.sourcePlatform || 'website'}</span>
          </p>
        </div>
        <div className="mb-3">
          <label className="form-label">Current Status</label>
          <p className="form-control-plaintext">
            {ORDER_STATUSES.find(s => s.id === order.orderStatus)?.label || order.orderStatus}
          </p>
        </div>
        <div className="mb-3">
          <label className="form-label">Customer</label>
          <p className="form-control-plaintext">{order.userId?.name || 'N/A'}</p>
        </div>
      </div>
      <div className="col-12 mt-3">
        {isEditing ? (
          <div className="d-flex gap-2">
            <button className="btn btn-primary" onClick={handleSave}>
              <i className="fas fa-save me-2"></i>
              Save Changes
            </button>
            <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <button className="btn btn-outline-primary" onClick={() => setIsEditing(true)}>
            <i className="fas fa-edit me-2"></i>
            Edit Details
          </button>
        )}
      </div>
    </div>
  );
};

const TimelineTab: React.FC<{ order: any; timeline: any[]; loading: boolean }> = ({ order, timeline, loading }) => {
  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h6 className="mb-3">Activity Timeline</h6>
      {timeline.length === 0 ? (
        <div className="text-center py-4 text-muted">
          <i className="fas fa-history fa-2x mb-2"></i>
          <p>No timeline entries yet</p>
        </div>
      ) : (
        <div className="timeline">
          {timeline.map((entry: any, index: number) => (
            <div key={index} className="timeline-item mb-3">
              <div className="d-flex">
                <div className="timeline-marker me-3">
                  <i className="fas fa-circle text-primary"></i>
                </div>
                <div className="flex-grow-1">
                  <div className="card">
                    <div className="card-body">
                      <h6 className="mb-1">{entry.action}</h6>
                      <p className="mb-1 text-muted">{entry.description}</p>
                      <small className="text-muted">
                        <i className="fas fa-user me-1"></i>
                        {entry.updatedBy?.name || 'System'} •{' '}
                        <i className="fas fa-clock me-1"></i>
                        {new Date(entry.createdAt).toLocaleString()}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const QuotationTab: React.FC<{ order: any; onUpdate: () => void }> = ({ order, onUpdate }) => {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [salesOrders, setSalesOrders] = useState<any[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<any | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'quotations' | 'sales-orders' | 'purchase-orders'>('quotations');

  useEffect(() => {
    if (order && (order._id || order.id)) {
      fetchQuotations();
      fetchSalesOrders();
      fetchPurchaseOrders();
    }
  }, [order]);

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const response = await apiService.quotations.getQuotationsByBooking(order._id || order.id);
      if (response.success && response.data) {
        setQuotations(response.data);
      }
    } catch (error) {
      console.error('Error fetching quotations:', error);
      toast.error('Failed to load quotations');
    } finally {
      setLoading(false);
    }
  };

  const handleShareQuotation = async (quotationId: string) => {
    try {
      const response = await apiService.quotations.shareQuotation(quotationId);
      if (response.success) {
        toast.success('Quotation shared successfully');
        fetchQuotations();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to share quotation');
    }
  };

  const handleApproveQuotation = async (quotationId: string) => {
    try {
      const response = await apiService.quotations.approveQuotation(quotationId);
      if (response.success) {
        toast.success('Quotation approved successfully');
        fetchQuotations();
        onUpdate();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve quotation');
    }
  };

  const handleRejectQuotation = async (quotationId: string) => {
    const reason = prompt('Please provide a reason for rejection (optional):');
    try {
      const response = await apiService.quotations.rejectQuotation(quotationId, reason || undefined);
      if (response.success) {
        toast.success('Quotation rejected');
        fetchQuotations();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject quotation');
    }
  };

  const fetchSalesOrders = async () => {
    try {
      const response = await apiService.salesOrders.getSalesOrdersByBooking(order._id || order.id);
      if (response.success && response.data) {
        setSalesOrders(response.data);
      }
    } catch (error) {
      console.error('Error fetching sales orders:', error);
    }
  };

  const fetchPurchaseOrders = async () => {
    try {
      const response = await apiService.purchaseOrders.getPurchaseOrdersByBooking(order._id || order.id);
      if (response.success && response.data) {
        setPurchaseOrders(response.data);
      }
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
    }
  };

  const handleCreateSalesOrder = async (quotationId: string) => {
    try {
      const response = await apiService.salesOrders.createSalesOrder({ quotationId });
      if (response.success) {
        toast.success('Sales Order created successfully');
        fetchSalesOrders();
        onUpdate();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create sales order');
    }
  };

  const handleCreatePurchaseOrder = async (salesOrderId: string, providerId: string) => {
    // This would typically open a modal to select provider and add items
    // For now, simplified version
    try {
      const salesOrder = salesOrders.find(so => so._id === salesOrderId);
      if (!salesOrder) {
        toast.error('Sales order not found');
        return;
      }

      const response = await apiService.purchaseOrders.createPurchaseOrder({
        salesOrderId,
        providerId,
        items: salesOrder.items || [],
        subtotal: salesOrder.subtotal || salesOrder.totalAmount,
        totalAmount: salesOrder.totalAmount
      });
      if (response.success) {
        toast.success('Purchase Order created successfully');
        fetchPurchaseOrders();
        onUpdate();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create purchase order');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6>Quotations & Orders</h6>
        <button 
          className="btn btn-primary btn-sm"
          onClick={() => setShowCreateModal(true)}
        >
          <i className="fas fa-plus me-2"></i>
          Create Quotation
        </button>
      </div>

      {/* Sub-tabs */}
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button
            className={`nav-link ${activeSubTab === 'quotations' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('quotations')}
          >
            Quotations ({quotations.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeSubTab === 'sales-orders' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('sales-orders')}
          >
            Sales Orders ({salesOrders.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeSubTab === 'purchase-orders' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('purchase-orders')}
          >
            Purchase Orders ({purchaseOrders.length})
          </button>
        </li>
      </ul>

      {/* Quotations Sub-tab */}
      {activeSubTab === 'quotations' && (
        <>
      {quotations.length === 0 ? (
        <div className="text-center py-4 text-muted">
          <i className="fas fa-file-invoice fa-2x mb-2"></i>
          <p>No quotations created yet</p>
          <button 
            className="btn btn-primary btn-sm mt-2"
            onClick={() => setShowCreateModal(true)}
          >
            Create First Quotation
          </button>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Quotation #</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Valid Until</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quotations.map((quotation: any) => (
                <tr key={quotation._id}>
                  <td><strong>{quotation.quotationNumber}</strong></td>
                  <td>₹{quotation.totalAmount?.toLocaleString() || 0}</td>
                  <td>
                    <span className={`badge ${
                      quotation.status === 'approved' ? 'bg-success' :
                      quotation.status === 'rejected' ? 'bg-danger' :
                      quotation.status === 'expired' ? 'bg-secondary' :
                      'bg-warning'
                    }`}>
                      {quotation.status || 'pending'}
                    </span>
                  </td>
                  <td>
                    {quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString() : 'N/A'}
                  </td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <button
                        className="btn btn-outline-primary"
                        onClick={() => setSelectedQuotation(quotation)}
                        title="View Details"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      {quotation.status === 'shared' && (
                        <>
                          <button
                            className="btn btn-outline-success"
                            onClick={() => handleApproveQuotation(quotation._id)}
                            title="Approve"
                          >
                            <i className="fas fa-check"></i>
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleRejectQuotation(quotation._id)}
                            title="Reject"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </>
                      )}
                      <button
                        className="btn btn-outline-info"
                        onClick={() => handleShareQuotation(quotation._id)}
                        title="Share"
                      >
                        <i className="fas fa-share"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
        </>
      )}

      {/* Sales Orders Sub-tab */}
      {activeSubTab === 'sales-orders' && (
        <div>
          {salesOrders.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <i className="fas fa-file-contract fa-2x mb-2"></i>
              <p>No sales orders created yet</p>
              <p className="small">Convert an approved quotation to create a sales order</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>SO #</th>
                    <th>Total Amount</th>
                    <th>Advance</th>
                    <th>Balance</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {salesOrders.map((so: any) => (
                    <tr key={so._id}>
                      <td><strong>{so.salesOrderNumber}</strong></td>
                      <td>₹{so.totalAmount?.toLocaleString()}</td>
                      <td>₹{(so.advanceAmount || 0).toLocaleString()}</td>
                      <td>₹{(so.balanceAmount || 0).toLocaleString()}</td>
                      <td>
                        <span className={`badge ${
                          so.status === 'completed' ? 'bg-success' :
                          so.status === 'cancelled' ? 'bg-danger' :
                          'bg-warning'
                        }`}>
                          {so.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleCreatePurchaseOrder(so._id, order.assignedVendor || '')}
                        >
                          Create PO
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Purchase Orders Sub-tab */}
      {activeSubTab === 'purchase-orders' && (
        <div>
          {purchaseOrders.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <i className="fas fa-shopping-cart fa-2x mb-2"></i>
              <p>No purchase orders created yet</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>PO #</th>
                    <th>Provider</th>
                    <th>Total Amount</th>
                    <th>Advance</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseOrders.map((po: any) => (
                    <tr key={po._id}>
                      <td><strong>{po.purchaseOrderNumber}</strong></td>
                      <td>{po.providerId?.name || 'N/A'}</td>
                      <td>₹{po.totalAmount?.toLocaleString()}</td>
                      <td>₹{(po.advanceAmount || 0).toLocaleString()}</td>
                      <td>
                        <span className={`badge ${
                          po.status === 'acknowledged' ? 'bg-success' :
                          po.status === 'cancelled' ? 'bg-danger' :
                          'bg-warning'
                        }`}>
                          {po.status}
                        </span>
                      </td>
                      <td>
                        {po.status === 'sent' && (
                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={async () => {
                              try {
                                const response = await apiService.purchaseOrders.acknowledgePurchaseOrder(po._id);
                                if (response.success) {
                                  toast.success('PO acknowledged');
                                  fetchPurchaseOrders();
                                }
                              } catch (error: any) {
                                toast.error(error.message || 'Failed to acknowledge PO');
                              }
                            }}
                          >
                            Acknowledge
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showCreateModal && (
        <CreateQuotationModal
          order={order}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchQuotations();
            onUpdate();
          }}
        />
      )}

      {selectedQuotation && (
        <QuotationDetailsModal
          quotation={selectedQuotation}
          onClose={() => setSelectedQuotation(null)}
          onCreateSO={() => {
            handleCreateSalesOrder(selectedQuotation._id);
            setSelectedQuotation(null);
          }}
        />
      )}
    </div>
  );
};

const FinancialTab: React.FC<{ order: any; onUpdate: () => void }> = ({ order, onUpdate }) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [totals, setTotals] = useState({ customerPaid: 0, providerPaid: 0 });
  const [loading, setLoading] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionType, setTransactionType] = useState<string>('');

  useEffect(() => {
    if (order && (order._id || order.id)) {
      fetchTransactions();
    }
  }, [order]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await apiService.financialTransactions.getTransactionsByBooking(order._id || order.id);
      if (response.success && response.data) {
        setTransactions(response.data.transactions || []);
        setTotals(response.data.totals || { customerPaid: 0, providerPaid: 0 });
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = (type: string) => {
    setTransactionType(type);
    setShowTransactionModal(true);
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6>Financial Transactions</h6>
        <div className="btn-group">
          <button
            className="btn btn-success btn-sm"
            onClick={() => handleAddTransaction('customer_advance')}
          >
            <i className="fas fa-plus me-2"></i>
            Customer Advance
          </button>
          <button
            className="btn btn-info btn-sm"
            onClick={() => handleAddTransaction('provider_advance')}
          >
            <i className="fas fa-plus me-2"></i>
            Provider Advance
          </button>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card border-primary">
            <div className="card-body text-center">
              <h6 className="text-muted">Customer Paid</h6>
              <h4 className="text-primary">₹{totals.customerPaid.toLocaleString()}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-success">
            <div className="card-body text-center">
              <h6 className="text-muted">Balance Due</h6>
              <h4 className="text-success">
                ₹{Math.max(0, (order.totalAmount || 0) - totals.customerPaid).toLocaleString()}
              </h4>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-warning">
            <div className="card-body text-center">
              <h6 className="text-muted">Provider Paid</h6>
              <h4 className="text-warning">₹{totals.providerPaid.toLocaleString()}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-info">
            <div className="card-body text-center">
              <h6 className="text-muted">Total Amount</h6>
              <h4 className="text-info">₹{(order.totalAmount || 0).toLocaleString()}</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices and Bills Section */}
      <div className="row mb-4">
        <div className="col-md-6">
          <h6 className="mb-2">Invoices</h6>
          <InvoicesList order={order} />
        </div>
        <div className="col-md-6">
          <h6 className="mb-2">Bills</h6>
          <BillsList order={order} />
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-4 text-muted">
          <i className="fas fa-money-bill-wave fa-2x mb-2"></i>
          <p>No transactions recorded yet</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Transaction #</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Date</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn: any) => (
                <tr key={txn._id}>
                  <td><strong>{txn.transactionNumber}</strong></td>
                  <td>
                    <span className={`badge ${
                      txn.transactionType?.includes('customer') ? 'bg-primary' : 'bg-info'
                    }`}>
                      {txn.transactionType?.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td>₹{txn.amount?.toLocaleString()}</td>
                  <td>{txn.paymentMethod}</td>
                  <td>{txn.transactionDate ? new Date(txn.transactionDate).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    {txn.receiptNumber && (
                      <span className="badge bg-secondary">{txn.receiptNumber}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showTransactionModal && (
        <TransactionModal
          order={order}
          transactionType={transactionType}
          onClose={() => setShowTransactionModal(false)}
          onSuccess={() => {
            setShowTransactionModal(false);
            fetchTransactions();
            onUpdate();
          }}
        />
      )}
    </div>
  );
};

const DocumentsTab: React.FC<{ order: any; onUpdate: () => void }> = ({ order, onUpdate }) => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    if (order && (order._id || order.id)) {
      fetchDocuments();
    }
  }, [order]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await apiService.documents.getDocumentsByBooking(order._id || order.id);
      if (response.success && response.data) {
        setDocuments(response.data);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const response = await apiService.documents.deleteDocument(documentId);
      if (response.success) {
        toast.success('Document deleted successfully');
        fetchDocuments();
        onUpdate();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete document');
    }
  };

  const handleDownloadDocument = async (documentId: string, fileName: string) => {
    try {
      const blob = await apiService.documents.getDocumentFile(documentId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      toast.error(error.message || 'Failed to download document');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6>Documents ({documents.length})</h6>
        <button 
          className="btn btn-primary btn-sm"
          onClick={() => setShowUploadModal(true)}
        >
          <i className="fas fa-upload me-2"></i>
          Upload Document
        </button>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-4 text-muted">
          <i className="fas fa-file-upload fa-2x mb-2"></i>
          <p>No documents uploaded yet</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Document Name</th>
                <th>Type</th>
                <th>Uploaded By</th>
                <th>Date</th>
                <th>Physical Copy</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc: any) => (
                <tr key={doc._id}>
                  <td>{doc.documentName}</td>
                  <td>
                    <span className="badge bg-secondary">{doc.documentType}</span>
                  </td>
                  <td>{doc.uploadedBy?.name || 'N/A'}</td>
                  <td>{doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    {doc.isPhysicalCopy ? (
                      <span className="badge bg-info">
                        <i className="fas fa-file-alt me-1"></i>
                        {doc.physicalCopyLocation || 'Yes'}
                      </span>
                    ) : (
                      <span className="badge bg-success">Digital</span>
                    )}
                  </td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <button
                        className="btn btn-outline-primary"
                        onClick={() => handleDownloadDocument(doc._id, doc.documentName)}
                        title="Download"
                      >
                        <i className="fas fa-download"></i>
                      </button>
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => handleDeleteDocument(doc._id)}
                        title="Delete"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showUploadModal && (
        <DocumentUploadModal
          order={order}
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
            fetchDocuments();
            onUpdate();
          }}
        />
      )}
    </div>
  );
};

export default OrderManagement;

