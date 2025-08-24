require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const User = require('./models/User');
const Transaction = require('./models/Transaction');
const RewardConfig = require('./models/RewardConfig');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Enhanced CORS configuration for deployment
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://vitacoin-admin-dashboard-frontend.vercel.app',
    'https://*.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Enhanced MongoDB connection with connection pooling and retry logic
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4, // Use IPv4, skip trying IPv6
  maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
  heartbeatFrequencyMS: 10000, // Check connection every 10 seconds
})
.then(() => {
  console.log('MongoDB connected successfully with connection pooling');
  console.log('Connection state:', mongoose.connection.readyState);
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
  console.error('Connection string used:', process.env.MONGO_URI ? 'Set' : 'Not set');
});

// Handle MongoDB connection events
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected! Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected successfully');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('connected', () => {
  console.log('MongoDB connected event fired');
});

// Route imports with error handling
try {
  const userRoutes = require('./routes/users');
  const transactionRoutes = require('./routes/transactions');
  const rewardConfigRoutes = require('./routes/rewardConfig');
  const activityRoutes = require('./routes/activities');
  const statsRoutes = require('./routes/stats');
  const demoRoutes = require('./routes/demo');

  // Routes
  app.use('/api/users', userRoutes);
  app.use('/api/transactions', transactionRoutes);
  app.use('/api/reward-configs', rewardConfigRoutes);
  app.use('/api/activities', activityRoutes);
  app.use('/api/stats', statsRoutes);
  app.use('/api/demo', demoRoutes);
} catch (error) {
  console.error('Error loading routes:', error);
}

// Health check endpoint
app.get('/', (req, res) => {
  const connectionState = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  res.json({ 
    message: 'Vitacoin Backend API running',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    mongodb: {
      status: states[connectionState] || 'unknown',
      readyState: connectionState
    },
    endpoints: [
      '/api/users',
      '/api/transactions', 
      '/api/reward-configs',
      '/api/activities',
      '/api/stats',
      '/api/demo'
    ]
  });
});

// Database connection check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const connectionState = mongoose.connection.readyState;
    if (connectionState === 1) {
      // Try a simple database operation
      const userCount = await User.countDocuments();
      res.json({
        status: 'healthy',
        database: 'connected',
        userCount: userCount,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        status: 'unhealthy',
        database: 'disconnected',
        connectionState: connectionState,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  // Handle specific MongoDB errors
  if (err.name === 'MongooseError' || err.name === 'MongoError') {
    return res.status(503).json({ 
      error: 'Database connection error',
      message: 'Unable to connect to database. Please try again later.',
      type: 'database_error'
    });
  }
  
  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      message: err.message,
      type: 'validation_error'
    });
  }
  
  // Generic error response
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
    type: 'server_error'
  });
});

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableRoutes: [
      'GET /',
      'GET /api/health',
      'GET /api/users',
      'POST /api/users',
      'GET /api/transactions',
      'POST /api/transactions',
      'GET /api/reward-configs',
      'PUT /api/reward-configs/:activityType',
      'POST /api/demo/initialize',
      'POST /api/demo/simulate-activity',
      'POST /api/demo/simulate-purchase'
    ]
  });
});

// Graceful shutdown handling
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`MongoDB URI configured: ${process.env.MONGO_URI ? 'Yes' : 'No'}`);
});
