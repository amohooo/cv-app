const express = require('express');
const router = express.Router();
const { Page, Section, Card } = require('../models');
const auth = require('../middleware/auth');

// Get all pages (public route - no auth required for viewing)
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all pages (public)');
    
    const pages = await Page.findAll({
      include: [
        {
          model: Section,
          include: [Card]
        },
        {
          model: require('../models').Admin,
          as: 'Admin',
          attributes: ['id', 'username', 'role']
        }
      ]
    });
    console.log('Pages found:', pages.length);
    res.json(pages);
  } catch (error) {
    console.error('Error fetching pages:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Error fetching pages', error: error.message });
  }
});

// Get page by slug (public route - no auth required)
router.get('/slug/:slug', async (req, res) => {
  try {
    console.log('Fetching page by slug:', req.params.slug);
    const page = await Page.findOne({
      where: { slug: req.params.slug },
      include: [{
        model: Section,
        include: [Card]
      }]
    });
    
    if (!page) {
      console.log('Page not found for slug:', req.params.slug);
      return res.status(404).json({ message: 'Page not found' });
    }
    
    console.log('Page found:', page.title);
    res.json(page);
  } catch (error) {
    console.error('Error fetching page by slug:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Error fetching page', error: error.message });
  }
});

// Get a single page (public route - no auth required for viewing)
router.get('/:id', async (req, res) => {
  try {
    const page = await Page.findByPk(req.params.id, {
      include: [
        {
          model: Section,
          order: [['order', 'ASC']]
        },
        {
          model: require('../models').Admin,
          as: 'Admin',
          attributes: ['id', 'username', 'role']
        }
      ]
    });
    
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }
    
    res.json(page);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new page (requires auth)
router.post('/', auth, async (req, res) => {
  try {
    console.log('Creating new page:', req.body);
    
    // Add the admin ID to the page
    const pageData = {
      ...req.body,
      adminId: req.admin.id
    };
    
    const page = await Page.create(pageData);
    
    // Fetch the created page with Admin information
    const createdPage = await Page.findByPk(page.id, {
      include: [
        {
          model: Section,
          include: [Card]
        },
        {
          model: require('../models').Admin,
          as: 'Admin',
          attributes: ['id', 'username', 'role']
        }
      ]
    });
    
    console.log('Page created:', page.id, 'by admin:', req.admin.username);
    res.status(201).json(createdPage);
  } catch (error) {
    console.error('Error creating page:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Error creating page', error: error.message });
  }
});

// Update a page (requires auth + ownership or master admin)
router.put('/:id', auth, async (req, res) => {
  try {
    console.log('Updating page:', req.params.id);
    
    // Check if page exists and user has permission
    const existingPage = await Page.findByPk(req.params.id);
    if (!existingPage) {
      return res.status(404).json({ message: 'Page not found' });
    }
    
    // Master admin can edit any page, regular admin can only edit their own
    if (!req.admin.isMasterAdmin() && existingPage.adminId !== req.admin.id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    const [updated] = await Page.update(req.body, {
      where: { id: req.params.id }
    });
    
    if (!updated) {
      console.log('Page not found for update:', req.params.id);
      return res.status(404).json({ message: 'Page not found' });
    }
    
    // Fetch the updated page
    const updatedPage = await Page.findByPk(req.params.id, {
      include: [
        {
          model: Section,
          include: [Card],
          order: [['order', 'ASC']]
        },
        {
          model: require('../models').Admin,
          as: 'Admin',
          attributes: ['id', 'username', 'role']
        }
      ]
    });
    
    console.log('Page updated:', req.params.id, 'by admin:', req.admin.username);
    res.json(updatedPage);
  } catch (error) {
    console.error('Error updating page:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Error updating page', error: error.message });
  }
});

// Delete a page (requires auth + ownership or master admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    console.log('Deleting page:', req.params.id);
    
    // Check if page exists and user has permission
    const existingPage = await Page.findByPk(req.params.id);
    if (!existingPage) {
      return res.status(404).json({ message: 'Page not found' });
    }
    
    // Master admin can delete any page, regular admin can only delete their own
    if (!req.admin.isMasterAdmin() && existingPage.adminId !== req.admin.id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    const deleted = await Page.destroy({
      where: { id: req.params.id }
    });
    
    if (!deleted) {
      console.log('Page not found for deletion:', req.params.id);
      return res.status(404).json({ message: 'Page not found' });
    }
    
    console.log('Page deleted:', req.params.id, 'by admin:', req.admin.username);
    res.json({ message: 'Page deleted successfully' });
  } catch (error) {
    console.error('Error deleting page:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Error deleting page', error: error.message });
  }
});

module.exports = router; 