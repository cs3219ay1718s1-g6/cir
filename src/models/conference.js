'use strict';

const log4js = require('log4js');
const logger = log4js.getLogger('cis');
const validator = require('validator');

module.exports = (sequelize, DataTypes) => {

  const Conference = sequelize.define('Conference', {
      UID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      Name: { type: DataTypes.STRING, allowNull: false },
      Code: { type: DataTypes.STRING, allowNull: false },
      Year: { type: DataTypes.INTEGER, allowNull: false }
  }, { tableName: "Conference" });
  
  Conference.associate = (models) => {
    let Document = models.Document;
    Conference.hasMany(Document);
  };


  return Conference;
};