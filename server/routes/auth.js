const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Admin } = require('../models');
const auth = require('../middleware/auth');

// Login route
router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt for:', req.body.username);
    const { username, password } = req.body;
    
    if (!username || !password) {
      console.log('Missing username or password');
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    const admin = await Admin.findOne({ where: { username } });
    
    if (!admin) {
      console.log('Admin not found:', username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    console.log('Admin found, stored password hash:', admin.password);
    console.log('Attempting to validate password...');
    
    const validPassword = await bcrypt.compare(password, admin.password);
    console.log('Password validation result:', validPassword);
    
    if (!validPassword) {
      console.log('Invalid password for:', username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    console.log('Login successful for:', username);
    res.json({ 
      message: 'Login successful', 
      user: { id: admin.id, username: admin.username, role: admin.role },
      token,
      authenticated: true
    });
  } catch (error) {
    console.error('Error during login:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Error during login', error: error.message });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  try {
    console.log('Logout request');
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Error during logout:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Error during logout', error: error.message });
  }
});

// Check authentication status
router.get('/check', auth, async (req, res) => {
  try {
    console.log('Authentication check successful for user:', req.admin.username);
    res.json({ 
      authenticated: true, 
      user: { 
        id: req.admin.id, 
        username: req.admin.username,
        role: req.admin.role
      } 
    });
  } catch (error) {
    console.error('Error checking authentication:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Error checking authentication', error: error.message });
  }
});

// Get current admin
router.get('/me', auth, async (req, res) => {
  res.json(req.admin);
});

// Public registration route for general admins
router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if username already exists
    const existingAdmin = await Admin.findOne({ where: { username } });
    if (existingAdmin) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingEmail = await Admin.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    // Create new admin (always as regular admin, not master)
    const newAdmin = await Admin.create({
      username,
      password,
      email,
      role: 'admin', // Always create as regular admin
      isActive: true
    });

    console.log('New admin registered:', username);

    res.status(201).json({
      message: 'Registration successful! You can now login.',
      admin: {
        id: newAdmin.id,
        username: newAdmin.username,
        email: newAdmin.email,
        role: newAdmin.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Master admin registration route (only for master admin to register other admins)
router.post('/register-admin', auth, async (req, res) => {
  try {
    // Check if current user is master admin
    if (!req.admin.isMasterAdmin()) {
      return res.status(403).json({ error: 'Only master admin can register other admins' });
    }

    const { username, password, email, role = 'admin' } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Check if username already exists
    const existingAdmin = await Admin.findOne({ where: { username } });
    if (existingAdmin) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingEmail = await Admin.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    // Create new admin
    const newAdmin = await Admin.create({
      username,
      password,
      email,
      role: role === 'master' ? 'admin' : role // Prevent creating master admins
    });

    console.log('New admin registered:', username, 'by master admin:', req.admin.username);

    res.status(201).json({
      message: 'Admin registered successfully',
      admin: {
        id: newAdmin.id,
        username: newAdmin.username,
        email: newAdmin.email,
        role: newAdmin.role,
        isActive: newAdmin.isActive
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all admins (only master admin can see all)
router.get('/admins', auth, async (req, res) => {
  try {
    if (!req.admin.isMasterAdmin()) {
      return res.status(403).json({ error: 'Only master admin can view all admins' });
    }

    const admins = await Admin.findAll({
      attributes: ['id', 'username', 'email', 'role', 'isActive', 'createdAt', 'updatedAt'],
      order: [['createdAt', 'DESC']]
    });

    res.json(admins);
  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update admin (master admin can update any, regular admin can only update themselves)
router.put('/admins/:id', auth, async (req, res) => {
  try {
    const targetAdmin = await Admin.findByPk(req.params.id);
    if (!targetAdmin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    // Check permissions
    if (!req.admin.canManageAdmin(targetAdmin)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { username, email, isActive, role } = req.body;
    const updateData = {};

    // Regular admins can only update their own basic info
    if (!req.admin.isMasterAdmin()) {
      if (username) updateData.username = username;
      if (email) updateData.email = email;
    } else {
      // Master admin can update everything except role (for security)
      if (username) updateData.username = username;
      if (email) updateData.email = email;
      if (typeof isActive === 'boolean') updateData.isActive = isActive;
      // Prevent changing role to master for security
    }

    await targetAdmin.update(updateData);

    res.json({
      message: 'Admin updated successfully',
      admin: {
        id: targetAdmin.id,
        username: targetAdmin.username,
        email: targetAdmin.email,
        role: targetAdmin.role,
        isActive: targetAdmin.isActive
      }
    });
  } catch (error) {
    console.error('Update admin error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete admin (only master admin can delete)
router.delete('/admins/:id', auth, async (req, res) => {
  try {
    if (!req.admin.isMasterAdmin()) {
      return res.status(403).json({ error: 'Only master admin can delete admins' });
    }

    const targetAdmin = await Admin.findByPk(req.params.id);
    if (!targetAdmin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    // Prevent deleting self
    if (targetAdmin.id === req.admin.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // Prevent deleting master admins
    if (targetAdmin.isMasterAdmin()) {
      return res.status(400).json({ error: 'Cannot delete master admin accounts' });
    }

    await targetAdmin.destroy();

    console.log('Admin deleted:', targetAdmin.username, 'by master admin:', req.admin.username);

    res.json({ message: 'Admin deleted successfully' });
  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Change password
router.post('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const admin = req.admin;

    console.log('Password change attempt for user:', admin.username);
    console.log('Current password provided:', !!currentPassword);
    console.log('New password provided:', !!newPassword);

    const isPasswordValid = await bcrypt.compare(currentPassword, admin.password);
    console.log('Current password validation result:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('Current password validation failed');
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    console.log('Current password validated successfully');
    console.log('Original password hash:', admin.password);

    // Hash the new password manually to avoid any model hook issues
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);
    
    // Update the password directly in the database
    await Admin.update(
      { password: hashedNewPassword },
      { 
        where: { id: admin.id },
        individualHooks: false // Disable hooks to prevent double hashing
      }
    );

    console.log('Password updated successfully');
    console.log('New password hash:', hashedNewPassword);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    console.error('Change password error stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 