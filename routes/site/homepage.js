'use strict';

const router = require('express').Router();
const logger = require('log4js').getLogger();
const Promise = require('bluebird');

router.get('/', function(req, res, next) {
	Promise.resolve().then(function() {
		res.render('site/homepage.pug');
	}).catch(function(err) {
		logger.error(err.message, err.stack);
		res.render('errors/500.pug');
	});
});

module.exports = router;