const express = require('express');
const router = express.Router();
const { Card, Section, Page } = require('../models');
const auth = require('../middleware/auth');

// Get all cards for a section
router.get('/section/:sectionId', async (req, res) => {
  try {
    console.log('Fetching cards for section:', req.params.sectionId);
    const cards = await Card.findAll({
      where: { sectionId: req.params.sectionId },
      order: [['order', 'ASC']]
    });
    console.log(`Found ${cards.length} cards for section ${req.params.sectionId}`);
    res.json(cards);
  } catch (error) {
    console.error('Error fetching cards:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create a new card
router.post('/', auth, async (req, res) => {
  try {
    console.log('Creating new card:', req.body);
    
    // Check if the section exists and user has permission
    const section = await Section.findByPk(req.body.sectionId);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }
    
    // Check if the page exists and user has permission
    const page = await Page.findByPk(section.pageId);
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    
    // Master admin can create cards in any section, regular admin can only create in their own pages
    if (!req.admin.isMasterAdmin() && page.adminId !== req.admin.id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    const card = await Card.create(req.body);
    
    // Fetch the created card
    const createdCard = await Card.findByPk(card.id);
    
    // Fetch the updated page with all its sections and cards
    const updatedPage = await Page.findByPk(section.pageId, {
      include: [
        {
          model: Section,
          include: [{
            model: Card,
            order: [['order', 'ASC']]
          }],
          order: [['order', 'ASC']]
        },
        {
          model: require('../models').Admin,
          as: 'Admin',
          attributes: ['id', 'username', 'role']
        }
      ]
    });
    
    console.log('Card created:', card.id, 'by admin:', req.admin.username);
    res.status(201).json({ card: createdCard, page: updatedPage });
  } catch (error) {
    console.error('Error creating card:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update a card
router.put('/:id', auth, async (req, res) => {
  try {
    console.log('Updating card:', req.params.id);
    const card = await Card.findByPk(req.params.id);
    if (!card) {
      console.log('Card not found:', req.params.id);
      return res.status(404).json({ message: 'Card not found' });
    }
    
    // Check if the section exists and user has permission
    const section = await Section.findByPk(card.sectionId);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }
    
    // Check if the page exists and user has permission
    const page = await Page.findByPk(section.pageId);
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    
    // Master admin can update cards in any section, regular admin can only update in their own pages
    if (!req.admin.isMasterAdmin() && page.adminId !== req.admin.id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    await card.update(req.body);
    
    // Fetch the updated card
    const updatedCard = await Card.findByPk(card.id);
    
    // Fetch the updated page with all its sections and cards
    const updatedPage = await Page.findByPk(section.pageId, {
      include: [
        {
          model: Section,
          include: [{
            model: Card,
            order: [['order', 'ASC']]
          }],
          order: [['order', 'ASC']]
        },
        {
          model: require('../models').Admin,
          as: 'Admin',
          attributes: ['id', 'username', 'role']
        }
      ]
    });
    
    console.log('Card updated:', req.params.id, 'by admin:', req.admin.username);
    res.json({ card: updatedCard, page: updatedPage });
  } catch (error) {
    console.error('Error updating card:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete a card
router.delete('/:id', auth, async (req, res) => {
  try {
    console.log('Deleting card:', req.params.id);
    const card = await Card.findByPk(req.params.id);
    if (!card) {
      console.log('Card not found:', req.params.id);
      return res.status(404).json({ message: 'Card not found' });
    }
    
    // Check if the section exists and user has permission
    const section = await Section.findByPk(card.sectionId);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }
    
    // Check if the page exists and user has permission
    const page = await Page.findByPk(section.pageId);
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    
    // Master admin can delete cards in any section, regular admin can only delete in their own pages
    if (!req.admin.isMasterAdmin() && page.adminId !== req.admin.id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    const sectionId = card.sectionId;
    await card.destroy();
    
    // Fetch the updated page with all its sections and cards
    const updatedPage = await Page.findByPk(section.pageId, {
      include: [
        {
          model: Section,
          include: [{
            model: Card,
            order: [['order', 'ASC']]
          }],
          order: [['order', 'ASC']]
        },
        {
          model: require('../models').Admin,
          as: 'Admin',
          attributes: ['id', 'username', 'role']
        }
      ]
    });
    
    console.log('Card deleted:', req.params.id, 'by admin:', req.admin.username);
    res.json({ message: 'Card deleted successfully', page: updatedPage });
  } catch (error) {
    console.error('Error deleting card:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 