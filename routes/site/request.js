'use strict';

const router = require('express').Router();
const Promise = require('bluebird');
const logger = require('log4js').getLogger();

const connectionPromise = require('../../components/connectionPromise.js');

router.get('/:type(\\S+)?', function(req, res, next) {
	var db = null;
	var records = [];

	if (!req.params.type) {
		req.params.type = 'sended';
	}

	connectionPromise().then(function(connection) {

		db = connection;

		var sql = '';

		switch (req.params.type) {
			case 'sended':
				sql = `	SELECT 	req.id 	request_id,
						to_user_id,
						\`status\`,
						\`User\`.id 	user_id,
						first_name,
						last_name,
						age,
						university,
						faculty,
						study_year,
						avatar
				FROM Roommate_request req
				JOIN \`User\` ON to_user_id = \`User\`.id
				WHERE from_user_id = ${req.user_id};`;
				break;
			case 'incoming':
				sql = `	SELECT 	req.id 		request_id,
							from_user_id,
							\`User\`.id 	user_id,
							first_name,
							last_name,
							age,
							university,
							faculty,
							study_year,
							avatar
						FROM Roommate_request req
						JOIN \`User\` ON from_user_id = \`User\`.id
						WHERE to_user_id = ${req.user_id};`;
				break;
			case 'accepted':
				sql = `	SELECT 	req.id 		request_id,
							from_user_id,
							\`User\`.id 	user_id,
							first_name,
							last_name,
							age,
							university,
							faculty,
							study_year,
							avatar
						FROM Roommate_request req
						JOIN \`User\` ON from_user_id = \`User\`.id
						WHERE to_user_id = ${req.user_id};
						  AND \`status\` = 'accepted';`;
				break;
			case 'complains':
				sql = ` SELECT 1;`;
				break;
		}
		
		logger.debug(sql);
		return db.queryAsync(sql);

	}).then(function(result) {

		logger.debug(result);
		records = result;

		res.render('site/request.pug', {
			records: records,
			type: req.params.type,
			isAuthorized: req.isAuthorized,
			user_id: req.user_id
		});
	
	}).catch(function(err) {
		
		logger.error(err.message + '\n' + err.stack);
		res.render('errors/500.pug');

	});

});

router.post('/invite', function(req, res, next) {
	var db = null;
	
	if (!req.isAuthorized) {
		res.redirect('/?message=Пожалуйста,%20авторизуйтесь%20в%20системе');
		return;
	}

	connectionPromise().then(function(connection) {
	
		db = connection;
		var sql = ` SELECT COUNT(*) cnt
					FROM Roommate_request 
					WHERE from_user_id = ${req.user_id}
					  AND to_user_id = ${req.body.user_id}`;

		logger.debug(sql);
		return db.queryAsync(sql);
	
	}).then(function(result) {	
		
		logger.debug(result);
		
		if (result[0].cnt > 0) {
			throw new Error('USER_ALREADY_INVITED');
		}

		var sql = `	INSERT INTO Roommate_request(
						from_user_id,
						to_user_id,
						status,
						date_created,
						date_updated)
					VALUES (
						${req.user_id},
						${req.body.user_id},
						'pending',
						NOW(),
						NOW());`;

		logger.debug(sql);
		return db.queryAsync(sql);
	
	}).then(function(result) {

		logger.debug(result);
		res.json({
			status: 'ok'
		});
	
	}).catch(function(err) {
		
		logger.error(err.message + '\n' + err.stack);
		res.json({
			status: 'not ok'
		});

	});
});

router.post('/accept', function(req, res, next) {
	var db = null;
	
	if (!req.isAuthorized) {
		res.redirect('/?message=Пожалуйста,%20авторизуйтесь%20в%20системе');
		return;
	}

	connectionPromise().then(function(connection) {
	
		db = connection;
		var sql = ` UPDATE Roommate_request
					SET \`status\` = 'accepted'	
					WHERE id = ${req.body.requestId};`;

		logger.debug(sql);
		return db.queryAsync(sql);
	
	}).then(function(result) {	
		
		logger.debug(result);

		var sql = `	SELECT phone
					FROM \`User\`
					JOIN Roommate_request req ON \`User\`.id = from_user_id
					WHERE req.id = ${req.body.requestId};`;

		logger.debug(sql);
		return db.queryAsync(sql);
	
	}).then(function(result) {

		logger.debug(result);
		res.json({
			status: 'ok',
			phone: result[0].phone
		});
	
	}).catch(function(err) {
		
		logger.error(err.message + '\n' + err.stack);
		res.json({
			status: 'not ok'
		});

	});
});

router.post('/decline', function(req, res, next) {
	var db = null;
	
	if (!req.isAuthorized) {
		res.redirect('/?message=Пожалуйста,%20авторизуйтесь%20в%20системе');
		return;
	}

	connectionPromise().then(function(connection) {
	
		db = connection;
		var sql = ` UPDATE Roommate_request
					SET \`status\` = 'declined'	
					WHERE id = ${req.body.requestId};`;

		logger.debug(sql);
		return db.queryAsync(sql);
	
	}).then(function(result) {

		logger.debug(result);
		res.json({
			status: 'ok'
		});

	}).catch(function(err) {
		
		logger.error(err.message + '\n' + err.stack);
		res.json({
			status: 'not ok'
		});

	});
});

module.exports = router;