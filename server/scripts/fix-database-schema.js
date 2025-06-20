const sequelize = require('../config/database');

async function fixDatabaseSchema() {
  try {
    // Test the connection
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Add missing columns to admins table
    console.log('Adding missing columns to admins table...');
    try {
      await sequelize.query(`
        ALTER TABLE admins 
        ADD COLUMN role ENUM('master', 'admin') NOT NULL DEFAULT 'admin',
        ADD COLUMN email VARCHAR(255) UNIQUE,
        ADD COLUMN isActive BOOLEAN NOT NULL DEFAULT TRUE
      `);
      console.log('✓ Added role, email, and isActive columns to admins table');
    } catch (error) {
      if (error.message.includes('Duplicate column name')) {
        console.log('✓ Columns already exist in admins table');
      } else {
        console.error('Error adding columns to admins table:', error.message);
      }
    }

    // Add missing columns to pages table
    console.log('Adding missing columns to pages table...');
    try {
      await sequelize.query(`
        ALTER TABLE pages 
        ADD COLUMN adminId INT,
        ADD CONSTRAINT fk_pages_admin 
        FOREIGN KEY (adminId) REFERENCES admins(id) ON DELETE CASCADE
      `);
      console.log('✓ Added adminId column to pages table');
    } catch (error) {
      if (error.message.includes('Duplicate column name')) {
        console.log('✓ adminId column already exists in pages table');
      } else {
        console.error('Error adding adminId to pages table:', error.message);
      }
    }

    // Update existing pages to belong to the first admin (or create one if none exists)
    console.log('Updating existing pages with adminId...');
    try {
      // Get the first admin (or create one if none exists)
      const [admins] = await sequelize.query('SELECT id FROM admins LIMIT 1');
      
      if (admins.length === 0) {
        console.log('No admin found, creating default admin...');
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash('Hmhzalk123!@#$', 10);
        
        const [result] = await sequelize.query(`
          INSERT INTO admins (username, password, role, email, isActive, createdAt, updatedAt)
          VALUES ('admin', ?, 'master', 'imhaom@gmail.com', TRUE, NOW(), NOW())
        `, { replacements: [hashedPassword] });
        
        const adminId = result.insertId;
        console.log(`✓ Created default admin with ID: ${adminId}`);
        
        // Update all pages to belong to this admin
        await sequelize.query(`
          UPDATE pages SET adminId = ? WHERE adminId IS NULL
        `, { replacements: [adminId] });
        console.log('✓ Updated all pages to belong to default admin');
      } else {
        const adminId = admins[0].id;
        console.log(`✓ Found existing admin with ID: ${adminId}`);
        
        // Update pages that don't have adminId
        const [result] = await sequelize.query(`
          UPDATE pages SET adminId = ? WHERE adminId IS NULL
        `, { replacements: [adminId] });
        
        if (result.affectedRows > 0) {
          console.log(`✓ Updated ${result.affectedRows} pages to belong to admin ${adminId}`);
        } else {
          console.log('✓ All pages already have adminId assigned');
        }
      }
    } catch (error) {
      console.error('Error updating pages with adminId:', error.message);
    }

    console.log('Database schema fix completed successfully!');
  } catch (error) {
    console.error('Error fixing database schema:', error);
    console.error('Error stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

fixDatabaseSchema(); 