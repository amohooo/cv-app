const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const sequelize = require('./config/database');
const authRoutes = require('./routes/auth');
const pageRoutes = require('./routes/pages');
const sectionRoutes = require('./routes/sections');
const cardRoutes = require('./routes/cards');
const uploadRoutes = require('./routes/upload');
const auth = require('./middleware/auth');
const path = require('path');

// Load environment variables
dotenv.config();

// Verify environment variables
console.log('Server Configuration:');
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not Set');
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);

const app = express();

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  console.error('Error stack:', err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.ALLOWED_ORIGIN || '*'] 
    : ['http://localhost:8808', 'http://localhost:3000', 'http://localhost:80', 'http://localhost'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(cookieParser());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
    }
  }
}));

// Test route
app.get('/api/test', (req, res) => {
  console.log('Test route hit');
  res.json({ message: 'Server is working!' });
});

// Public routes
app.use('/api/auth', authRoutes);

// Public page routes
app.use('/api/pages', pageRoutes);

// Protected routes
app.use('/api/sections', auth, sectionRoutes);
app.use('/api/cards', auth, cardRoutes);
app.use('/api/upload', auth, uploadRoutes);

// Routes will be added here
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to your CV API!' });
});

// Start server
const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Test endpoint available at: http://localhost:${PORT}/api/test`);
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please choose a different port.`);
  } else {
    console.error('Server error:', error);
    console.error('Server error stack:', error.stack);
  }
});

// Database connection
sequelize.authenticate()
  .then(() => {
    console.log('Database connected successfully');
    // The sync is now handled in models/index.js
  })
  .catch(err => {
    console.error('Database connection error:', err);
    console.error('Database error stack:', err.stack);
  });