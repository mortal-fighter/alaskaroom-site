'use strict';

const router = require('express').Router();
const Promise = require('bluebird');
const logger = require('log4js').getLogger();
const auth = require('../../components/auth.js');

router.use(function(req, res, next) {
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
		next();
	}).catch(function(err) {
		logger.error(err);
		next();
	});
	//next();
});

router.use('/auth', require('./auth'));
router.use('/filter', require('./filter'));
router.use('/profile', require('./profile'));
router.use('/requests', require('./request'));
router.use('/faculty', require('./faculty'));
router.use('/campus500', require('./campus500'));
router.use('/', require('./homepage'));

module.exports = router;