const jwt = require('jsonwebtoken');
const { Admin } = require('../models');

const auth = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    let token;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      console.log('No token found in request headers');
      return res.status(401).json({ 
        message: 'Authentication required',
        error: 'No token provided'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const admin = await Admin.findByPk(decoded.id);
      
      if (!admin) {
        console.log('Admin not found for id:', decoded.id);
        return res.status(401).json({ 
          message: 'Authentication failed',
          error: 'User not found'
        });
      }

      // Attach admin to request
      req.admin = admin;
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ 
        message: 'Invalid token',
        error: 'Token verification failed'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      message: 'Authentication error',
      error: 'Internal server error'
    });
  }
};

module.exports = auth; 