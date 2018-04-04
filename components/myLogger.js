'use strict';

const log4js = require('log4js').getLogger();

const logger = {
	debug: function(req, ...rest) {
		rest.splice(0, 0, `[user_id=${req.user_id}] -`);
		log4js.debug(...rest);
	},
	error: function(req, ...rest) {
		rest.splice(0, 0, `[user_id=${req.user_id}] -`);
		log4js.error(...rest);
	}
}

module.exports = logger;