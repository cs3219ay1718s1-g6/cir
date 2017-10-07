const log4js = require('log4js');
const logger = log4js.getLogger('backend');

var Model = require('../../models');
var Document = Model.Document;

module.exports = {

	get:(req, res) => {
		let conference = req.query.conference;
		let startYear = req.query.startYear;
		let endYear = req.query.endYear;
		let name = req.query.name;

		let conferences = (conference) ? conference.split(",") : {};
		let hasManyConferences = conferences.length > 1;

		let names = (name) ? name.split(",") : {};
		let hasManyNames = names.length > 1;

		if(conference && startYear && endYear) {
			Document.getCountByYearRange(conference, startYear, endYear)
			.then((data) => { 
				var result;
				result = data.map(item => `${ hasManyConferences ? item.conference : '' } ${ item.citedYear } ${ item.count }` ).join(", ");
				res.status(200).send(result); 
			})
			.catch((error) => { res.status(400).send(error); });
		
		} else if(!hasManyConferences && hasManyNames) {
			Document.getCountByMutipleTitles(conference, name)
			.then((data) => { 
				var result = '';
				for (var key in data) {
   		 			result += key.toUpperCase() + ' ' + data[key] + ', '; 
				}
				result = result.trim();
				result = result.substring(0, result.length -1);
				res.status(200).send(result); 
			})
			.catch((error) => { res.status(400).send(error); });
		
		} else if(hasManyConferences && name) {
			
			Document.getCountByTitle(conference, name)
			.then((data) => { 
				var result;
				result = data.map(item => `${ item.conference } ${ item.count }` ).join(", ");
				res.status(200).send(result); 
			})
			.catch((error) => { res.status(400).send(error); });

		} else { 
			res.sendStatus(501);
		}
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