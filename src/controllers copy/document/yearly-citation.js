const log4js = require('log4js');
const logger = log4js.getLogger('backend');

var Model = require('../../models');
var Document = Model.Document;

module.exports = {

	get:(req, res) => {
		let conference = req.query.conference;
		let startYear = req.query.startYear;
		let endYear = req.query.endYear;

		let conferences = conference.split(",");
		let hasMany = conferences.length > 1;

		Document.getCountByYearRange(conference, startYear, endYear)
			.then((data) => { 
				var result;
				result = data.map(item => `${ hasMany ? item.conference : '' } ${ item.citedYear } ${ item.count }` ).join(", ");
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