const sequelize = require('../config/database');
const { Page, Section, Card, Admin } = require('../models');

async function initializeDatabase() {
  try {
    // Test the connection
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Drop existing tables if they exist
    await sequelize.query('DROP TABLE IF EXISTS cards');
    await sequelize.query('DROP TABLE IF EXISTS sections');
    await sequelize.query('DROP TABLE IF EXISTS pages');
    await sequelize.query('DROP TABLE IF EXISTS admins');

    // Create tables
    await sequelize.sync({ force: true });
    console.log('All models were synchronized successfully.');

    console.log('Database initialization completed successfully.');
  } catch (error) {
    console.error('Unable to initialize database:', error);
  } finally {
    await sequelize.close();
  }
}

initializeDatabase(); 