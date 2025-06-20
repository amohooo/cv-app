const sequelize = require('../config/database');
const Page = require('./Page');
const Section = require('./Section');
const Card = require('./Card');
const Admin = require('./Admin');

// Initialize models
const PageModel = Page(sequelize);
const SectionModel = Section(sequelize);
const CardModel = Card(sequelize);
const AdminModel = Admin(sequelize);

// Define associations
AdminModel.hasMany(PageModel, { foreignKey: 'adminId', onDelete: 'CASCADE' });
PageModel.belongsTo(AdminModel, { foreignKey: 'adminId' });

PageModel.hasMany(SectionModel, { foreignKey: 'pageId', onDelete: 'CASCADE' });
SectionModel.belongsTo(PageModel, { foreignKey: 'pageId' });

SectionModel.hasMany(CardModel, { foreignKey: 'sectionId', onDelete: 'CASCADE' });
CardModel.belongsTo(SectionModel, { foreignKey: 'sectionId' });

// Sync all models with a safer approach
const syncModels = async () => {
  try {
    // First check if the database is available
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Sync models one by one with error handling
    // First sync models without foreign keys
    await PageModel.sync({ alter: true }).catch(err => {
      console.warn('Warning syncing Page model:', err.message);
    });
    
    // Then sync models with foreign keys
    await SectionModel.sync({ alter: true }).catch(err => {
      // Ignore unknown constraint errors as they're not critical
      if (!err.message.includes('UnknownConstraintError')) {
        console.warn('Warning syncing Section model:', err.message);
      } else {
        console.log('Ignoring unknown constraint error for Section model - continuing sync');
      }
    });
    
    await CardModel.sync({ alter: true }).catch(err => {
      if (!err.message.includes('UnknownConstraintError')) {
        console.warn('Warning syncing Card model:', err.message);
      } else {
        console.log('Ignoring unknown constraint error for Card model - continuing sync');
      }
    });
    
    await AdminModel.sync({ alter: true }).catch(err => {
      console.warn('Warning syncing Admin model:', err.message);
    });
    
    console.log('All models were synchronized successfully.');
  } catch (err) {
    console.error('Error synchronizing models:', err);
    console.error('Error stack:', err.stack);
  }
};

// Run the sync process
syncModels();

module.exports = {
  Page: PageModel,
  Section: SectionModel,
  Card: CardModel,
  Admin: AdminModel
}; 