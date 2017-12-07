'use strict';

const router = require('express').Router();
const Promise = require('bluebird');
const logger = require('log4js').getLogger();
const auth = require('../../components/auth.js');

router.use(function(req, res, next) {
	// urls which are allowed with no authorization
	if (
		// starting with '/auth'
		req.originalUrl.match(/^\/favicon.ico$/) ||

		// starting with '/auth'
		req.originalUrl.match(/^\/auth/) ||
		
		// main page (possibly with parameters)
		req.originalUrl.match(/^\/(\?.+)?$/) ) { 
		
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
router.use('/post', require('./post'));
router.use('/profile', require('./profile'));
router.use('/', require('./homepage'));

module.exports = router;