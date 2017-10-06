'use strict';

const log4js = require('log4js');
const logger = log4js.getLogger('cis');
const validator = require('validator');

module.exports = (sequelize, DataTypes) => {

  let Conference, Author;

  const Document = sequelize.define('Document', {
      UID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      Title: { type: DataTypes.STRING, allowNull: false },
      Alias: { type: DataTypes.STRING, allowNull: true },
      Year: { type: DataTypes.INTEGER, allowNull: true },
      IsInDataset: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue:false }
  }, { tableName: "Document" });
  
  Document.associate = (models) => {
    Conference = models.Conference;
    Document.belongsTo(Conference);
    Author = models.Author;
    Document.belongsToMany(Author, { through: 'DocumentAuthor' });
  };

  // Q1
  Document.getCount = () => {
    return new Promise((resolve, reject) => {
        Document.count({ 'IsInDataset' : true })
          .then((count) => { resolve(count); })
          .error((error) => { reject(error); });
    });
  };

  // Q5
  Document.getRange = () => {
    return new Promise((resolve, reject) => {
        Document.max('Year', {  include: [{ model: Conference }] })
          .then((max) => {
              Document.min('Year', { include: [{ model: Conference }] })
                .then((min) => {
                    let range = 0;
                    if(max > min) { range = max - min; }
                    resolve(range); 
                });
          }).error((error) => { reject(error); });
    });
  }


  //Q6, Q9: check if conference is string or array 
  Document.getCountByYearRange = (conference, startYear, endYear) => {
    return new Promise((resolve, reject) => {

        resolve('test');
    });
  }


  // Q7, Q10 - title and dataset are in set of arrays
  Document.getCountByTitle = (title, dataset) => {

  }

  return Document;
};