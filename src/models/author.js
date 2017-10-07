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
  Author.getCitedAuthorCount = () => {
    return new Promise((resolve, reject) => {
        sequelize.query("SELECT count(*) as count FROM DocumentAuthor da, Citation c " +  
                        "WHERE c.ToDocumentId = da.DocumentUID")
          .then(count => { resolve(count[0][0]['count']); })
          .catch(error => { reject(error); });
    });
  };

  // Q8
  Author.getAuthorCitedForByYear = (author, startYear, endYear) => {
    author = Author.getAuthorAlias(author);
    return new Promise((resolve, reject) => {
        sequelize.query("SELECT d.Year Year, count(*) count FROM Document d, Citation c " +
                        "WHERE d.UID = c.ToDocumentId " + 
                        "AND d.UID IN (SELECT da.DocumentUID FROM DocumentAuthor da, Author a " +
                                      "WHERE da.AuthorUID = a.UID " + 
                                      "AND a.Abbreviation LIKE '%" + author + "%') " +
                        "AND d.Year >= " + startYear + " " +
                        "AND d.Year <= " + endYear + " " +
                        "GROUP BY d.Year ")
          .then(data => { resolve(data[0]); })
          .catch(error => { reject(error); });
    });
  }

  Author.getAuthorAlias = (authorName) => authorName
    .replace(/[^\w\s-]+/g, ' ')
    .toLowerCase()
    .split(/\s+/)
    .map((component, index, array) => {
        if (index === array.length - 1) {
            return component
        }
        return component.charAt(0)
    }).join(' ')

  return Author;
};