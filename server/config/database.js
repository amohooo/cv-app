const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

console.log('Database Configuration:');
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);

const sequelize = new Sequelize(
  process.env.DB_NAME || 'cv_database',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'Hmhzalk1',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'production' ? false : console.log, // Disable SQL logging in production
    pool: {
      max: 10,         // Increased from 5 to 10
      min: 0,
      acquire: 60000,  // Keep at 60 seconds
      idle: 10000
    },
    retry: {
      match: [
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/,
        /TimeoutError/,
        /SequelizeTimeoutError/,
        /SequelizeConnectionAcquireTimeoutError/,
        /SequelizeUnknownConstraintError/  // Added this to retry on constraint errors
      ],
      max: 5
    },
    dialectOptions: {
      connectTimeout: 60000,
      // Add this option to help prevent constraint errors
      // by setting a more accurate foreign key discovery method
      foreignKeyConstraintName: 'snake', // Use snake_case for constraint naming for consistency
    }
  }
);

// Test the connection
sequelize.authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
    console.error('Error stack:', err.stack);
    console.error('Database configuration:', {
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT
    });
  });

module.exports = sequelize;