'use strict';

const router = require('express').Router();
const Promise = require('bluebird');
const connectionPromise = require('../../components/connectionPromise.js');


router.get('/:userId(\\d+)?', function(req, res, next) {
	var db = null;
	var data = null;
	var priorities = [];
	var photos = [];
	
	if (!req.isAuthorized) {
		res.redirect(`/?message='Пожалуйста, авторизуйтесь в системе`);
		return;
	}

	connectionPromise().then(function(connection) {
		db = connection;
		
		var sql = `SELECT 
					avatar user_avatar,
					age user_age,
					university user_university,
					faculty user_faculty,
					about user_about,
					CONCAT(first_name, " ", last_name) user_name,
					flat_id,
					description flat_description,
					square flat_square,
					traffic flat_traffic,
					address flat_address,
					room_num flat_room_num,
					rent_pay flat_rent_pay,
					total_pay flat_total_pay
				FROM \`User\`
				LEFT JOIN Flat ON \`User\`.flat_id = Flat.id
				WHERE \`User\`.id = ${req.params.userId};`;
		console.log(sql);
		return db.queryAsync(sql);
	}).then(function(result) {
		console.log(result);
		data = result[0];

		var sql = `	SELECT priority_name, option_name
					FROM v_user_priority
					WHERE user_id = ${req.params.userId};`;
		console.log(sql);
		return db.queryAsync(sql);
	}).then(function(result) {
		console.log(result);
		priorities = result;

		if (data.flat_id) {
			var sql = `SELECT 
							src_small, src_orig,
							width_small, height_small, width_orig, height_orig
						FROM Photo
						WHERE flat_id = ${data.flat_id};`;
			return db.queryAsync(sql);
		} else {
			return Promise.resolve();
		}
	}).then(function(result) {
		if (data.flat_id) {
			console.log(result);
			photos = result;
		}
		res.render('site/profile.pug', {
			data: data,
			photos: photos,
			priorities: priorities
		});
	}).catch(function(err) {
		console.error(err.message, err.stack);
		res.render('errors/500.pug');
	});
});

module.exports = router;