const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Section = sequelize.define('Section', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    pageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'pages',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    }
  }, {
    tableName: 'sections',
    timestamps: true,
    indexes: [
      {
        name: 'section_page_id_fk',
        fields: ['pageId']
      }
    ]
  });

  return Section;
}; 