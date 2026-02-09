require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

const { handleError, notFoundHandler } = require('./middlewares/errorHandler');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count']
};
app.use(cors(corsOptions));

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: {
    success: false,
    error: { message: 'Too many requests, please try again later' }
  },
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per 15 minutes
  message: {
    success: false,
    error: { message: 'Too many authentication attempts, please try again later' }
  },
  standardHeaders: true,
  legacyHeaders: false
});

const adminLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: {
    success: false,
    error: { message: 'Too many admin requests, please try again later' }
  }
});

// Apply general rate limiting to all routes
app.use(generalLimiter);

// Request logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API version info
app.get('/api/v1', (req, res) => {
  res.json({
    success: true,
    message: 'E-Commerce API v1',
    documentation: '/api/v1/docs',
    health: '/health'
  });
});

// Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/v1/auth', authLimiter, authRoutes);

const categoryRoutes = require('./routes/categoryRoutes');
app.use('/api/v1/categories', categoryRoutes);

const productRoutes = require('./routes/productRoutes');
app.use('/api/v1/products', productRoutes);

const addressRoutes = require('./routes/addressRoutes');
app.use('/api/v1/addresses', addressRoutes);

const cartRoutes = require('./routes/cartRoutes');
app.use('/api/v1/cart', cartRoutes);

const orderRoutes = require('./routes/orderRoutes');
app.use('/api/v1/orders', orderRoutes);

const paymentRoutes = require('./routes/paymentRoutes');
app.use('/api/v1/payments', paymentRoutes);

const invoiceRoutes = require('./routes/invoiceRoutes');
app.use('/api/v1/invoices', invoiceRoutes);

const userPreferenceRoutes = require('./routes/userPreferenceRoutes');
app.use('/api/v1/preferences', userPreferenceRoutes);

const userProfileRoutes = require('./routes/userProfileRoutes');
app.use('/api/v1/profile', userProfileRoutes);

// Admin routes with stricter rate limiting
app.use('/api/v1/admin', adminLimiter, require('./routes/admin/user.admin.routes'));
app.use('/api/v1/admin', adminLimiter, require('./routes/admin/product.admin.routes'));
app.use('/api/v1/admin', adminLimiter, require('./routes/admin/category.admin.routes'));
app.use('/api/v1/admin', adminLimiter, require('./routes/admin/inventory.admin.routes'));
app.use('/api/v1/admin', adminLimiter, require('./routes/admin/order.admin.routes'));
app.use('/api/v1/admin', adminLimiter, require('./routes/admin/payment.admin.routes'));
app.use('/api/v1/admin', adminLimiter, require('./routes/admin/invoice.admin.routes'));

// Handle 404 for undefined routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(handleError);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
