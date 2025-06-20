const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize) => {
  const Admin = sequelize.define('Admin', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: 'username_unique'
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('master', 'admin'),
      allowNull: false,
      defaultValue: 'admin'
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    tableName: 'admins',
    timestamps: true,
    hooks: {
      beforeCreate: async (admin) => {
        if (admin.password) {
          const salt = await bcrypt.genSalt(10);
          admin.password = await bcrypt.hash(admin.password, salt);
        }
      },
      beforeUpdate: async (admin) => {
        if (admin.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          admin.password = await bcrypt.hash(admin.password, salt);
        }
      }
    }
  });

  // Instance method to check password
  Admin.prototype.validatePassword = async function(password) {
    return bcrypt.compare(password, this.password);
  };

  // Instance method to check if user is master admin
  Admin.prototype.isMasterAdmin = function() {
    return this.role === 'master';
  };

  // Instance method to check if user can manage another admin
  Admin.prototype.canManageAdmin = function(targetAdmin) {
    return this.isMasterAdmin() || this.id === targetAdmin.id;
  };

  return Admin;
}; 