'use strict';

const router = require('express').Router();
const Promise = require('bluebird');

const connectionPromise = require('../../components/connectionPromise.js');
const logger = require('../../components/myLogger.js');

router.post('/ajax_get_people_by_type', function(req, res, next) {

	var db = null;
	var records = [];
	var recordsCountTotal = 0;
	var conditionSql = null;

	if (!req.isAuthorized) {
		res.redirect('/?message=Пожалуйста,%20авторизуйтесь%20в%20системе');
		return;
	}

	var limit = (req.body.limit) ? req.body.limit : 18;
	var offset = (req.body.offset) ? req.body.offset : 0;

	connectionPromise().then(function(connection) {

		db = connection;

		switch (req.body.type) {
			case 'university':
				conditionSql = `university_id = (SELECT university_id FROM user WHERE id = ${req.user_id})`;
				break;
			case 'faculty':
				conditionSql = `faculty_id = (SELECT faculty_id FROM user WHERE id = ${req.user_id})`;
				break;
			case 'department':
				conditionSql = `department_id = (SELECT department_id FROM user WHERE id = ${req.user_id})`;
				break;
			case 'studyyear':
				conditionSql = `studyyear_id = (SELECT studyyear_id FROM user WHERE id = ${req.user_id})`;
				break;

		}

		var sql = `	SELECT
						a.id 			user_id, 
						a.first_name	user_first_name, 
						a.last_name		user_last_name, 
						a.sex			user_sex, 
						a.age 			user_age, 
						a.avatar 		user_avatar, 
						b.name_short	university_name 
					FROM user a
					LEFT JOIN university b ON a.university_id = b.id
					WHERE ${conditionSql}
					  AND a.id <> ${req.user_id}
					ORDER BY a.date_register DESC
					LIMIT ${limit}
					OFFSET ${offset};`;
		
		logger.debug(req, sql);
		return db.queryAsync(sql);

	}).then(function(result) {

		logger.debug(req, result);
		records = result;

		var sql = `	SELECT count(*) cnt
					FROM user a
					LEFT JOIN university b ON a.university_id = b.id
					WHERE ${conditionSql}
					  AND a.id <> ${req.user_id};`;

		logger.debug(req, sql);
		return db.queryAsync(sql);

	}).then(function(result) {
	
		recordsCountTotal = result[0].cnt;

		res.json({
			status: 'ok',
			records: records,
			recordsCountTotal: recordsCountTotal
		});	

	}).catch(function(err) {

		logger.error(req, err.message + ' ' + err.stack);

		res.json({
			status: 'not ok'
		});

	});

});

router.get('/', function(req, res, next) {
	
	if (!req.isAuthorized) {
		res.redirect('/?message=Пожалуйста,%20авторизуйтесь%20в%20системе');
		return;
	}

	Promise.resolve().then(function() {

		res.render('site/faculty.pug', {
			isAuthorized: req.isAuthorized,
			userId: req.user_id
		});	

	}).catch(function(err) {

		logger.error(req, err.message + ' ' + err.stack);

		res.render('errors/500.pug');

	});
	
});

module.exports = router;