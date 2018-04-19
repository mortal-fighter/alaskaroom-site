'use strict';

const router = require('express').Router();
const Promise = require('bluebird');

const logger = require('../../components/myLogger.js');
const connectionPromise = require('../../components/connectionPromise.js');

router.get('/', function(req, res, next) {
	var db = null;
	var campus = [];

	if (!req.isAuthorized) {
		res.redirect('/?message=Пожалуйста авторизуйтесь на сайте');
		return;
	}

	connectionPromise().then(function(connection) {

		db = connection;

		var sql = ` SELECT id, name FROM campus500 ORDER BY display_order;`;
		logger.debug(req, sql);
		return db.queryAsync(sql);

	}).then(function(result) {

		res.render('site/campus500.pug', {
			campus500: result,
			isAuthorized: req.isAuthorized,
			userId: req.user_id
		});
		
	}).catch(function(err) {

		logger.error(req, err.message, err.stack);
		res.render('errors/500.pug');

	});
});

router.post('/search', function(req, res, next) {
	if (!req.isAuthorized) {
		res.json({
			status: 'not ok',
			message: 'Пожалуйста войдите на сайт'
		});
		return;
	}
	
	var db = null;
	var countTotal = null;
	var users = [];
	var campusOptions = [];
	var sql = null;
	
	var limit = (req.body.limit) ? req.body.limit : 9;
	var offset = (req.body.offset) ? req.body.offset : 0;

	connectionPromise().then(function(connection) {

		db = connection;

		sql = ` SELECT 	
						user.id,
						user.first_name,
						user.last_name,
						user.avatar
					FROM user
					WHERE id IN (
						SELECT DISTINCT user_id
						FROM user_campus500
						WHERE campus500_id = ${req.body.campus.replace(/'/g, '\\\'')}
					)
					ORDER BY id DESC
					LIMIT ${limit}
					OFFSET ${offset};`;
		logger.debug(req, sql);
		return db.queryAsync(sql);

	}).then(function(result) {

		logger.debug(req, result);
		users = result;

		sql = `	SELECT COUNT(*) countTotal
					FROM (
						SELECT DISTINCT user_id
						FROM user_campus500
						WHERE campus500_id = ${req.body.campus.replace(/'/g, '\\\'')}
					) user_list;`;
		logger.debug(req, sql);			
		return db.queryAsync(sql);

	}).then(function(result) {
		
		logger.debug(req, result);
		countTotal = result[0].countTotal;

		var promiseChain = Promise.resolve();
		
		if (countTotal > 0) {
			
			promiseChain = promiseChain.then(function() {
				
				var userIds = [];
				users.forEach(function(user) { userIds.push(user.id); });

				var sql = `	SELECT 
								user_campus500.user_id, 
								campus500.name, 
								campus500.icon
							FROM user_campus500
							JOIN campus500 ON campus500.id = user_campus500.campus500_id
							WHERE user_id IN (${userIds.join(',')})
							ORDER BY user_id DESC, campus500_id;`;

				logger.debug(req, sql);
				return db.queryAsync(sql);
			
			}).then(function(result) {

				campusOptions = result;

			});
		}

		return promiseChain;

	}).then(function() {

		res.json({
			status: 'ok',
			users: users,
			campusOptions: campusOptions,
			usersCountTotal: countTotal
		});

	}).catch(function(err) {

		logger.error(err.message, err.stack);
		res.json({
			status: 'not ok',
			message: 'Во время выполнения запроса произошла ошибка'
		});

	});
});

module.exports = router;