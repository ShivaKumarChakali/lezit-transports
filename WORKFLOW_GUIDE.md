# 📋 LEZIT Transports - Complete Order Workflow Guide

## 🎯 Order Lifecycle Flow

```
1. PRIMARY → 2. UPDATED → 3. QUOTATION_SHARED → 4. CONFIRMED 
→ 5. IN_PROGRESS → 6. PENDING_PAYMENT → 7. PENDING_FEEDBACK → 8. COMPLETED
```

---

## 📝 Detailed Workflow Steps

### **Step 1: Order Intake (PRIMARY)**
**Status:** `primary`

**What happens:**
- Customer/Admin creates a booking through:
  - Website form
  - Phone call (admin creates on behalf)
  - Email/WhatsApp (admin creates on behalf)
  - Mobile app
  - Social media (Facebook, Instagram, LinkedIn)
  - Direct office visit

**System Actions:**
- ✅ Unique Order ID generated (e.g., `ORD-20241201-0001`)
- ✅ Source platform tracked
- ✅ Timeline entry created: "Order Created"
- ✅ Confirmation email sent (if configured)

**UI Location:** 
- Admin Dashboard → Order Management → View Order Details

---

### **Step 2: Order Validation & Update (UPDATED)**
**Status:** `updated`

**What happens:**
- Admin validates order details
- Updates pickup/drop locations if needed
- Adds/modifies special instructions
- Confirms customer details

**System Actions:**
- ✅ Booking details updated
- ✅ Timeline entry created: "Order Details Updated"
- ✅ Status changes to `updated` (manual or automatic)

**UI Location:**
- Order Management → Order Details Tab → Click "Edit Details"

---

### **Step 3: Create & Share Quotation (QUOTATION_SHARED)**
**Status:** `quotation_shared`

**What happens:**
- Admin searches for service provider/vendor
- Creates quotation with:
  - Service items (description, quantity, price)
  - Subtotal, taxes, discount
  - Total amount
  - Valid until date
- Shares quotation via:
  - Email
  - WhatsApp
  - SMS

**System Actions:**
- ✅ Quotation Number generated (e.g., `QUO-202412-00001`)
- ✅ Quotation status: `draft` → `shared`
- ✅ Booking status changes to `quotation_shared`
- ✅ Timeline entry: "Quotation Created & Shared"
- ✅ Email sent to customer (if configured)

**UI Location:**
- Order Management → Order Details → Quotations Tab → "Create Quotation"
- Share via "Share" button in quotation list

---

### **Step 4: Customer Approves Quotation (CONFIRMED)**
**Status:** `confirmed`

**What happens:**
- Customer receives quotation
- Customer approves via:
  - Email link
  - Customer portal
  - Admin updates manually

**System Actions:**
- ✅ Quotation status changes to `approved`
- ✅ Booking status changes to `confirmed`
- ✅ Timeline entry: "Quotation Approved by Customer"

**UI Location:**
- Order Management → Quotations Tab → Click "Approve" on quotation

---

### **Step 5: Create Sales Order & Start Service (IN_PROGRESS)**
**Status:** `in_progress`

**What happens:**
- Admin converts approved quotation to Sales Order
- Records customer advance payment (if any)
- Service execution begins

**System Actions:**
- ✅ Sales Order Number generated (e.g., `SO-202412-00001`)
- ✅ Sales Order created from quotation
- ✅ Booking status changes to `in_progress`
- ✅ Advance payment recorded (if provided)
- ✅ Timeline entry: "Sales Order Created - Service Started"

**UI Location:**
- Order Management → Quotations Tab → View Quotation → "Create Sales Order"
- OR Financial Tab → "Record Customer Advance" (if advance received)

---

### **Step 6: Create Purchase Order for Provider**
**Status:** `in_progress` (continues)

**What happens:**
- Admin creates Purchase Order for service provider/vendor
- Provider acknowledges PO
- Provider receives advance payment (if applicable)

**System Actions:**
- ✅ Purchase Order Number generated (e.g., `PO-202412-00001`)
- ✅ PO created and sent to provider
- ✅ Provider advance payment recorded (if applicable)
- ✅ Timeline entry: "Purchase Order Created & Acknowledged"

**UI Location:**
- Order Management → Quotations Tab → Sales Orders Sub-tab → "Create PO"
- Financial Tab → "Record Provider Advance"

---

### **Step 7: Collect Documents (During Service)**
**Status:** `in_progress` (continues)

**What happens:**
- Upload receipts, acknowledgements, slips
- Track physical documents location
- Link documents to order

**System Actions:**
- ✅ Document uploaded with metadata
- ✅ Document type categorized
- ✅ Physical copy location tracked (if applicable)
- ✅ Timeline entry: "Document Uploaded"

**UI Location:**
- Order Management → Documents Tab → "Upload Document"

---

### **Step 8: Service Completion & Payment (PENDING_PAYMENT)**
**Status:** `pending_payment`

**What happens:**
- Service is completed
- Generate Invoice for customer
- Generate Bill for provider
- Record balance payments
- Send invoices/bills via email

