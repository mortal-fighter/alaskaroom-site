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
	var recordsCountTotal = 0;
	var priorities = [];
	var universities = [];

	req.params.type = (req.params.type) ? req.params.type : 'find-flat';

	if (!req.isAuthorized) {
		res.redirect('/?message=Пожалуйста,%20авторизуйтесь%20в%20системе');
		return;
	}

	connectionPromise().then(function(connection) {

		db = connection;
		return util.generatePrioritySelects(req, { fill: false });

	}).then(function(result) {

		priorities = result;

		return util.generateUniversitySelect({ default: 0 });

	}).then(function(result) {

		//logger.debug('universities='+JSON.stringify(result));
		universities = result;

		res.render('site/filter.pug', {
			message: '',
			messageType: '',
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

function validateSearchParameters(obj) {
	if ( obj.limit && !obj.limit.match(/^\d+$/) ) {
		throw new Error(`Parameters validation error: req.body.limit = '${obj.limit}' is not a valid number `);
	}
	if ( obj.offset && !obj.offset.match(/^\d+$/) ) {
		throw new Error(`Parameters validation error: req.body.offset = '${obj.offset}' is not a valid number `);
	}
	if (obj.priorities) {
		var valid = true;
		for (var i = 0; i < obj.priorities.length; i++) {
			if (!obj.priorities[i].match(/^\d+$/)) {
				throw new Error(`Parameters validation error: req.body.priorities = '${JSON.stringify(obj.priorities)}' is not a valid number array `);
			}
		}
	}
	if (obj.user_sex !== '' && obj.user_sex !== 'мужской' && obj.user_sex !== 'женский' && obj.user_sex !== 'не важно') {
		throw new Error(`Parameters validation error: req.body.user_sex = '${obj.user_sex}' is invalid `);
	}
	if (obj.user_age_range !== '' && !obj.user_age_range.match(/^(\d+)-(\d+)$/)) {
		throw new Error(`Parameters validation error: req.body.user_age_range = '${obj.user_age_range}' is invalid `);
	}
}

router.post('/ajax', function(req, res, next) {
	var db = null;
	var records = null;
	var recordsCountTotal = 0;
	var sqlCount = '';

	connectionPromise().then(function(connection) {
	
		db = connection;
			
		validateSearchParameters(req.body);

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
			priority_count = 0;
		}
			
		sql = `	SELECT
					v_user.user_id,
					user_first_name,
					user_last_name,\n`;

		if (req.body.sortby === '1') {
			sql += `similarity.percent,\n`;
		}
		
		sql +=	`	user_sex,
					user_age,
					user_avatar,
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
			sql+= `	WHERE priority_option_id IN (${priority_list})\n`;
		}
	
		sql+= `		GROUP BY user_id
					HAVING cnt_priority >= ${priority_count}
				) matched ON v_user.user_id = matched.user_id\n`;
		
		if (req.body.sortby === '1') {
			sql += `JOIN (
						SELECT user_id2 user_id, percent 
						FROM similarity
						WHERE user_id1 = ${req.user_id}
						UNION 
						SELECT user_id1 user_id, percent
						FROM similarity
						WHERE user_id2 = ${req.user_id}
					) similarity ON v_user.user_id = similarity.user_id\n`
		}

		if (req.body.type === 'find-flat') {
			sql += `WHERE user_search_status = 2\n`;
		} else {
			sql += `WHERE user_search_status = 1\n`;
		}

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
				  AND v_user.university_id = ${req.body.university_id.replace(/\'/g, '\\\'')}`;
		}

		if (req.body.faculty_id != 0) {
			sql+= ` 
				  AND v_user.faculty_id = ${req.body.faculty_id.replace(/\'/g, '\\\'')}`;
		}

		sql += `
					AND v_user.user_id <> ${req.user_id}`;

		if (req.body.sortby == '1') {
			sql += '\nORDER BY percent';
		} else {
			sql += '\nORDER BY v_user.user_date_register';
		}

		if (req.body.sortbyPriority == '1') {
			sql += ' DESC\n'
		} else {
			sql += ' \n';
		}

		sql+=`	LIMIT ${limit}
				OFFSET ${offset};`;
		
		// -----

		sqlCount = `	SELECT count(*) cnt
				FROM v_user 
				/* кроме тех, у кого не совпадают приоритеры*/
				JOIN (
					/*выбрать пользователей у которых совпадают приоритеры с заданными*/
					SELECT user_id, COUNT(priority_option_id) cnt_priority
					FROM user_priority_option\n`;
	
		if (priority_count > 0) {
			sqlCount+= `	WHERE priority_option_id IN (${priority_list})`;
		}
	
		sqlCount+= `		GROUP BY user_id
					HAVING cnt_priority >= ${priority_count}
				) matched ON v_user.user_id = matched.user_id\n`;

		if (req.body.sortby === '1') {
			sqlCount += `JOIN (
						SELECT user_id2 user_id, percent 
						FROM similarity
						WHERE user_id1 = ${req.user_id}
						UNION 
						SELECT user_id1 user_id, percent
						FROM similarity
						WHERE user_id2 = ${req.user_id}
					) similarity ON v_user.user_id = similarity.user_id\n`
		}
				
		if (req.body.type === 'find-flat') {
			sqlCount += `WHERE user_search_status = 2\n`;
		} else {
			sqlCount += `WHERE user_search_status = 1\n`;
		}
		
		if (req.body.user_sex !== '') {
			sqlCount+= ` 
				  AND v_user.user_sex = '${req.body.user_sex}'`;
		}
		
		if (req.body.user_age_range !== '') {
			var age_from = req.body.user_age_range.match(/^(\d+)-(\d+)$/)[1];
			var age_to = req.body.user_age_range.match(/^(\d+)-(\d+)$/)[2];
			sqlCount+= ` 
				  AND v_user.user_age >= ${age_from} AND v_user.user_age <= ${age_to}`;
		}

		if (req.body.university_id != 0) {
			sqlCount+= `
				  AND v_user.university_id = ${req.body.university_id.replace(/\'/g, '\\\'')}`;
		}

		if (req.body.faculty_id != 0) {
			sqlCount+= ` 
				  AND v_user.faculty_id = ${req.body.faculty_id.replace(/\'/g, '\\\'')}`;
		}

		sqlCount += `
				AND v_user.user_id <> ${req.user_id}`;

		logger.debug(sql);
		logger.debug(sqlCount);

		return db.queryAsync(sql);
	
	}).then(function(result) {

		records = result;
		return db.queryAsync(sqlCount);

	}).then(function(result) {	
		
		recordsCountTotal = result[0].cnt;

		res.json({
			status: 'ok',
			records: records,
			recordsCountTotal: recordsCountTotal
		});
	
	}).catch(function(err) {
		
		logger.error(err.message, err.stack);
		res.json({
			status: 'not ok'
		});

	});
});

module.exports = router;