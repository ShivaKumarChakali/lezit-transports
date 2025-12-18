# 🧪 LEZIT Transports - Step-by-Step Testing Guide

## 🚀 Pre-Testing Setup

### 1. Start Backend Server
```bash
cd backend
npm run dev
```
**Expected:** Server running on `http://localhost:5001` (or configured port)

### 2. Start Frontend Server
```bash
cd frontend
npm start
```
**Expected:** Frontend running on `http://localhost:3000`

### 3. Login as Admin
- Navigate to `http://localhost:3000/login`
- Login with admin credentials
- You should see the Admin Dashboard

---

## 📋 Complete Workflow Test

### **Test 1: Create New Order (PRIMARY Status)**

**Steps:**
1. Navigate to **Admin Dashboard**
2. Click **"Order Management"** tab
3. Click **"New Order"** button (top right)
4. Fill in booking form:
   - Service Type: Person/Goods
   - Pickup Location: "123 Main St, City"
   - Drop Location: "456 Park Ave, City"
   - Pickup Date: Select future date
   - Pickup Time: "10:00 AM"
   - Total Amount: 5000
   - Contact Phone: Your test phone
   - Source Platform: Select "website"
5. Click **"Create Booking"**

**Expected Results:**
- ✅ Booking created successfully
- ✅ Order ID generated (format: `ORD-YYYYMMDD-XXXX`)
- ✅ Status shows as **"Primary"** (blue badge)
- ✅ Timeline shows "Order Created" entry
- ✅ Order appears in Order Management list

**Verify:**
- Go to Order Management → Click on the new order
- Check Details Tab → Order ID should be visible
- Check Timeline Tab → Should show "Order Created" entry

---

### **Test 2: Update Order Details (UPDATED Status)**

**Steps:**
1. In Order Details view, go to **Details Tab**
2. Click **"Edit Details"** button
3. Modify:
   - Pickup Location: "789 New St, City"
   - Special Instructions: "Handle with care"
4. Click **"Save Changes"**

**Expected Results:**
- ✅ Order updated successfully
- ✅ Status may change to **"Updated"** (yellow badge)
- ✅ Timeline shows "Order Details Updated" entry

**Verify:**
- Details Tab shows updated information
- Timeline Tab shows update entry

---

### **Test 3: Create Quotation (QUOTATION_SHARED Status)**

**Steps:**
1. In Order Details, go to **Quotations Tab**
2. Click **"Create Quotation"** button
3. Fill quotation form:
   - Add Items:
     - Item 1: Description "Transportation Service", Quantity: 1, Price: 4000
     - Item 2: Description "Handling Charges", Quantity: 1, Price: 1000
   - Taxes: 500 (or auto-calculate)
   - Discount: 0
   - Valid Until: Select date (7 days from now)
   - Terms: "Payment terms: 50% advance, 50% on completion"
4. Click **"Create Quotation"**

**Expected Results:**
- ✅ Quotation created successfully
- ✅ Quotation Number generated (format: `QUO-YYYYMM-XXXXX`)
- ✅ Status changes to **"Quotation Shared"** (blue badge)
- ✅ Timeline shows "Quotation Created" entry
- ✅ Quotation appears in Quotations list

**Verify:**
- Quotations Tab shows new quotation
- Quotation status is "shared" or "pending"
- Timeline shows quotation creation

---

### **Test 4: Share Quotation**

**Steps:**
1. In Quotations Tab, find the quotation
2. Click **"Share"** icon button
3. (If modal appears) Enter customer email/phone
4. Click **"Share"**

**Expected Results:**
- ✅ Quotation shared successfully
- ✅ Email sent (if email configured)
- ✅ Timeline entry created

---

### **Test 5: Approve Quotation (CONFIRMED Status)**

**Steps:**
1. In Quotations Tab, find the quotation
2. Click **"Approve"** button (green checkmark)
3. Confirm approval

**Expected Results:**
- ✅ Quotation status changes to **"Approved"** (green badge)
- ✅ Order status changes to **"Confirmed"** (green badge)
- ✅ Timeline shows "Quotation Approved" entry
- ✅ "Create Sales Order" button appears in quotation details

**Verify:**
- Order status badge shows "Confirmed"
- Timeline shows approval entry

---

### **Test 6: Create Sales Order (IN_PROGRESS Status)**

**Steps:**
1. In Quotations Tab, click quotation row to view details
2. Click **"Create Sales Order"** button (in modal or quotation detail view)
3. If advance amount prompt appears, enter: 2000 (or 50% of total)
4. Click **"Create Sales Order"**

