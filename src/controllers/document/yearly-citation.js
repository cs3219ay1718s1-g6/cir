const log4js = require('log4js');
const logger = log4js.getLogger('backend');

var Model = require('../../models');
var Document = Model.Document;

module.exports = {

	get:(req, res) => {
		let conferences = req.query.conferences;
		let startYear = req.query.startYear;
		let endYear = req.query.endYear;

		Document.getCountByYearRange(conferences, startYear, endYear)
			.then((count) => { res.status(200).send(count.toString()); })
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