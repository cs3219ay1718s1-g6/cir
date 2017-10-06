// declare required imports
const bodyParser = require("body-parser");
const dotenv = require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const log4js = require('log4js');
const rfs = require('rotating-file-stream');
const Sequelize = require('sequelize');
const webLogger = require('morgan');

//* ---------- webserver routing ---------- *//
const app = express();
const invoker = require(__dirname + '/src/utils/invoker');
const models = require(__dirname + '/src/models');
const logger = log4js.getLogger('cis');

// configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// allow public to view this specific folder
app.use(express.static(path.join(__dirname, 'public')));

// setup logging to write to file in rotation
(function setupLogging () {
	let logDirectory = path.join(__dirname, 'log');
 	log4js.configure({
   		appenders: {
	     	out: { type: 'console' },
	     	app: { type: 'file', filename: path.join('log', 'info.log') }
	    },
	    categories: {
	    	default: { appenders: [ 'out', 'app' ], level: 'debug' }
	    }
	});

	// create a rotating write stream
	let accessLogStream = rfs('access.log', {
		interval: '1d', // rotate daily
	    path: logDirectory
	});

	app.use(webLogger('dev', {stream: accessLogStream}));
	app.use(webLogger('dev'));
})();

// intercept and route
app.get('/health', (req, res) => {
  res.sendStatus(200);
});

app.get('/log', function (req, res) {
 if (req.query.passphrase === 'wew') {
  res.sendFile(__dirname + '/log/info.log');
 }
});

let router = function (req, res) {
	let controller = req.params.controller;
	let action = req.params.action;
	invoker(req.method, controller, action, req, res, true);
};

for (let method of ['get', 'post', 'put', 'delete']) {
	app[method]('/api/:controller/', router);
}

for (let method of ['get', 'post', 'put', 'delete']) {
	app[method]('/api/:controller/:action', router);
}

// redirect root to index
app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// launch the server on selected port
logger.info('Starting HTTP server on port ' + process.env.HOST_PORT);
const server = app.listen(process.env.PORT || 3000, () => {
  const { address, port } = server.address();
  logger.info(`Application worker ${process.pid} started...`);
});
