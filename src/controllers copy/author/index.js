const log4js = require('log4js');
const logger = log4js.getLogger('backend');

var Model = require('../../models');
var Author = Model.Author;

module.exports = {

	get:(req, res) => {
		res.sendStatus(501);
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