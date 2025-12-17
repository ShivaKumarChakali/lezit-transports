/**
 * Utility functions for generating unique IDs for various documents
 */

/**
 * Generate unique Order ID (format: ORD-YYYYMMDD-XXXX)
 */
export const generateOrderId = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD-${year}${month}${day}-${random}`;
};

/**
 * Generate unique Quotation Number (format: QUO-YYYYMM-XXXXX)
 */
export const generateQuotationNumber = async (Quotation: any): Promise<string> => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const prefix = `QUO-${year}${month}`;
  
  // Find the latest quotation number for this month
  const latest = await Quotation.findOne({
    quotationNumber: new RegExp(`^${prefix}-`)
  }).sort({ quotationNumber: -1 });
  
  let sequence = 1;
  if (latest) {
    const latestSeq = parseInt(latest.quotationNumber.split('-')[2] || '0');
    sequence = latestSeq + 1;
  }
  
  return `${prefix}-${String(sequence).padStart(5, '0')}`;
};

/**
 * Generate unique Sales Order Number (format: SO-YYYYMM-XXXXX)
 */
export const generateSalesOrderNumber = async (SalesOrder: any): Promise<string> => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const prefix = `SO-${year}${month}`;
  
  const latest = await SalesOrder.findOne({
    salesOrderNumber: new RegExp(`^${prefix}-`)
  }).sort({ salesOrderNumber: -1 });
  
  let sequence = 1;
  if (latest) {
    const latestSeq = parseInt(latest.salesOrderNumber.split('-')[2] || '0');
    sequence = latestSeq + 1;
  }
  
  return `${prefix}-${String(sequence).padStart(5, '0')}`;
};

/**
 * Generate unique Purchase Order Number (format: PO-YYYYMM-XXXXX)
 */
export const generatePurchaseOrderNumber = async (PurchaseOrder: any): Promise<string> => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const prefix = `PO-${year}${month}`;
  
  const latest = await PurchaseOrder.findOne({
    purchaseOrderNumber: new RegExp(`^${prefix}-`)
  }).sort({ purchaseOrderNumber: -1 });
  
  let sequence = 1;
  if (latest) {
    const latestSeq = parseInt(latest.purchaseOrderNumber.split('-')[2] || '0');
    sequence = latestSeq + 1;
  }
  
  return `${prefix}-${String(sequence).padStart(5, '0')}`;
};

/**
 * Generate unique Invoice Number (format: INV-YYYYMM-XXXXX)
 */
export const generateInvoiceNumber = async (Invoice: any): Promise<string> => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const prefix = `INV-${year}${month}`;
  
  const latest = await Invoice.findOne({
    invoiceNumber: new RegExp(`^${prefix}-`)
  }).sort({ invoiceNumber: -1 });
  
  let sequence = 1;
  if (latest) {
    const latestSeq = parseInt(latest.invoiceNumber.split('-')[2] || '0');
    sequence = latestSeq + 1;
  }
  
  return `${prefix}-${String(sequence).padStart(5, '0')}`;
};

/**
 * Generate unique Bill Number (format: BILL-YYYYMM-XXXXX)
 */
export const generateBillNumber = async (Bill: any): Promise<string> => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const prefix = `BILL-${year}${month}`;
  
  const latest = await Bill.findOne({
    billNumber: new RegExp(`^${prefix}-`)
  }).sort({ billNumber: -1 });
  
  let sequence = 1;
  if (latest) {
    const latestSeq = parseInt(latest.billNumber.split('-')[2] || '0');
    sequence = latestSeq + 1;
  }
  
  return `${prefix}-${String(sequence).padStart(5, '0')}`;
};

/**
 * Generate unique Transaction Number (format: TXN-YYYYMMDD-XXXXX)
 */
export const generateTransactionNumber = async (FinancialTransaction: any): Promise<string> => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const prefix = `TXN-${year}${month}${day}`;
  
  const latest = await FinancialTransaction.findOne({
    transactionNumber: new RegExp(`^${prefix}-`)
  }).sort({ transactionNumber: -1 });
  
  let sequence = 1;
  if (latest) {
    const latestSeq = parseInt(latest.transactionNumber.split('-')[2] || '0');
    sequence = latestSeq + 1;
  }
  
  return `${prefix}-${String(sequence).padStart(5, '0')}`;
};

/**
 * Generate unique Receipt Number (format: RCP-YYYYMM-XXXXX)
 */
export const generateReceiptNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `RCP-${year}${month}-${random}`;
};

