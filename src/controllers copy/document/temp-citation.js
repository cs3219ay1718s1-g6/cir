const log4js = require('log4js');
const logger = log4js.getLogger('backend');

var Model = require('../../models');
var Document = Model.Document;

module.exports = {

	get:(req, res) => {
		let conference = req.query.conference;
		let name = req.query.name;

		Document.getCountByMutipleTitles(conference, name)
			.then((data) => { 
				var result = '';
				for (var key in data) {
   		 			result += key + ' ' + data[key] + ', '; 
				}
				result = result.trim();
				result = result.substring(0, result.length -1);
				res.status(200).send(result); 
			})
			.catch((error) => { res.status(400).send(error); });
	},

	post:(req, res) => {
		res.sendStatus(501);
	},

	put:(req, res) => {
		res.sendStatus(501);
	},

	delete:(req, res) => {
		res.sendStatus(501);
	}
};