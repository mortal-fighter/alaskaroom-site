'use strict';

const router = require('express').Router();
const Promise = require('bluebird');

const logger = require('../../components/myLogger.js');

router.get('/', function(req, res, next) {
	var db = null;
	
	if (!req.isAuthorized) {
		res.redirect('/?message=Пожалуйста авторизуйтесь на сайте');
		return;
	}

	Promise.resolve().then(function() {

		res.render('site/campus500.pug', {
			isAuthorized: req.isAuthorized,
			userId: req.user_id
		});
		
	}).catch(function(err) {

		logger.error(req, err.message, err.stack);
		res.render('errors/500.pug');

	});
});

module.exports = router;