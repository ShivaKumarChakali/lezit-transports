# ⚡ Quick Start - Testing the Complete Workflow

## 🚀 Start Servers (If Not Running)

### 1. Start Backend
```bash
cd backend
npm run dev
```
✅ Backend should start on `http://localhost:5001`

### 2. Start Frontend (Already Running!)
✅ Frontend is running on `http://localhost:3000`

---

## 📊 Complete Workflow Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    ORDER LIFECYCLE FLOW                         │
└─────────────────────────────────────────────────────────────────┘

1. PRIMARY (Order Intake)
   │
   ├─> Create Booking
   ├─> Order ID Generated: ORD-YYYYMMDD-XXXX
   └─> Source Platform Tracked

2. UPDATED (Order Validation)
   │
   ├─> Update Order Details
   ├─> Validate Information
   └─> Add Special Instructions

3. QUOTATION_SHARED (Quotation Creation)
   │
   ├─> Create Quotation
   ├─> Quotation Number: QUO-YYYYMM-XXXXX
   ├─> Share via Email/WhatsApp
   └─> Send to Customer

4. CONFIRMED (Customer Approval)
   │
   ├─> Customer Approves Quotation
   └─> Order Confirmed

5. IN_PROGRESS (Service Execution)
   │
   ├─> Create Sales Order (SO-YYYYMM-XXXXX)
   ├─> Record Customer Advance Payment
   ├─> Create Purchase Order (PO-YYYYMM-XXXXX)
   ├─> Record Provider Advance Payment
   └─> Service in Progress

6. PENDING_PAYMENT (Service Complete)
   │
   ├─> Generate Invoice (INV-YYYYMM-XXXXX)
   ├─> Generate Bill (BILL-YYYYMM-XXXXX)
   ├─> Record Customer Balance Payment
   └─> Record Provider Balance Payment

7. PENDING_FEEDBACK (Payment Complete)
   │
   ├─> Customer Feedback
   └─> Provider Feedback (optional)

8. COMPLETED (Order Closed)
   │
   └─> All Steps Complete
```

---

## 🎯 Testing Steps (In Order)

### Step 1: Login & Navigate
1. Open `http://localhost:3000`
2. Login as **Admin**
3. Click **"Admin Dashboard"** → **"Order Management"** tab

### Step 2: Create Order
- Click **"New Order"** button
- Fill booking form and submit
- ✅ Verify: Order ID generated, Status = "Primary"

### Step 3: Create Quotation
- Click on the order
- Go to **"Quotations"** tab
- Click **"Create Quotation"**
- Add items, set prices, create quotation
- ✅ Verify: Quotation number generated, Status = "Quotation Shared"

### Step 4: Approve Quotation
- In Quotations tab, click **"Approve"** button
- ✅ Verify: Status = "Confirmed"

### Step 5: Create Sales Order
- View quotation details, click **"Create Sales Order"**
- Enter advance amount (optional)
- ✅ Verify: Sales Order created, Status = "In Progress"

### Step 6: Record Payments
- Go to **"Financial"** tab
- Click **"Customer Advance"** → Record payment
- Click **"Provider Advance"** → Record payment
- ✅ Verify: Payments appear in transaction list

### Step 7: Complete Service
- Update Sales Order status to "completed" (if option available)
- OR manually change order status to "Pending Payment"
- ✅ Verify: Status = "Pending Payment"

### Step 8: Final Payments
- In Financial tab, record balance payments
- ✅ Verify: All dues cleared

### Step 9: Submit Feedback
- Submit customer feedback
- ✅ Verify: Status = "Pending Feedback" or "Completed"

### Step 10: Verify Completion
- Check Timeline tab - should show all steps
- Check Financial tab - all payments recorded
- ✅ Verify: Status = "Completed"

---

## 🔍 Quick Verification Points

After each major step, check:

1. **Timeline Tab** - Should show new entry
2. **Status Badge** - Should reflect current status
3. **Financial Tab** - Payments should be visible
4. **Documents Tab** - Documents should be accessible

---

## 📋 Status Colors Reference

- 🔵 **Primary** - Blue (Order received)
- 🟡 **Updated** - Yellow (Order validated)
- 🔵 **Quotation Shared** - Blue (Quotation sent)
- 🟢 **Confirmed** - Green (Quotation approved)
- 🔵 **In Progress** - Blue spinner (Service ongoing)
- 🟡 **Pending Payment** - Yellow (Awaiting payment)
- ⚪ **Pending Feedback** - Gray (Awaiting feedback)
- 🟢 **Completed** - Green checkmark (Order closed)
- 🔴 **Cancelled** - Red (Order cancelled)

---

## 🐛 Common Issues & Solutions

### "Cannot connect to backend"
→ Check if backend is running: `lsof -ti:5001`

### "Authentication failed"
→ Check if logged in as admin

### "Status not updating"
→ Refresh page or check Timeline for changes

### "Quotation not appearing"
→ Check browser console for API errors

---

**Ready? Start with Step 1! 🚀**

For detailed instructions, see `TESTING_GUIDE.md`

