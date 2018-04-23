'use strict';

const router = require('express').Router();
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');
const logger = require('../../components/myLogger.js');

const connectionPromise = require('../../components/connectionPromise.js');
const auth = require('../../components/auth.js');

router.use(function(req, res, next) {

	auth.authorization(req).then(function() {
		logger.info(req, req.method, req.originalUrl, JSON.stringify(req.body));
		next();
	}).catch(function(err) {
		if (err.message.match(/^WARN:/)) {
			logger.debug(req, err.message);
		} else {
			logger.error(req, err.message, err.stack);
		}
		next();
	});

});

router.get('/delete_user_from_database/:userId(\\d+)', function(req, res, next) {
	var db = null;
	var sql = null;
	var flatId = null;

	if (!req.isAuthorized) {
		res.json({
			status: 'not ok',
			message: 'Пожалуйста авторизуйтесь на сайте'
		});
		return;
	}

	connectionPromise().then(function(connection) {

		db = connection;

		sql = ` SELECT is_superadmin
					FROM user
					WHERE id = ${req.user_id};`;
		return db.queryAsync(sql);

	}).then(function(result) {

		if (result[0].is_superadmin !== 1) {
			throw new Error('WARN: You don\'t have superadmin rights');
		}

		sql = ` SELECT flat_id FROM user WHERE id = ${req.params.userId};`;
		return db.queryAsync(sql);

	}).then(function(result) {

		if (!result.length) {
			throw new Error('WARN: Пользователь отсутствует в базе данных. Завершаем работу.');
		}

		flatId = result[0].flat_id;

		sql = ` DELETE FROM photo WHERE flat_id = ${flatId};`;
		return db.queryAsync(sql);
		
	}).then(function() {

		sql = ` DELETE FROM flat_district WHERE flat_id = ${flatId};`;
		return db.queryAsync(sql);

	}).then(function() {

		sql = ` DELETE FROM flat_utility WHERE flat_id = ${flatId};`;
		return db.queryAsync(sql);

	}).then(function() {

		sql = ` DELETE FROM flat WHERE id = ${flatId};`;
		return db.queryAsync(sql);

	}).then(function() {

		sql = ` DELETE FROM user_complains WHERE from_user_id = ${req.params.userId} OR to_user_id = ${req.params.userId};`;
		return db.queryAsync(sql);

	}).then(function() {

		sql = ` DELETE FROM roommate_request WHERE from_user_id = ${req.params.userId} OR to_user_id = ${req.params.userId};`;
		return db.queryAsync(sql);

	}).then(function() {

		sql = ` DELETE FROM user_priority_option WHERE user_id = ${req.params.userId};`;
		return db.queryAsync(sql);

	}).then(function() {

		sql = ` DELETE FROM user_district WHERE user_id = ${req.params.userId};`;
		return db.queryAsync(sql);

	}).then(function() {

		sql = ` DELETE FROM user_campus500 WHERE user_id = ${req.params.userId};`;
		return db.queryAsync(sql);

	}).then(function() {

		sql = ` DELETE FROM user WHERE id = ${req.params.userId};`;
		return db.queryAsync(sql);

	}).then(function() {

		var dirPath = path.normalize(`${__dirname}/../../public/images/uploads/user_${req.params.userId}`);

		return fs.statAsync(dirPath).then(function(stats) {

			return fs.readdirAsync(dirPath);

		}).then(function(files) {

			var promiseChain = Promise.resolve();

			files.forEach(function(item) {
				promiseChain = promiseChain.then(function() {
					return fs.unlinkAsync(path.normalize(`${dirPath}/${item}`));
				});
			});

			return promiseChain.then(function() {
				return fs.rmdirAsync(dirPath);
			});

		});

	}).then(function() {

		res.json({
			status: 'ok',
			message: `Все данные пользователя успешно удалены`
		});

	}).catch(function(err) {

		if (err.message.match(/^WARN:/)) {

			logger.debug(req, err.message);
		
		} else if (err.message.match(/^ENOENT:/)) {
		
			res.json({
				status: 'ok',
				message: `Все данные пользователя успешно удалены`
			});
			return;
		
		} else {
		
			logger.error(req, err.message, err.stack);
		
		}
		
		res.json({
			status: 'not ok',
			message: err.message
		});
	});
});

router.get('/calculate_similarity', function(req, res, next) {
	var sql = null;
	var db = null;
	var countPriority = 0;

	function calculate(offset, limit) {
		var users = [];
		
		var db = null;

		return new Promise(function(resolve, reject) {
			
			connectionPromise().then(function(connection) {
			
				db = connection;

				sql = ` SELECT 
							user_id,
							user_age,
							department_id,
							faculty_id,
							university_id 
						FROM v_user 
						LIMIT ${limit} 
						OFFSET ${offset};`;
				//logger.debug(req, sql);
				return db.queryAsync(sql);
			
			}).then(function(result) {

				//logger.debug(req, JSON.stringify(result));
				users = result;

				var promiseChain = Promise.resolve();

				for (let i = 0; i < users.length; i++) {
					promiseChain = promiseChain.then(function() {

						sql = ` SELECT priority_option_id 
								FROM user_priority_option
								WHERE user_id = ${users[i].user_id};`;
						//logger.debug(req, sql);
						return db.queryAsync(sql);		

					}).then(function(result) {

						//logger.debug(req, JSON.stringify(result));

						users[i].priorities = [];
						for (var j = 0; j < result.length; j++) {
							users[i].priorities.push(result[j].priority_option_id);
						}

					});
				}

				return promiseChain;

			}).then(function() {

				resolve(users);
			
			}).catch(function(err) {

				reject(err);

			});

		});
	}

	connectionPromise().then(function(connection) {

		db = connection;
		sql = ` SELECT COUNT(*) cnt FROM priority;`
		return db.queryAsync(sql);

	}).then(function(result) {

		countPriority = result[0].cnt;
		logger.info(req, `countPriority = ${countPriority}`);

		return calculate(0, 100);

	}).then(function(result) {

		logger.info(req, result);

		res.json({
			status: 'ok',
			message: result
		});

	}).catch(function(err) {
		
		if (err.message.match(/^WARN:/)) {
			logger.debug(req, err.message);	
		} else {
			logger.error(req, err.message, err.stack);	
		}
		
		res.json({
			status: 'not ok',
			message: err.message
		});

	});
});

module.exports = router;