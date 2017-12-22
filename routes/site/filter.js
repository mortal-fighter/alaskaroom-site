'use strict';

const router = require('express').Router();
const Promise = require('bluebird');
const logger = require('log4js').getLogger();

const connectionPromise = require('../../components/connectionPromise.js');
const util = require('../../components/myUtil.js');

router.get('/:type(\\S+)?', function(req, res, next) {
	var db = null;
	var records = null;
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
						\`user\`.id	user_id,
						sex			user_sex,
						age			user_age,
						university	user_university,
						city		user_city,
						address		flat_address,
						rent_pay	flat_rent_pay,
						(SELECT src_small FROM photo WHERE photo.flat_id = flat.id LIMIT 1) photo_src_small,
						flat_id
					FROM \`user\`
					JOIN flat ON flat_id = flat.id`;
		} else {
			sql = `	SELECT 
						\`user\`.id	user_id,
						first_name	user_first_name,
						last_name	user_last_name,
						sex			user_sex,
						age			user_age,
						university	user_university,
						avatar		user_avatar,
						flat_id
					FROM \`user\` 
					WHERE flat_id IS NULL`;
		}

		//logger.debug(sql);
		return db.queryAsync(sql);
	
	}).then(function(result) {
		
		//logger.debug(result);
		records = result;

		return util.generatePrioritySelects(req, false);

	}).then(function(result) {

		console.log('result='+JSON.stringify(records));

		res.render('site/filter.pug', {
			message: '',
			messageType: '',
			records: records,
			priorities: result,
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
		var limit = (req.body.limit) ? req.body.limit : 9;
		var offset = (req.body.offset) ? req.body.offset : 0;

		if (req.body.priorities) {
			priority_list = req.body.priorities.join(',');
			priority_count = req.body.priorities.length;
		} else {
			priority_list = '';
			priority_count = 0
		}

		if (req.body.type === 'find-flat') {
		
			sql = `  SELECT 
						\`user\`.id	user_id,
						sex			user_sex,
						age			user_age,
						university	user_university,
						city		user_city,
						address		flat_address,
						rent_pay	flat_rent_pay,
						(SELECT src_small FROM photo WHERE photo.flat_id = flat.id LIMIT 1) photo_src_small,
						flat_id
					FROM \`user\`
					/* отсеить тех, у кого нет квартиры*/
					JOIN flat ON flat_id = flat.id
					/* отсеить тех, у кого не совпадают приоритеры*/
					JOIN (
						/*выбрать пользователей у которых совпадают приоритеры с заданными*/
						SELECT user_id, COUNT(priority_option_id) cnt_priority
						FROM user_priority_option\n`;
			
			if (priority_count > 0) {
				sql+= `	WHERE priority_option_id IN (${priority_list})`;
			}
			
			sql+= `		GROUP BY user_id
						HAVING cnt_priority >= ${priority_count}
					) matched ON \`user\`.id = matched.user_id
					LIMIT ${limit}
					OFFSET ${offset};`;
		
		} else {
		
			sql = `	SELECT
						\`user\`.id	user_id,
						first_name	user_first_name,
						last_name	user_last_name,
						sex			user_sex,
						age			user_age,
						university	user_university,
						avatar		user_avatar,
						flat_id
					FROM \`user\` 
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
					) matched ON \`user\`.id = matched.user_id
					/* кроме тех, у кого есть квартира */
					WHERE flat_id IS NULL
					LIMIT ${limit}
					OFFSET ${offset};`;
		}

		logger.debug(sql);
		return db.queryAsync(sql);
	
	}).then(function(result) {	
		
		logger.debug('result');
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