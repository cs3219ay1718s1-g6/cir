'use strict';

const log4js = require('log4js');
const logger = log4js.getLogger('cis');
const validator = require('validator');

module.exports = (sequelize, DataTypes) => {

  let Document;

  const Author = sequelize.define('Author', {
      UID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      Name: { type: DataTypes.STRING, allowNull: false },
      Abbreviation: { type: DataTypes.STRING, allowNull: true }
  }, { tableName: "Author" });
  
  Author.associate = (models) => { 
    Document = models.Document;
    Author.belongsToMany(Document, { through: 'DocumentAuthor' });
  };

  // Q4
  Author.getCount = () => {
    return new Promise((resolve, reject) => {
        Author.count().then(count => {
          resolve(count);
        });
    });
  };

  return Author;
};