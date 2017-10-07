const log4js = require('log4js');
const logger = log4js.getLogger('backend');

var Model = require('../../models');
var Author = Model.Author;

module.exports = {

	get:(req, res) => {

		let author = req.query.author;
		let startYear = req.query.startYear;
		let endYear = req.query.endYear;
		let result = '';

		if(author && startYear && endYear) { 

			Author.getAuthorCitedForByYear(author, startYear, endYear)
			.then(data => { 
				if(data) {
					data.forEach((item, index) => {
						result += item['Year'] + ' ' + item['count'] + ', ';
					});
					result = result.trim().slice(0, -1);
					res.status(200).send(result);
				} else { res.status(400).send('Unable to find any records.'); }
				
			}).catch((error) => { res.status(400).send(error); });
			
		} else {
			Author.getCitedAuthorCount()
				.then(count => { res.status(200).send(count.toString()); })
				.catch((error) => { res.status(400).send(error); });
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