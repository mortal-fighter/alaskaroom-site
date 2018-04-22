'use strict';

const router = require('express').Router();
const Promise = require('bluebird');
//const logger = require('log4js').getLogger();
const myLogger = require('../../components/myLogger.js');
const auth = require('../../components/auth.js');

router.use(function(req, res, next) {
	myLogger.info(req, req.method, req.originalUrl, JSON.stringify(req.body));

	// urls which are allowed with no authorization
	if (
		// '/favicon.ico'
		req.originalUrl.match(/^\/favicon.ico$/) ||

		// '/robots.txt'
		req.originalUrl.match(/^\/robots.txt$/) ||
		
		// starting with '/auth'
		req.originalUrl.match(/^\/auth/) || 
		
		// homepage
		req.originalUrl.match(/^\/$/)) {

		next(); 
		return;
	}

	auth.authorization(req).then(function() {
		myLogger.info(req, req.method, req.originalUrl, JSON.stringify(req.body));
		next();
	}).catch(function(err) {
		if (err.message.match(/^WARN:/)) {
			myLogger.debug(req, err.message);
		} else {
			myLogger.error(req, err.message, err.stack);
		}
		next();
	});
});

router.use('/auth', require('./auth'));
router.use('/filter', require('./filter'));
router.use('/profile', require('./profile'));
router.use('/requests', require('./request'));
router.use('/faculty', require('./faculty'));
router.use('/campus500', require('./campus500'));
router.use('/', require('./homepage'));

module.exports = router;