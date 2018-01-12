'use strict';

const router = require('express').Router();
const Promise = require('bluebird');
const logger = require('log4js').getLogger();

const connectionPromise = require('../../components/connectionPromise.js');

router.post('/ajax_get_people_by_type', function(req, res, next) {

	var db = null;
	var records = [];
	var recordsCountTotal = 0;

	if (!req.isAuthorized) {
		res.redirect('/?message=Пожалуйста,%20авторизуйтесь%20в%20системе');
		return;
	}

	var limit = (req.body.limit) ? req.body.limit : 18;
	var offset = (req.body.offset) ? req.body.offset : 0;

	connectionPromise().then(function(connection) {

		db = connection;

		var sql = '';
			
			switch (req.body.type) {
				case 'university':
					sql = `	SELECT
								user_id, user_first_name, user_last_name, user_sex, user_age, user_avatar, university_name 
							FROM v_user
							WHERE university_id = (SELECT university_id FROM v_user WHERE user_id = ${req.user_id})
							  AND user_id <> ${req.user_id}
							ORDER BY user_date_register DESC
							LIMIT ${limit}
							OFFSET ${offset};`;
					break;
				case 'faculty':
					sql = ` SELECT
								user_id, user_first_name, user_last_name, user_sex, user_age, user_avatar, university_name 
							FROM v_user
							WHERE faculty_id = (SELECT faculty_id FROM v_user WHERE user_id = ${req.user_id})
							  AND user_id <> ${req.user_id}
							ORDER BY user_date_register DESC
							LIMIT ${limit}
							OFFSET ${offset};`;
					break;
				case 'department':
					sql = ` SELECT
								user_id, user_first_name, user_last_name, user_sex, user_age, user_avatar, university_name 
							FROM v_user
							WHERE department_id = (SELECT department_id FROM v_user WHERE user_id = ${req.user_id})
							  AND user_id <> ${req.user_id}
							ORDER BY user_date_register DESC
							LIMIT ${limit}
							OFFSET ${offset};`;
					break;
				case 'studyyear':
					sql = ` SELECT
								user_id, user_first_name, user_last_name, user_sex, user_age, user_avatar, university_name 
							FROM v_user
							WHERE studyyear_id = (SELECT studyyear_id FROM v_user WHERE user_id = ${req.user_id})
							  AND user_id <> ${req.user_id}
							ORDER BY user_date_register DESC
							LIMIT ${limit}
							OFFSET ${offset};`;
					break;
			}
		
		logger.debug(sql);

		return db.queryAsync(sql);

	}).then(function(result) {

		logger.debug(result);
		records = result;

		var sql = '';
		switch (req.body.type) {
			case 'university':
				sql = ` SELECT count(*) cnt
						FROM v_user
						WHERE university_id = (SELECT university_id FROM v_user WHERE user_id = ${req.user_id})
						  AND user_id <> ${req.user_id};`;
				break;
			case 'faculty':
				sql = ` SELECT count(*) cnt
						FROM v_user
						WHERE faculty_id = (SELECT faculty_id FROM v_user WHERE user_id = ${req.user_id})
						  AND user_id <> ${req.user_id};`;
				break;
			case 'department':
				sql = ` SELECT count(*) cnt
						FROM v_user
						WHERE department_id = (SELECT department_id FROM v_user WHERE user_id = ${req.user_id})
						  AND user_id <> ${req.user_id};`;
				break;
			case 'studyyear':
				sql = ` SELECT count(*) cnt
						FROM v_user
						WHERE studyyear_id = (SELECT studyyear_id FROM v_user WHERE user_id = ${req.user_id})
						  AND user_id <> ${req.user_id};`;
				break;
		}

		logger.debug(sql);

		return db.queryAsync(sql);

	}).then(function(result) {
	
		recordsCountTotal = result[0].cnt;

		res.json({
			status: 'ok',
			records: records,
			recordsCountTotal: recordsCountTotal
		});	

	}).catch(function(err) {

		logger.error(err.message + ' ' + err.stack);

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

		logger.error(err.message + ' ' + err.stack);

		res.render('errors/500.pug');

	});
	
});

module.exports = router;