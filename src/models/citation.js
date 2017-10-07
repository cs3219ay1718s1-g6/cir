'use strict';

const log4js = require('log4js');
const logger = log4js.getLogger('cis');
const validator = require('validator');

module.exports = (sequelize, DataTypes) => {

  const Citation = sequelize.define('Citation', {
      UID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      FromDocumentId: { type: DataTypes.INTEGER, allowNull: false },
      ToDocumentId: { type: DataTypes.INTEGER, allowNull: false }
  }, { tableName: "Citation" });
  
  Citation.associate = (models) => {

  };

  // Q2, Q3
  Citation.getCount = (unique) => {
    let distinct = {};
    if(unique) { distinct = { 'distinct' : true, 'col': 'ToDocumentId' }; }
    return new Promise((resolve, reject) => {
        Citation.count(distinct).then(count => {
          resolve(count);
        });
    });
  };

  return Citation;
};