**Expected Results:**
- ✅ Sales Order created successfully
- ✅ Sales Order Number generated (format: `SO-YYYYMM-XXXXX`)
- ✅ Order status changes to **"In Progress"** (blue spinner badge)
- ✅ Timeline shows "Sales Order Created" entry
- ✅ Sales Order appears in "Sales Orders" sub-tab

**Verify:**
- Quotations Tab → Sales Orders Sub-tab shows new SO
- Order status shows "In Progress"
- Timeline shows SO creation

---

### **Test 7: Record Customer Advance Payment**

**Steps:**
1. Go to **Financial Tab**
2. Click **"Customer Advance"** button
3. Fill transaction form:
   - Amount: 2000
   - Payment Method: Select "UPI" or "Bank Transfer"
   - Payment Reference: "TXN123456"
   - Description: "Advance payment for transportation"
4. Click **"Record Transaction"**

**Expected Results:**
- ✅ Transaction recorded successfully
- ✅ Transaction Number generated (format: `TXN-YYYYMMDD-XXXXX`)
- ✅ Financial summary shows "Customer Paid: ₹2000"
- ✅ Balance Due updated
- ✅ Timeline shows "Transaction Recorded" entry

**Verify:**
- Financial Tab shows transaction in list
- Summary cards updated
- Timeline shows transaction entry

---

### **Test 8: Create Purchase Order**

**Steps:**
1. Go to **Quotations Tab** → **Sales Orders Sub-tab**
2. Find the Sales Order created
3. Click **"Create PO"** button
4. Fill PO form (if modal appears):
   - Provider: Select a vendor/provider
   - Items: Auto-filled from Sales Order
   - Total Amount: 4000
   - Advance Amount: 1500
5. Click **"Create Purchase Order"**

**Expected Results:**
- ✅ Purchase Order created successfully
- ✅ PO Number generated (format: `PO-YYYYMM-XXXXX`)
- ✅ Timeline shows "Purchase Order Created" entry
- ✅ PO appears in "Purchase Orders" sub-tab

**Verify:**
- Quotations Tab → Purchase Orders Sub-tab shows new PO
- Timeline shows PO creation

---

### **Test 9: Record Provider Advance Payment**

**Steps:**
1. Go to **Financial Tab**
2. Click **"Provider Advance"** button
3. Fill transaction form:
   - Amount: 1500
   - Payment Method: "Bank Transfer"
   - Payment Reference: "PROV123456"
   - Description: "Provider advance payment"
4. Click **"Record Transaction"**

**Expected Results:**
- ✅ Transaction recorded
- ✅ "Provider Paid" summary shows ₹1500
- ✅ Timeline updated

---

### **Test 10: Upload Document**

**Steps:**
1. Go to **Documents Tab**
2. Click **"Upload Document"** button
3. Fill form:
   - Document Type: Select "Receipt"
   - File: Upload a test image/PDF
   - Document Name: "Advance Payment Receipt"
   - Description: "Customer advance payment receipt"
   - Physical Copy: Check if physical copy exists
4. Click **"Upload Document"**

**Expected Results:**
- ✅ Document uploaded successfully
- ✅ Document appears in documents list
- ✅ Timeline shows "Document Uploaded" entry

**Verify:**
- Documents Tab shows uploaded document
- Can download/view document

---

### **Test 11: Complete Service (PENDING_PAYMENT Status)**

**Steps:**
1. Go to **Quotations Tab** → **Sales Orders Sub-tab**
2. Find the Sales Order
3. If there's a status update option, change status to "completed"
4. OR manually update order status to "pending_payment"

**Alternative:**
- Go to Order Details → Use status dropdown (if available)
- Change status to "Pending Payment"

**Expected Results:**
- ✅ Order status changes to **"Pending Payment"** (yellow badge)
- ✅ Timeline shows status change
- ✅ Financial Tab shows balance amount

**Verify:**
- Status badge shows "Pending Payment"
- Financial summary shows balance due

---

### **Test 12: Generate Invoice**

**Steps:**
1. Navigate to Sales Order details
2. Look for **"Generate Invoice"** button
3. Click to generate invoice
4. OR use Financial Tab → Invoices section

**Expected Results:**
- ✅ Invoice generated (format: `INV-YYYYMM-XXXXX`)
- ✅ Invoice appears in Invoices list
- ✅ Invoice can be sent to customer

**Note:** Invoice generation might be automated when service completes, or manual via API.

---

### **Test 13: Generate Bill**

**Steps:**
1. Navigate to Purchase Order details
2. Look for **"Generate Bill"** button
3. Click to generate bill
4. OR use Financial Tab → Bills section

**Expected Results:**
- ✅ Bill generated (format: `BILL-YYYYMM-XXXXX`)
- ✅ Bill appears in Bills list
- ✅ Bill can be sent to provider

