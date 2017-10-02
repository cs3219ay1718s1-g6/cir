const fs = require('fs');
const path = require('path');
const logger = require('log4js').getLogger('cir');
const directory = path.join(__dirname, '..', 'controllers');

module.exports = (method, controller, action, req, res, isExternal) => {

	logger.info('Called ' + method.toUpperCase() + ' ' + req.path + 
				' with query params ' + JSON.stringify(req.query) + 
				' and route params ' + JSON.stringify(req.params) +
				' and body.');

	logger.info(req.body);

	// ensure that controller exist before routing out
	let location = path.join(directory, controller);
	let validation = enforce(location, controller, action);

	// route to controller if no action is present
	if(validation) {
		try {
			let route = path.join(location, 'index');
			if(action) { route = path.join(location, action); }
			route = require(route);
			route[method.toLowerCase()](req, res);
		} catch(err) {
			logger.error(err);
			res.status(500).send('Internal Server Error');
		}
	}

	// helper function to ensure controller or folder action is present
	function enforce(location, controller, action) {
		let result = true; 
		let output = controller;

		// check if controller folder exist
		fs.stat(location, function (err, stats) {
			if(err || !stats.isDirectory()) { result = false; }
		});

		// check for controller index file
		result &= fs.existsSync(path.join(location, 'index.js'));
		
		// check if action exist is provided
		if(action) { 
			output = action;
			result &= fs.existsSync(path.join(location, action + '.js')); 
		}

		if(!result) { res.status(405).send('Service ' + output + ' not allowed.'); }

		return result;
	}
};

