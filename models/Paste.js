const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Paste = sequelize.define("Paste", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  maxViews: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  remainingViews: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
});

module.exports = Paste;
