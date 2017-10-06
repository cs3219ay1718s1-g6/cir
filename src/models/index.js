'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename  = path.basename(module.filename);
const env = process.env.NODE_ENV || 'development';
const log4js = require('log4js');
const logger = log4js.getLogger('cis');

// initialize mysql database
var db = {};
const sequelize = new Sequelize(process.env.MYSQL_DATABASE,
                  process.env.MYSQL_USERNAME,
                  process.env.MYSQL_PASSWORD,
                  { host : process.env.MYSQL_HOST,
                    dialect : 'mysql',
                    pool : { max: 5, min: 0, idle: 1000 },
                    define : { timestamps: false }
                  });

// authenticate database connection
sequelize.authenticate().then(() => {
    logger.info('Database connection has been established successfully.');
}).catch(err => {
    logger.error('Unable to connect to the database. ' + err);
});


// attach all database models
fs.readdirSync(__dirname).filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  }).forEach(file => {
    var model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
});

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// sync model to database if not exist
sequelize.sync({ });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;