**System Actions:**
- ✅ Invoice Number generated (e.g., `INV-202412-00001`)
- ✅ Bill Number generated (e.g., `BILL-202412-00001`)
- ✅ Invoice sent to customer
- ✅ Bill sent to provider
- ✅ Balance payments recorded
- ✅ Booking status changes to `pending_payment`
- ✅ Timeline entry: "Service Completed - Payment Pending"

**UI Location:**
- Order Management → Financial Tab → View transactions
- Generate Invoice/Bill (if automated) or Financial Tab shows them

---

### **Step 9: Close Financial Dues**
**Status:** `pending_payment` → `pending_feedback`

**What happens:**
- Customer pays final balance
- Provider receives final payment
- All financial transactions recorded
- Receipts generated

**System Actions:**
- ✅ Customer balance payment recorded
- ✅ Provider balance payment recorded
- ✅ All transactions closed
- ✅ Receipts generated
- ✅ Booking status changes to `pending_feedback`
- ✅ Timeline entry: "All Payments Received"

**UI Location:**
- Order Management → Financial Tab → "Record Customer Balance" / "Record Provider Balance"

---

### **Step 10: Collect Feedback (PENDING_FEEDBACK)**
**Status:** `pending_feedback`

**What happens:**
- Customer submits feedback (rating, comments, categories)
- Provider submits feedback (optional)
- Feedback reviewed by admin

**System Actions:**
- ✅ Feedback recorded with rating and comments
- ✅ Feedback categories tracked
- ✅ Timeline entry: "Feedback Submitted"
- ✅ Booking status changes to `completed` when both feedbacks received

**UI Location:**
- Order Management → Feedback section (or separate feedback form)

---

### **Step 11: Order Completed (COMPLETED)**
**Status:** `completed`

**What happens:**
- All steps completed
- All payments received
- All feedback collected
- Order archived

**System Actions:**
- ✅ Booking status: `completed`
- ✅ Final timeline entry: "Order Completed"
- ✅ Order visible in completed orders list

**UI Location:**
- Order Management → Filter by "Completed" status

---

## 🔄 Alternative Flows

### **Cancellation Flow**
At any stage before completion:
- Status changes to `cancelled`
- Timeline entry: "Order Cancelled"
- Cancellation reason recorded
- Refunds processed (if applicable)

### **Quotation Rejection**
- Customer rejects quotation
- Quotation status: `rejected`
- Admin can create new quotation
- Order remains in `primary` or `updated` status

### **Quotation Expiry**
- Quotation expires (validUntil date passed)
- Quotation status: `expired`
- Admin creates new quotation
- Order remains in `quotation_shared` status

---

## 📊 Key Documents Generated

1. **Order ID** - `ORD-YYYYMMDD-XXXX`
2. **Quotation** - `QUO-YYYYMM-XXXXX`
3. **Sales Order** - `SO-YYYYMM-XXXXX`
4. **Purchase Order** - `PO-YYYYMM-XXXXX`
5. **Invoice** - `INV-YYYYMM-XXXXX`
6. **Bill** - `BILL-YYYYMM-XXXXX`
7. **Transaction** - `TXN-YYYYMMDD-XXXXX`
8. **Receipt** - `RCP-YYYYMM-XXXXX`

---

## 🎯 Quick Reference: Status Transitions

| Current Status | Next Possible Status | Trigger Action |
|---------------|---------------------|----------------|
| `primary` | `updated` | Admin updates order details |
| `updated` | `quotation_shared` | Admin creates & shares quotation |
| `quotation_shared` | `confirmed` | Customer approves quotation |
| `quotation_shared` | `primary` | Customer rejects quotation |
| `confirmed` | `in_progress` | Admin creates Sales Order |
| `in_progress` | `pending_payment` | Service completed |
| `pending_payment` | `pending_feedback` | All payments received |
| `pending_feedback` | `completed` | Feedback collected |
| Any (except completed) | `cancelled` | Order cancelled |

---

## 📱 UI Navigation Path

**Admin Dashboard** → **Order Management** → **Select Order** → **Order Details View**

**Tabs Available:**
- **Details** - View/Edit order information
- **Timeline** - View all activities and status changes
- **Quotations** - Create/manage quotations, sales orders, purchase orders
- **Financial** - View transactions, record payments, view invoices/bills
- **Documents** - Upload/download documents

---

## ✅ Testing Checklist

Use this checklist to test the complete workflow:

- [ ] Step 1: Create new booking (order)
- [ ] Step 2: Update order details
- [ ] Step 3: Create quotation
- [ ] Step 4: Share quotation
- [ ] Step 5: Approve quotation
- [ ] Step 6: Create sales order
- [ ] Step 7: Record customer advance payment
- [ ] Step 8: Create purchase order
- [ ] Step 9: Record provider advance payment
- [ ] Step 10: Upload documents
- [ ] Step 11: Complete service (update sales order status)
- [ ] Step 12: Generate invoice
- [ ] Step 13: Generate bill
- [ ] Step 14: Record customer balance payment
- [ ] Step 15: Record provider balance payment
- [ ] Step 16: Submit feedback
- [ ] Step 17: Verify order status is `completed`
- [ ] Step 18: Review complete timeline