---

### **Test 14: Record Customer Balance Payment**

**Steps:**
1. Go to **Financial Tab**
2. Calculate balance: Total Amount - Advance Paid = Balance
3. Click **"Customer Advance"** button (or look for "Balance Payment" option)
4. Fill transaction form:
   - Amount: Remaining balance (e.g., 3000)
   - Payment Method: "UPI"
   - Payment Reference: "BAL789012"
   - Description: "Final payment"
5. Click **"Record Transaction"**

**Expected Results:**
- ✅ Balance payment recorded
- ✅ "Customer Paid" equals "Total Amount"
- ✅ Balance Due = ₹0
- ✅ Timeline updated

**Verify:**
- Financial Tab shows all transactions
- Summary shows full payment received

---

### **Test 15: Record Provider Balance Payment**

**Steps:**
1. Go to **Financial Tab**
2. Click **"Provider Advance"** button
3. Fill transaction form:
   - Amount: Remaining balance to provider
   - Payment Method: "Bank Transfer"
   - Payment Reference: "PROVBAL789"
   - Description: "Final payment to provider"
4. Click **"Record Transaction"**

**Expected Results:**
- ✅ Provider balance payment recorded
- ✅ All provider dues cleared

---

### **Test 16: Submit Feedback (PENDING_FEEDBACK Status)**

**Steps:**
1. Look for Feedback section in Order Details
2. OR navigate to customer/feedback page
3. Fill feedback form:
   - Rating: 5 stars (or select)
   - Comment: "Great service, on time delivery"
   - Categories: Select relevant categories
4. Click **"Submit Feedback"**

**Expected Results:**
- ✅ Feedback submitted successfully
- ✅ Order status changes to **"Pending Feedback"** (gray badge) or **"Completed"** (green badge)
- ✅ Timeline shows "Feedback Submitted" entry

**Verify:**
- Feedback appears in feedback section
- Status updated accordingly

---

### **Test 17: Complete Order (COMPLETED Status)**

**Steps:**
1. If status is "Pending Feedback", wait for both customer and provider feedback
2. OR manually change status to "Completed"

**Expected Results:**
- ✅ Order status: **"Completed"** (green checkmark badge)
- ✅ Timeline shows "Order Completed" entry
- ✅ Order appears in "Completed" filter

**Verify:**
- Status badge shows "Completed"
- All tabs show complete data
- Timeline shows complete journey

---

## ✅ Final Verification Checklist

After completing all steps, verify:

- [ ] Order ID exists and is unique
- [ ] Timeline shows all steps chronologically
- [ ] Quotation created and approved
- [ ] Sales Order created
- [ ] Purchase Order created
- [ ] All financial transactions recorded
- [ ] Customer and provider payments tracked separately
- [ ] Invoice generated
- [ ] Bill generated
- [ ] Documents uploaded and accessible
- [ ] Feedback collected
- [ ] Final status is "Completed"
- [ ] All documents have unique IDs

---

## 🔍 Troubleshooting

### Issue: Cannot create booking
- **Check:** Backend server is running
- **Check:** Admin is logged in
- **Check:** Network tab for API errors

### Issue: Quotation not showing
- **Check:** Refresh the page
- **Check:** API response in Network tab
- **Check:** Quotations tab is selected

### Issue: Status not updating
- **Check:** Timeline for status change entries
- **Check:** Browser console for errors
- **Try:** Manual status update via Details tab

### Issue: Financial transactions not calculating
- **Check:** Transaction types are correct (advance vs balance)
- **Check:** API response contains totals
- **Check:** Financial Tab summary cards

---

## 📞 API Testing (Optional)

If you want to test APIs directly:

```bash
# Set your auth token
TOKEN="your_jwt_token_here"

# Create Booking
curl -X POST http://localhost:5001/api/bookings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceType": "person",
    "serviceCategory": "taxi",
    "pickupLocation": "123 Main St",
    "dropLocation": "456 Park Ave",
    "pickupDate": "2024-12-10",
    "pickupTime": "10:00",
    "totalAmount": 5000,
    "contactPhone": "+1234567890",
    "sourcePlatform": "website"
  }'
```

---

## 🎉 Success Criteria

Your workflow test is successful if:

1. ✅ All status transitions work smoothly
2. ✅ All documents are generated with unique IDs
3. ✅ Financial transactions are tracked correctly
4. ✅ Timeline shows complete order journey
5. ✅ No errors in browser console
6. ✅ All tabs load data correctly
7. ✅ Final status is "Completed"

---

**Ready to test? Start with Test 1 and work through sequentially!** 🚀

