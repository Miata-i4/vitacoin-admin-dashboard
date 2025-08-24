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

// Replace your current CORS configuration with this:
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://vitacoin-admin-dashboard-frontend.vercel.app', // Your frontend URL
    'https://*.vercel.app' // Allow all Vercel apps
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// Route imports
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

// Health check
app.get('/', (req, res) => res.json({ 
  message: 'Vitacoin Backend API running',
  version: '1.0.0',
  environment: process.env.NODE_ENV || 'development',
  endpoints: [
    '/api/users',
    '/api/transactions', 
    '/api/reward-configs',
    '/api/activities',
    '/api/stats',
    '/api/demo'
  ]
}));

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
