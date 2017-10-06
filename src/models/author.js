'use strict';

const log4js = require('log4js');
const logger = log4js.getLogger('cis');
const validator = require('validator');

module.exports = (sequelize, DataTypes) => {

  let Document, DocumentAuthor;

  const Author = sequelize.define('Author', {
      UID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      Name: { type: DataTypes.STRING, allowNull: false },
      Abbreviation: { type: DataTypes.STRING, allowNull: true }
  }, { tableName: "Author" });
  
  Author.associate = (models) => { 
    Document = models.Document;
    Author.belongsToMany(Document, { through: 'DocumentAuthor' });
    console.log("models: " + models.DocumentAuthor);
    DocumentAuthor = models.DocumentAuthor;
  };

  // Q4
  Author.getCitedAuthorCount = () => {
    return new Promise((resolve, reject) => {
        /*DocumentAuthor.count({
          distinct : true, 
          col: 'ToDocumentId'
        }).then(count => { resolve(count); })//resolve(count); })
          .error(error => { reject(error); });
        /*Author.count({
          distinct : true, 
          col: 'ToDocumentId',
          include: [{ model: 'DocumentAuthor' }]
        }).then(count => {
          resolve(count);
        });*/
    
        console.log(DocumentAuthor);
    });
  };

  return Author;
};