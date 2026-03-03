# LEZIT Transports - Full Stack Booking System

A comprehensive transportation booking platform for LEZIT Transports, providing both person and goods transportation services.

## 🚀 Project Overview

LEZIT Transports is a modern, full-stack transportation booking system that allows customers to book various transportation services including vehicle rentals, shuttle services, logistics, and more.

### Key Features
- **User Authentication**: Secure registration and login system
- **Service Booking**: Complete booking lifecycle management
- **Admin Dashboard**: Comprehensive admin interface for managing bookings and services
- **Real-time Updates**: Live booking status updates
- **Payment Integration**: Secure payment processing
- **Responsive Design**: Mobile-first responsive interface
- **Email Notifications**: Automated booking confirmations

## 🏗️ Architecture

```
lezit-transports/
├── frontend/          # React.js TypeScript application
├── backend/           # Node.js Express.js API
├── shared/            # Shared types and utilities
└── docs/             # Project documentation
```

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Hook Form** with Yup validation
- **Axios** for API communication
- **React Toastify** for notifications

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Nodemailer** for email notifications
- **Express Validator** for input validation

### Database
- **MongoDB Atlas** (cloud database)
- **Mongoose** for schema management
- **Indexing** for performance optimization

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account (for production)
- Git

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd lezit-transports
```

### 2. Backend Setup
```bash
cd backend
npm install
cp env.example .env
# Update .env with your configuration
npm run build
npm run seed  # Optional: Seed initial data
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
# Create .env file with REACT_APP_API_URL=http://localhost:5000/api
npm start
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/health

## 📊 Database Schema

### Users Collection
```typescript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  role: 'user' | 'admin',
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Bookings Collection
```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  serviceType: 'person' | 'goods',
  serviceCategory: String,
  pickupLocation: String,
  dropLocation: String,
  pickupDate: Date,
  pickupTime: String,
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled',
  totalAmount: Number,
  paymentStatus: 'pending' | 'paid' | 'failed',
  createdAt: Date,
  updatedAt: Date
}
```

### Services Collection
```typescript
{
  _id: ObjectId,
  name: String,
  category: 'person' | 'goods',
  description: String,
  basePrice: Number,
  pricePerKm: Number,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔐 Authentication

The system uses JWT (JSON Web Tokens) for authentication:

1. **Registration**: Users create accounts with email verification
2. **Login**: Secure login with password hashing
3. **Token Management**: Automatic token refresh and expiration handling
4. **Role-based Access**: User and admin role management

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)

### Services
- `GET /api/services` - Get all services (public)
- `GET /api/services/:id` - Get service by ID (public)
- `POST /api/services` - Create service (admin only)
- `PUT /api/services/:id` - Update service (admin only)
- `DELETE /api/services/:id` - Delete service (admin only)

### Bookings
- `POST /api/bookings` - Create booking (protected)
- `GET /api/bookings/my-bookings` - Get user bookings (protected)
- `GET /api/bookings/:id` - Get booking by ID (protected)
- `PUT /api/bookings/:id/cancel` - Cancel booking (protected)
- `PUT /api/bookings/:id/status` - Update status (admin only)

## 🎨 UI/UX Features

- **Modern Design**: Clean, professional interface
- **Responsive Layout**: Works on all device sizes
- **Loading States**: Smooth loading animations
- **Error Handling**: User-friendly error messages
- **Form Validation**: Real-time validation feedback
- **Toast Notifications**: Success/error notifications

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=bookings@lezittransports.com
FRONTEND_URL=http://localhost:3000
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🚀 Deployment

### Backend Deployment (Railway/Render)
1. Connect your GitHub repository
2. Set environment variables (including email credentials - see below)
3. Deploy automatically

**Important - Email Configuration for Render:**
Render blocks SMTP port 465. We've migrated to port 587 (TLS) for Zoho Mail or SendGrid.
See [RENDER_EMAIL_SETUP.md](./RENDER_EMAIL_SETUP.md) for complete configuration instructions.

### Frontend Deployment (Vercel)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically

### Database Setup
1. Create MongoDB Atlas cluster
2. Configure network access
3. Create database user
4. Update connection string

### Email Service Setup
Choose one:
- **Zoho Mail** (recommended - uses existing emails): Add 4 env vars
- **SendGrid** (alternative): Add 3 env vars

Details: See [RENDER_EMAIL_SETUP.md](./RENDER_EMAIL_SETUP.md)

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 📈 Performance Optimization

- **Database Indexing**: Optimized queries with proper indexes
- **Caching**: Redis caching for frequently accessed data
- **Image Optimization**: Compressed images and lazy loading
- **Code Splitting**: Dynamic imports for better loading
- **CDN**: Content delivery network for static assets

## 🔒 Security Features

- **Password Hashing**: bcryptjs for secure password storage
- **JWT Security**: Secure token management
- **Input Validation**: Comprehensive input sanitization
- **CORS Protection**: Cross-origin resource sharing security
- **Rate Limiting**: API rate limiting to prevent abuse
- **Helmet.js**: Security headers middleware

## 📞 Support

For technical support or questions:
- **Email**: support@lezittransports.com
- **Phone**: +91-XXXXXXXXXX
- **Address**: Hyderabad, India

## 📝 License

This project is licensed under the ISC License.

## 👥 Team

- **Satish Avula** - Founder & Managing Director
- **Anjaneyulu Avula** - Managing Director, Networking
- **Shiva Kumar Chakali** - Developer
- **Saritha Avula** - UI/UX Designer
- **CS Surya Bhargav** - Company Secretary
- **Lokesh Kandela** - Advisor
- **Suhail Taissery** - Advisor

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ User authentication
- ✅ Basic booking system
- ✅ Service management
- ✅ Admin dashboard

### Phase 2 (Next)
- 🔄 Payment integration
- 🔄 Real-time tracking
- 🔄 Mobile app development
- 🔄 Advanced analytics

### Phase 3 (Future)
- 📋 AI-powered pricing
- 📋 Driver management system
- 📋 Fleet management
- 📋 Customer reviews

---

**Built with ❤️ by the LEZIT Transports Team** 