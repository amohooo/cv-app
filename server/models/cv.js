const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CV = sequelize.define('CV', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  personalInfo: {
    type: DataTypes.JSON,
    allowNull: false
  },
  education: {
    type: DataTypes.JSON,
    allowNull: true
  },
  experience: {
    type: DataTypes.JSON,
    allowNull: true
  },
  skills: {
    type: DataTypes.JSON,
    allowNull: true
  },
  projects: {
    type: DataTypes.JSON,
    allowNull: true
  },
  lastUpdated: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

module.exports = CV;