'use strict';

const router = require('express').Router();
const Promise = require('bluebird');
const logger = require('log4js').getLogger();

const connectionPromise = require('../../components/connectionPromise.js');
const util = require('../../components/myUtil.js');

router.get('/get_faculties_by_university_id/:universityId(-?\\d+)', function(req, res, next) {
	var db = null;
	return connectionPromise().then(function(connection) {

		db = connection;
		return util.generateFacultySelect(req.params.universityId, true);

	}).then(function(result) {

		res.json({
			status: 'ok',
			faculties: result
		});

	}).catch(function(err) {

		logger.error(err.message + err.stack);
		res.json({ status: 'not ok' })

	});
});

router.get('/:type(\\S+)?', function(req, res, next) {
	var db = null;
	var records = [];
	var priorities = [];
	var universities = [];

	req.params.type = (req.params.type) ? req.params.type : 'find-flat';

	if (!req.isAuthorized) {
		res.redirect('/?message=Пожалуйста,%20авторизуйтесь%20в%20системе');
		return;
	}

	connectionPromise().then(function(connection) {
	
		db = connection;
		var sql;

		if (req.params.type === 'find-flat') {
			sql = ` SELECT
						user_id,
						user_sex,
						user_age,
						university_name,
						user_city,
						flat_address,
						flat_rent_pay,
						flat_id,
						flat_first_photo
					FROM v_user
					WHERE flat_id IS NOT NULL
					LIMIT 15`;
		} else {
			sql = `	SELECT 
						user_id,
						user_first_name,
						user_last_name,
						user_sex,
						user_age,
						university_name,
						user_avatar,
						flat_id
					FROM v_user 
					WHERE flat_id IS NULL
					LIMIT 15`;
		}

		logger.debug(sql);
		return db.queryAsync(sql);
	
	}).then(function(result) {
		
		logger.debug(result);
		records = result;

		return util.generatePrioritySelects(req, { fill: false });

	}).then(function(result) {

		//logger.debug('priorities='+JSON.stringify(result));
		priorities = result;

		return util.generateUniversitySelect({ default: 0 });

	}).then(function(result) {

		//logger.debug('universities='+JSON.stringify(result));
		universities = result;

		res.render('site/filter.pug', {
			message: '',
			messageType: '',
			records: records,
			priorities: priorities,
			universities: universities,
			type: req.params.type,
			isAuthorized: req.isAuthorized,
			userId: req.user_id
		});

	}).catch(function(err) {
		
		logger.error(err.message + err.stack);
		res.render('errors/500.pug');
	
	});
});

router.post('/ajax', function(req, res, next) {
	var db = null;
	var records = null;

	connectionPromise().then(function(connection) {
	
		db = connection;
		var sql;

		var priority_list;
		var priority_count;
		var limit = (req.body.limit) ? req.body.limit : 15;
		var offset = (req.body.offset) ? req.body.offset : 0;

		if (req.body.priorities) {
			priority_list = req.body.priorities.join(',');
			priority_count = req.body.priorities.length;
		} else {
			priority_list = '';
			priority_count = 0
		}

		if (req.body.type === 'find-flat') {
		
			sql = ` 
					SELECT
						v_user.user_id,
						user_sex,
						user_age,
						university_name,
						user_city,
						flat_address,
						flat_rent_pay,
						flat_id,
						flat_first_photo
					FROM v_user
					JOIN (
						/*выбрать пользователей у которых совпадают приоритеры с заданными*/
						SELECT user_id, COUNT(priority_option_id) cnt_priority
						FROM user_priority_option\n`;
			
			if (priority_count > 0) {
				sql+= `	WHERE priority_option_id IN (${priority_list})`;
			}
			
			sql+= `		GROUP BY user_id
						HAVING cnt_priority >= ${priority_count}
					) matched ON v_user.user_id = matched.user_id 
					WHERE 1=1
					  /* выбрать только тех, у кого есть квартира */
					  AND flat_id IS NOT NULL`;
			
			if (req.body.user_sex !== '') {
				sql+= ` 
					  AND v_user.user_sex = '${req.body.user_sex}'`;
			}
			
			if (req.body.user_age_range !== '') {
				var age_from = req.body.user_age_range.match(/^(\d+)-(\d+)$/)[1];
				var age_to = req.body.user_age_range.match(/^(\d+)-(\d+)$/)[2];
				sql+= ` 
					  AND v_user.user_age >= ${age_from} AND v_user.user_age <= ${age_to}`;
			}

			if (req.body.university_id != 0) {
				sql+= `
					  AND v_user.university_id = ${req.body.university_id}`;
			}

			if (req.body.faculty_id != 0) {
				sql+= ` 
					  AND v_user.faculty_id = ${req.body.faculty_id}`;
			}

			sql+=`
					LIMIT ${limit}
					OFFSET ${offset};`;
		
		} else {
		
			sql = `	SELECT
						v_user.user_id,
						user_first_name,
						user_last_name,
						user_sex,
						user_age,
						user_avatar,
						university_name
					FROM v_user 
					/* кроме тех, у кого не совпадают приоритеры*/
					JOIN (
						/*выбрать пользователей у которых совпадают приоритеры с заданными*/
						SELECT user_id, COUNT(priority_option_id) cnt_priority
						FROM user_priority_option\n`;
		
			if (priority_count > 0) {
				sql+= `	WHERE priority_option_id IN (${priority_list})`;
			}
		
			sql+= `		GROUP BY user_id
						HAVING cnt_priority >= ${priority_count}
					) matched ON v_user.user_id = matched.user_id
					/* кроме тех, у кого есть квартира */
					WHERE flat_id IS NULL`;
			if (req.body.user_sex !== '') {
				sql+= ` 
					  AND v_user.user_sex = '${req.body.user_sex}'`;
			}
			
			if (req.body.user_age_range !== '') {
				var age_from = req.body.user_age_range.match(/^(\d+)-(\d+)$/)[1];
				var age_to = req.body.user_age_range.match(/^(\d+)-(\d+)$/)[2];
				sql+= ` 
					  AND v_user.user_age >= ${age_from} AND v_user.user_age <= ${age_to}`;
			}

			if (req.body.university_id != 0) {
				sql+= `
					  AND v_user.university_id = ${req.body.university_id}`;
			}

			if (req.body.faculty_id != 0) {
				sql+= ` 
					  AND v_user.faculty_id = ${req.body.faculty_id}`;
			}
			sql+=`	LIMIT ${limit}
					OFFSET ${offset};`;
		}

		logger.debug(sql);
		return db.queryAsync(sql);
	
	}).then(function(result) {	
		
		//logger.debug('result');
		records = result;

		res.json({
			status: 'ok',
			records: records
		});
	
	}).catch(function(err) {
		
		logger.error(err.message, err.stack);
		res.json({
			status: 'not ok'
		});

	});
});

module.exports = router;