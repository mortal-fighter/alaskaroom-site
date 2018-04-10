'use strict';

const router = require('express').Router();
const Promise = require('bluebird');

const logger = require('../../components/myLogger.js');
const connectionPromise = require('../../components/connectionPromise.js');

router.get('/', function(req, res, next) {
	var db = null;
	
	if (!req.isAuthorized) {
		res.redirect('/?message=Пожалуйста авторизуйтесь на сайте');
		return;
	}

	connectionPromise().then(function(connection) {

		db = connection;

		var sql = ` SELECT 
						is_campus_payed
					FROM user
					WHERE id = ${req.user_id};`;
		logger.debug(req, sql);
		return db.queryAsync(sql);

	}).then(function(result) {

		res.render('site/campus500.pug', {
			is_campus_payed: result[0].is_campus_payed,
			isAuthorized: req.isAuthorized,
			userId: req.user_id
		});
		
	}).catch(function(err) {

		logger.error(req, err.message, err.stack);
		res.render('errors/500.pug');

	});
});

router.post('/search', function(req, res, next) {
	var db = null;
	
	if (!req.isAuthorized) {
		res.json({
			status: 'not ok',
			message: 'Пожалуйста авторизуйтесь на сайте'
		});
		return;
	}

	connectionPromise().then(function(connection) {

		db = connection;

		var sql = ` SELECT 
						is_campus_payed
					FROM user
					WHERE id = ${req.user_id};`;
		logger.debug(req, sql);
		return db.queryAsync(sql);

	}).then(function(result) {

		//
		
	}).catch(function(err) {

		logger.error(err.message, err.stack);
		res.render('errors/500.pug');

	});
});

module.exports = router;