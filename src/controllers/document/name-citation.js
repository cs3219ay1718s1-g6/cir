const log4js = require('log4js');
const logger = log4js.getLogger('backend');

var Model = require('../../models');
var Document = Model.Document;

module.exports = {

	get:(req, res) => {
		let conference = req.query.conference;
		let name = req.query.name;

		let names = name.split(",");
		let hasMany = names.length > 1;

		Document.getCountByTitle(conference, name)
			.then((data) => { 
				//var result;
				//result = data.map(item => `${ hasMany ? item.conference : '' } ${ item.citedYear } ${ item.count }` ).join(", ");
				res.status(200).send(data); 
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