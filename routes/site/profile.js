'use strict';

const router = require('express').Router();
const Promise = require('bluebird');
const connectionPromise = require('../../components/connectionPromise.js');
const logger = require('log4js').getLogger();


router.get('/user/:userId(\\d+)', function(req, res, next) {
	
	var db = null;
	
	if (!req.isAuthorized) {
		res.redirect(`/?message='Пожалуйста, авторизуйтесь в системе`);
		return;
	}

	var data = null;
	var priorities = [];
	var photos = [];

	connectionPromise().then(function(connection) {
		
		db = connection;
		
		var sql = `	SELECT 
						avatar 		user_avatar,
						age 		user_age,
						university 	user_university,
						faculty 	user_faculty,
						about 		user_about,
						first_name	user_first_name,
						last_name	user_last_name,
						CONCAT(first_name, " ", last_name) user_name,
						flat_id,
						description flat_description,
						square 		flat_square,
						traffic 	flat_traffic,
						address 	flat_address,
						room_num 	flat_room_num,
						rent_pay 	flat_rent_pay,
						total_pay 	flat_total_pay
					FROM \`User\`
					LEFT JOIN Flat ON \`User\`.flat_id = Flat.id
					WHERE \`User\`.id = ${req.params.userId};`;
		logger.debug(sql);
		return db.queryAsync(sql);
	
	}).then(function(result) {

		logger.debug(result);
		data = result[0];

		var sql = `	SELECT priority_name, option_name
					FROM v_user_priority
					WHERE user_id = ${req.params.userId};`;
		logger.debug(sql);
		return db.queryAsync(sql);
	
	}).then(function(result) {
			
		logger.debug(result);
		priorities = result;		
		
		if (data.flat_id) {
			return Promise.resolve().then(function() {	
				var sql = `	SELECT 
								src_small, src_orig,
								width_small, height_small, width_orig, height_orig
							FROM Photo
							WHERE flat_id = ${data.flat_id};`;
				return db.queryAsync(sql);
			}).then(function(result) {
				logger.debug(result);
				photos = result;
			});
		} else {
			return Promise.resolve();
		}
	
	}).then(function() {
		
		res.render('site/profile_view.pug', {
			user_id: req.params.userId,
			data: data,
			photos: photos,
			priorities: priorities
		});
	
	}).catch(function(err) {
		
		logger.error(err.message, err.stack);
		res.render('errors/500.pug');
	
	});
});

router.get('/edit_user/:userId(\\d+)', function(req, res, next) {
	var db = null;
	
	if (!req.isAuthorized) {
		res.redirect(`/?message='Пожалуйста, авторизуйтесь в системе`);
		return;
	}

	var data = null;
	var photos = [];
	var priorities = [];
	var userPriorities = [];
	var priorProcessed = [];
	
	connectionPromise().then(function(connection) {
		
		db = connection;
		
		var sql = `	SELECT 
						avatar 		user_avatar,
						age 		user_age,
						university 	user_university,
						faculty 	user_faculty,
						about 		user_about,
						first_name	user_first_name,
						last_name	user_last_name,
						CONCAT(first_name, " ", last_name) user_name,
						flat_id,
						description flat_description,
						square 		flat_square,
						traffic 	flat_traffic,
						address 	flat_address,
						room_num 	flat_room_num,
						rent_pay 	flat_rent_pay,
						total_pay 	flat_total_pay
					FROM \`User\`
					LEFT JOIN Flat ON \`User\`.flat_id = Flat.id
					WHERE \`User\`.id = ${req.params.userId};`;
		logger.debug(sql);
		return db.queryAsync(sql);
	
	}).then(function(result) {

		logger.debug(result);
		data = result[0];

		var sql = `	SELECT * FROM v_priority`;
		logger.debug(sql);
		return db.queryAsync(sql);

	}).then(function(result) {

		logger.debug(result);
		priorities = result;

		var sql = `	SELECT * FROM v_user_priority WHERE user_id = ${req.params.userId};`;
		logger.debug(sql);
		return db.queryAsync(sql);

	}).then(function(result) {

		logger.debug(result);
		userPriorities = result;

		// construct priority <select>s (begin)

		var currentPriorityId = -1;
		var itemNum = -1;
		var isSelected = false;

		for (var i = 0; i < priorities.length; i++) {
			var priority = priorities[i];

			if (priority.priority_id !== currentPriorityId) {
				priorProcessed.push({
					priority_name_full: priority.priority_name_full,
					options: []
				});
				itemNum++;
				isSelected = false;
				currentPriorityId = priority.priority_id;
			}

			if (!isSelected && userPriorities.length) {
				for (var j = 0; j < userPriorities.length; j++) {
					if (userPriorities[j].priority_option_id === priority.option_id) {
						isSelected = true;
						return false; // break the loop
					}
				}
			}

			priorProcessed[itemNum].options.push({
				id: priority.option_id,
				name: priority.option_name,
				isSelected: isSelected
			});
		}	
		
		if (data.flat_id) {
			return Promise.resolve().then(function() {	
				var sql = `	SELECT 
								src_small, src_orig,
								width_small, height_small, width_orig, height_orig
							FROM Photo
							WHERE flat_id = ${data.flat_id};`;
				return db.queryAsync(sql);
			}).then(function(result) {
				logger.debug(result);
				photos = result;
			});
		} else {
			return Promise.resolve();
		}
	
	}).then(function() {
		
		res.render('site/profile_edit.pug', {
			user_id: req.params.userId,
			data: data,
			photos: photos,
			priorities: priorProcessed
		});
	
	}).catch(function(err) {
		
		logger.error(err.message, err.stack);
		res.render('errors/500.pug');
	
	});

});

module.exports = router;