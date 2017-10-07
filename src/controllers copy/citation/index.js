const log4js = require('log4js');
const logger = log4js.getLogger('backend');

var Model = require('../../models');
var Citation = Model.Citation;

module.exports = {

	get:(req, res) => {
		let unique = req.query.unique;
		Citation.getCount(unique)
			.then((count) => { res.status(200).send(count.toString()); })
			.catch((error) => { res.status(400).send(error); });;
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