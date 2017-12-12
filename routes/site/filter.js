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
						\`User\`.id	user_id,
						sex			user_sex,
						age			user_age,
						university	user_university,
						city		user_city,
						address		user_address,
						rent_pay	flat_rent_pay,
						(SELECT src_small FROM Photo WHERE Photo.flat_id = Flat.id LIMIT 1) photo_src_small,
						flat_id
					FROM \`User\`
					JOIN Flat ON flat_id = Flat.id`;
		} else {
			sql = `	SELECT 
						\`User\`.id	user_id,
						first_name	user_first_name,
						last_name	user_last_name,
						sex			user_sex,
						age			user_age,
						university	user_university,
						avatar		user_avatar,
						flat_id
					FROM \`User\` 
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

		var priority_list = req.body.priorities.join(',');

		if (req.body.type === 'find-flat') {
			sql = `  SELECT 
						\`User\`.id	user_id,
						sex			user_sex,
						age			user_age,
						university	user_university,
						city		user_city,
						address		user_address,
						rent_pay	flat_rent_pay,
						(SELECT src_small FROM Photo WHERE Photo.flat_id = Flat.id LIMIT 1) photo_src_small,
						flat_id
					FROM \`User\`
					/* отсеить тех, у кого нет квартиры*/
					JOIN Flat ON flat_id = Flat.id
					/* отсеить тех, у кого не совпадают приоритеры*/
					JOIN (
						/*выбрать пользователей у которых совпадают приоритеры с заданными*/
						SELECT user_id, COUNT(priority_option_id) cnt_priority
						FROM user_priority_option
						WHERE priority_option_id IN (${priority_list})
						GROUP BY user_id
						HAVING cnt_priority >= 
							(SELECT COUNT(*) FROM priority)
					) matched ON \`User\`.id = matched.user_id`;
		} else {
			sql = `	SELECT 
						\`User\`.id	user_id,
						first_name	user_first_name,
						last_name	user_last_name,
						sex			user_sex,
						age			user_age,
						university	user_university,
						avatar		user_avatar,
						flat_id
					FROM \`User\` 
					/* кроме тех, у кого не совпадают приоритеры*/
					JOIN (
						/*выбрать пользователей у которых совпадают приоритеры с заданными*/
						SELECT user_id, COUNT(priority_option_id) cnt_priority
						FROM user_priority_option
						WHERE priority_option_id IN (${priority_list})
						GROUP BY user_id
						HAVING cnt_priority >= 
							(SELECT COUNT(*) FROM priority)
					) matched ON \`User\`.id = matched.user_id
					/* кроме тех, у кого есть квартира */
					WHERE flat_id IS NULL`;
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