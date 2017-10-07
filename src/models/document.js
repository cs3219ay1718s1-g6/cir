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
  Document.getCitedDocumentRange = () => {
    return new Promise((resolve, reject) => {
        sequelize.query("SELECT max(d.Year) max, min(d.Year) min FROM Document d, Citation c " +  
                        "WHERE c.ToDocumentId = d.UID")
          .then(data => { 
              data = data[0][0];
              let min = data.min;
              let max = data.max;

              if((min && max) && (max >= min)) {
                let range = max - min;
                resolve(range);
              } else { reject('Failed to retrieve values.')}
         
          }).catch(error => { reject(error); });
    });
  }


  //Q6, Q9: check if conference is string or array 
  Document.getCountByYearRange = (conference, startYear, endYear) => {
    return new Promise((resolve, reject) => {

        /*sequelize.query(
                        "SELECT d.Year year, count(*) citations FROM Citation c, Document d " + 
                        "WHERE d.UID = c.ToDocumentId " +

                        "GROUP BY Year")
        .then(data => {
            console.log(data);
            resolve("test");
        });*/
    });
  }


  // Q7, Q10 - title and dataset are in set of arrays
  Document.getCountByTitle = (title, dataset) => {

  }

  return Document;
};