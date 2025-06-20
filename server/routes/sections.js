const express = require('express');
const router = express.Router();
const { Section, Card, Page } = require('../models');
const auth = require('../middleware/auth');

// Get all sections for a page
router.get('/page/:pageId', async (req, res) => {
  try {
    const sections = await Section.findAll({
      where: { pageId: req.params.pageId },
      include: [Card],
      order: [['order', 'ASC']]
    });
    res.json(sections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new section
router.post('/', auth, async (req, res) => {
  try {
    console.log('Creating new section:', req.body);
    
    // Check if the page exists and user has permission
    const page = await Page.findByPk(req.body.pageId);
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    
    // Master admin can create sections in any page, regular admin can only create in their own pages
    if (!req.admin.isMasterAdmin() && page.adminId !== req.admin.id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    const section = await Section.create(req.body);
    
    // Fetch the created section with its cards
    const createdSection = await Section.findByPk(section.id, {
      include: [Card],
      order: [['order', 'ASC']]
    });
    
    // Fetch the updated page with its sections and cards
    const pageId = req.body.pageId;
    const updatedPage = await Page.findByPk(pageId, {
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
    
    console.log('Section created:', section.id, 'by admin:', req.admin.username);
    res.status(201).json({ 
      section: createdSection, 
      page: updatedPage 
    });
  } catch (error) {
    console.error('Error creating section:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update a section
router.put('/:id', auth, async (req, res) => {
  try {
    console.log('Updating section:', req.params.id);
    const section = await Section.findByPk(req.params.id);
    if (!section) {
      console.log('Section not found:', req.params.id);
      return res.status(404).json({ message: 'Section not found' });
    }
    
    // Check if the page exists and user has permission
    const page = await Page.findByPk(section.pageId);
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    
    // Master admin can update sections in any page, regular admin can only update in their own pages
    if (!req.admin.isMasterAdmin() && page.adminId !== req.admin.id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    await section.update(req.body);
    
    // Fetch the updated section with its cards
    const updatedSection = await Section.findByPk(section.id, {
      include: [Card],
      order: [['order', 'ASC']]
    });
    
    // Fetch the updated page with its sections and cards
    const pageId = section.pageId;
    const updatedPage = await Page.findByPk(pageId, {
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
    
    console.log('Section updated:', req.params.id, 'by admin:', req.admin.username);
    res.json({ 
      section: updatedSection, 
      page: updatedPage 
    });
  } catch (error) {
    console.error('Error updating section:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete a section
router.delete('/:id', auth, async (req, res) => {
  try {
    console.log('Deleting section:', req.params.id);
    const section = await Section.findByPk(req.params.id);
    if (!section) {
      console.log('Section not found:', req.params.id);
      return res.status(404).json({ message: 'Section not found' });
    }
    
    // Check if the page exists and user has permission
    const page = await Page.findByPk(section.pageId);
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    
    // Master admin can delete sections in any page, regular admin can only delete in their own pages
    if (!req.admin.isMasterAdmin() && page.adminId !== req.admin.id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    const pageId = section.pageId;
    await section.destroy();
    
    // Fetch the updated page with its sections and cards
    const updatedPage = await Page.findByPk(pageId, {
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
    
    console.log('Section deleted:', req.params.id, 'by admin:', req.admin.username);
    res.json({ message: 'Section deleted successfully', page: updatedPage });
  } catch (error) {
    console.error('Error deleting section:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 