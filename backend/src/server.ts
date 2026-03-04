import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import session from 'express-session';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth';
import bookingRoutes from './routes/bookings';
import serviceRoutes from './routes/services';
import contactRoutes from './routes/contact';
import adminRoutes from './routes/admin';
import oauthRoutes from './routes/oauth';
import providerRequestsRoutes from './routes/providerRequests';
import quotationRoutes from './routes/quotations';
import salesOrderRoutes from './routes/salesOrders';
import purchaseOrderRoutes from './routes/purchaseOrders';
import financialTransactionRoutes from './routes/financialTransactions';

// Import passport configuration
import passport from './config/passport';

// Import database connection
import connectDB from './config/database';

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet());
app.use(morgan('combined'));

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000', 
  'http://127.0.0.1:3000',
  process.env.FRONTEND_URL,
  // Allow all Render domains
  /^https:\/\/.*\.onrender\.com$/,
  // Allow deployed frontend
  'https://lezit-transports-frontend.onrender.com',
  // Allow custom domain
  'https://www.lezittransports.com',
  'https://lezittransports.com',
  'http://www.lezittransports.com',
  'http://lezittransports.com',
  // Allow Capacitor mobile app origins (for development)
  'capacitor://localhost',
  'ionic://localhost',
  'http://localhost',
  'https://localhost',
  'http://localhost:8080',
  'http://localhost:8100'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin matches any allowed origins
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return allowedOrigin === origin;
      } else if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Session configuration for OAuth
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize passport
app.use(passport.initialize());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    message: 'LEZIT TRANSPORTS API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Email health (verify SendGrid/SMTP config and connection)
app.get('/api/health/email', async (req: Request, res: Response) => {
  try {
    const { getEmailStatus } = await import('./utils/emailService');
    const status = await getEmailStatus();
    res.status(200).json({
      success: true,
      email: status,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err?.message || 'Email status check failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Send a test email (dev only or when EMAIL_TEST_SECRET is set and provided)
app.post('/api/test-email', async (req: Request, res: Response) => {
  const isDev = process.env.NODE_ENV !== 'production';
  const secret = req.body?.secret ?? req.query?.secret;
  const allowed = isDev || (process.env.EMAIL_TEST_SECRET && secret === process.env.EMAIL_TEST_SECRET);
  if (!allowed) {
    res.status(403).json({
      success: false,
      message: 'Not allowed. Use only in development or set EMAIL_TEST_SECRET and pass it in body/query.',
    });
    return;
  }
  const to = req.body?.to ?? req.query?.to;
  if (!to || typeof to !== 'string') {
    res.status(400).json({
      success: false,
      message: 'Provide "to" (email address) in JSON body or query.',
    });
    return;
  }
  try {
    const { sendTestEmail } = await import('./utils/emailService');
    const result = await sendTestEmail(to);
    if (result.success) {
      res.status(200).json({
        success: true,
        message: `Test email sent to ${to}. Check inbox (and spam).`,
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.error || 'Failed to send test email',
      });
    }
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err?.message || 'Test email failed',
    });
  }
});

// Root endpoint - provide basic info or redirect to health
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'LEZIT TRANSPORTS API',
    health: '/health'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', oauthRoutes); // OAuth routes
app.use('/api/bookings', bookingRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/sales-orders', salesOrderRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/financial-transactions', financialTransactionRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/vendor', require('./routes/vendor').default);
app.use('/api/driver', require('./routes/driver').default);
// Provider requests
app.use('/api/provider-requests', providerRequestsRoutes);

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Global error handler:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
});

export default app; 