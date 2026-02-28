require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

const swaggerSpec = require('./swagger');
const { handleError, notFoundHandler } = require('./middlewares/errorHandler');
const { sendSuccess } = require('./utils/apiResponse');

const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:']
    }
  },
  crossOriginEmbedderPolicy: false
}));

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count']
};
app.use(cors(corsOptions));

const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: { status: 'error', message: 'Too many requests, please try again later', data: null },
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { status: 'error', message: 'Too many authentication attempts, please try again later', data: null },
  standardHeaders: true,
  legacyHeaders: false
});

const adminLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  message: { status: 'error', message: 'Too many admin requests, please try again later', data: null }
});

app.use(generalLimiter);

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/api/v1/health', (req, res) => {
  return sendSuccess(res, {
    message: 'API is healthy',
    data: {
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0'
    }
  });
});

app.get('/api/v1', (req, res) => {
  return sendSuccess(res, {
    message: 'E-Commerce API v1',
    data: {
      documentation: '/api/v1/docs',
      health: '/api/v1/health'
    }
  });
});

app.get('/api/v1/docs.json', (req, res) => res.json(swaggerSpec));
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const authRoutes = require('./routes/authRoutes');
app.use('/api/v1/auth', authLimiter, authRoutes);

app.use('/api/v1/categories', require('./routes/categoryRoutes'));
app.use('/api/v1/products', require('./routes/productRoutes'));
app.use('/api/v1/addresses', require('./routes/addressRoutes'));
app.use('/api/v1/cart', require('./routes/cartRoutes'));
app.use('/api/v1/orders', require('./routes/orderRoutes'));
app.use('/api/v1/payments', require('./routes/paymentRoutes'));
app.use('/api/v1/invoices', require('./routes/invoiceRoutes'));
app.use('/api/v1/preferences', require('./routes/userPreferenceRoutes'));
app.use('/api/v1/profile', require('./routes/userProfileRoutes'));

app.use('/api/v1/admin', adminLimiter, require('./routes/admin/user.admin.routes'));
app.use('/api/v1/admin', adminLimiter, require('./routes/admin/product.admin.routes'));
app.use('/api/v1/admin', adminLimiter, require('./routes/admin/category.admin.routes'));
app.use('/api/v1/admin', adminLimiter, require('./routes/admin/inventory.admin.routes'));
app.use('/api/v1/admin', adminLimiter, require('./routes/admin/order.admin.routes'));
app.use('/api/v1/admin', adminLimiter, require('./routes/admin/payment.admin.routes'));
app.use('/api/v1/admin', adminLimiter, require('./routes/admin/invoice.admin.routes'));

app.use(notFoundHandler);
app.use(handleError);

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

module.exports = app;
