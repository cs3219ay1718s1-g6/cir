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

        conference = conference.toUpperCase();
        let conferences = conference.split(",");
        let query = conferences.map(conf => conf.match(/^([A-Z]+)(\d+)$/).slice(1, 3))
          .map(([code, yearString]) => `Co.Code = '${code}' AND D1.Year = 20${yearString}`)
          .map(cond => `(${cond})`).join(" OR ");

        sequelize.query(
                        "SELECT Co.Code code, D1.Year conferenceYear, D2.Year citedYear, COUNT(*) count " +   
                        "FROM Document as D1, Document as D2, Conference as Co, Citation as Ci " + 
                        "WHERE D1.UID = Ci.FromDocumentID " +
                        "AND D2.UID = Ci.ToDocumentID " + 
                        "AND D1.ConferenceUID = Co.UID " +
                        "AND (" + query + ") " +
                        "AND D2.Year >= " + startYear + " AND D2.Year <= " + endYear + " " +
                        "GROUP BY Co.Code, D1.Year, D2.Year")
        .then(data => { 
          data = data[0];
          data.forEach((item, index) => { item.conference = item.code + item.conferenceYear.toString().substring(2); }); 
          resolve(data); 
        })
        .catch(error => { reject(error); });
    });
  }

  Document.retrieveCodeAndYear = (conference) => {
    let code = conference.substring(0, 1);
    let year = conference.substring(1, 2);
    return { code, year };
  }


  // Q7, Q10 - title and dataset are in set of arrays
  Document.getCountByTitle = (conference, name) => {

    return new Promise((resolve, reject) => {

        conference = conference.toUpperCase();
        let conferences = conference.split(",");
        let query = conferences.map(conf => conf.match(/^([A-Z]+)(\d+)$/).slice(1, 3))
          .map(([code, yearString]) => `Co.Code = '${code}' AND D1.Year = 20${yearString}`)
          .map(cond => `(${cond})`).join(" OR ");

        sequelize.query(
                        "SELECT C1.Code, D1.Year, COUNT(*) " +
                        "FROM Document as D1, Document as D2, Conference as C1, Conference as C2, Citation as Ci " +
                        "WHERE D1.UID = Ci.FromDocumentID AND D2.UID = Ci.ToDocumentID AND " + 
                        "D1.ConferenceUID = C1.UID AND D2.ConferenceUID = C2.UID AND " +
                        "((C1.Code = 'J' AND D1.Year = 2014) OR " +
                        "(C1.Code = 'W' AND D1.Year = 2014)) AND " +
                        "C2.Alias LIKE '%naacl%' " +
                        "GROUP BY C1.Code, D1.Year")
        .then(data => { 
         /// data = data[0];
          //data.forEach((item, index) => { item.conference = item.code + item.conferenceYear.toString().substring(2); }); 
          resolve(data); 
        })
        .catch(error => { reject(error); });
    });

  }

  return Document;
};