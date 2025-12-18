# Database Setup Guide - Production

## 🎯 Overview

This guide explains how to ensure all database collections (tables) exist in production.

## 📋 Automatic Setup (Recommended)

**The database collections are automatically created when the server starts!**

The server automatically:
1. Connects to MongoDB
2. Initializes all models
3. Creates all indexes
4. Verifies collections exist

**Just start the server and all tables will be created automatically!**

```bash
npm start
# or
npm run dev
```

## 🔧 Manual Setup (Optional)

If you want to explicitly initialize the database before starting the server:

### For Development:
```bash
npm run init-db
```

### For Production:
```bash
npm run build
npm run init-db:prod
```

## 📊 Collections Created

The following collections (tables) will be created:

1. **users** - User accounts (customers, admins, vendors, drivers)
2. **bookings** - Booking/order records
3. **services** - Transportation services
4. **vehicles** - Vendor vehicles
5. **timelines** - Activity log/order history
6. **quotations** - Quotation records
7. **salesorders** - Sales order records
8. **purchaseorders** - Purchase order records
9. **financialtransactions** - Payment transactions
10. **invoices** - Customer invoices
11. **bills** - Provider bills
12. **documents** - Uploaded documents
13. **feedbacks** - Customer and provider feedback

## 🔍 Verify Collections

When the server starts in production mode, it will automatically verify and log the status of all collections:

```
📊 Database Collections Status:
  ✅ users
  ✅ bookings
  ✅ services
  ✅ vehicles
  ✅ timelines
  ✅ quotations
  ✅ salesorders
  ✅ purchaseorders
  ✅ financialtransactions
  ✅ invoices
  ✅ bills
  ✅ documents
  ✅ feedbacks
```

## ⚠️ Important Notes

1. **MongoDB automatically creates collections** when data is first inserted
2. **Indexes are created** automatically when models are used
3. **No manual table creation needed** - Mongoose handles everything
4. **The initialization script** just ensures indexes exist early

## 🚀 Deployment Checklist

- [ ] Set `MONGODB_URI` environment variable in production
- [ ] Deploy code to production
- [ ] Start the server (collections will be created automatically)
- [ ] Verify logs show "✅ All models initialized successfully"
- [ ] Check collection status in production logs

## 🔄 Migration from Test to Production

If you have data in test and want to ensure production has the same structure:

1. **Export indexes from test** (optional):
   ```bash
   mongodump --uri="your-test-uri" --collection=users --out=./backup
   ```

2. **Start production server** - it will create all collections and indexes automatically

3. **Import data** (if needed):
   ```bash
   mongorestore --uri="your-production-uri" ./backup
   ```

## 📝 Environment Variables

Make sure these are set in production:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lezit-transports?retryWrites=true&w=majority
NODE_ENV=production
```

## ✅ Troubleshooting

**Problem**: Collections not appearing in production

**Solution**: 
1. Check `MONGODB_URI` is correct
2. Check MongoDB connection logs
3. Check if indexes are being created (check server logs)
4. Collections will be created on first data insert if auto-init fails

**Problem**: Index creation errors

**Solution**:
- Index errors are non-fatal
- Collections will still work
- Indexes will be created when data is inserted
- Check logs for specific index errors

## 🎉 Summary

**You don't need to do anything special!** Just:
1. Set `MONGODB_URI` in production
2. Start the server
3. All collections and indexes will be created automatically

The system is designed to work out of the box! 🚀

