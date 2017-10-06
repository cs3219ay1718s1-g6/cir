const log4js = require('log4js');
const logger = log4js.getLogger('backend');

var Model = require('../../models');
var Author = Model.Author;

module.exports = {

	get:(req, res) => {
		Author.getCount()
			.then((count) => { res.status(200).send(count.toString()); });
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