const bcrypt = require('bcrypt');
const sequelize = require('../config/database');
const { Admin, Page } = require('../models');

async function setupMasterAdmin() {
  try {
    // Test the connection
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Find or create master admin
    let masterAdmin = await Admin.findOne({ where: { username: 'admin' } });
    
    if (!masterAdmin) {
      console.log('Creating master admin...');
      const hashedPassword = await bcrypt.hash('Hmhzalk123!@#$', 10);
      masterAdmin = await Admin.create({
        username: 'admin',
        password: hashedPassword,
        role: 'master',
        email: 'imhaom@gmail.com',
        isActive: true
      });
      console.log('Master admin created with username: admin, password: admin123');
    } else {
      console.log('Updating existing admin to master role...');
      await masterAdmin.update({
        role: 'master',
        isActive: true
      });
      console.log('Admin updated to master role');
    }

    // Update existing pages to belong to master admin
    console.log('Updating existing pages to belong to master admin...');
    const pages = await Page.findAll();
    
    for (const page of pages) {
      if (!page.adminId) {
        await page.update({ adminId: masterAdmin.id });
        console.log(`Updated page "${page.title}" to belong to master admin`);
      }
    }

    console.log('Master admin setup completed successfully.');
    console.log('Master admin details:');
    console.log('- Username:', masterAdmin.username);
    console.log('- Role:', masterAdmin.role);
    console.log('- Email:', masterAdmin.email);
    console.log('- Active:', masterAdmin.isActive);
    
  } catch (error) {
    console.error('Error setting up master admin:', error);
    console.error('Error stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

setupMasterAdmin(); 