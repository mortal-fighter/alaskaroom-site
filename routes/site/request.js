'use strict';

const router = require('express').Router();
const Promise = require('bluebird');
const logger = require('log4js').getLogger();

const connectionPromise = require('../../components/connectionPromise.js');

router.get('/get_count_:type(\\S+)', function(req, res, next) {
		var db = null;

		if (!req.isAuthorized) {
			res.redirect('/?message=Пожалуйста,%20авторизуйтесь%20в%20системе');
			return;
		}

		connectionPromise().then(function(connection) {

			db = connection;
			var sql = '';

			if (req.params.type === 'incoming') {
				sql = ` SELECT count(*) cnt
						FROM roommate_request
						WHERE to_user_id = ${req.user_id}
						  AND is_viewed = false;`;
			} else if (req.params.type === 'accepted') {
				sql = ` SELECT count(*) cnt
						FROM roommate_request
						WHERE from_user_id = ${req.user_id}
						  AND \`status\` = 'accepted'
						  AND is_viewed = false;`;
			}

			logger.debug(sql);
			return db.queryAsync(sql);

		}).then(function(result) {

			logger.debug(result);
			res.json({
				status: 'ok',
				count: result[0].cnt
			});
		
		}).catch(function(err) {
			
			logger.error(err.message + '\n' + err.stack);
			res.json({ status: 'not ok' });

		});
});

router.get('/ajax_get_form_complain', function(req, res, next) {
	var db = null;

	connectionPromise().then(function(connection) {

		db = connection;

		var sql = ' SELECT id, name FROM complain;';
		return db.queryAsync(sql);
	
	}).then(function(result) {

		res.render('site/includes/form_complain.pug', {
			complainReasons: result
		});

	}).catch(function(err) {

		logger.error(err.message + '\n' + err.stack);
		res.render('errors/500.pug');

	});
});

router.get('/:type(\\S+)?', function(req, res, next) {
	var db = null;
	var records = [];
	var complainReasons = [];

	if (!req.params.type) {
		req.params.type = 'sended';
	}

	if (!req.isAuthorized) {
		res.redirect('/?message=Пожалуйста,%20авторизуйтесь%20в%20системе');
		return;
	}

	connectionPromise().then(function(connection) {

		db = connection;

		var sql = '';
		
		switch (req.params.type) {
			case 'sended':
				sql = `	SELECT 	req.id 	request_id,
						to_user_id,
						\`status\`,
						\`user\`.id 	user_id,
						first_name,
						last_name,
						age,
						university,
						faculty,
						study_year,
						avatar
				FROM roommate_request req
				JOIN \`user\` ON to_user_id = \`user\`.id
				WHERE from_user_id = ${req.user_id}
				  AND \`status\` <> 'accepted'`;
				break;
			case 'incoming':
				sql = `	SELECT 	req.id 		request_id,
							from_user_id,
							\`status\`,
							\`user\`.id 	user_id,
							first_name,
							last_name,
							age,
							university,
							faculty,
							study_year,
							avatar
						FROM roommate_request req
						JOIN \`user\` ON from_user_id = \`user\`.id
						WHERE to_user_id = ${req.user_id};`;
				break;
			case 'accepted':
				sql = `	SELECT 	req.id 	request_id,
								to_user_id,
								\`status\`,
								\`user\`.id 	user_id,
								first_name,
								last_name,
								age,
								university,
								faculty,
								study_year,
								avatar
						FROM roommate_request req
						JOIN \`user\` ON to_user_id = \`user\`.id
						WHERE from_user_id = ${req.user_id}
						  AND \`status\` = 'accepted'`;
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

		var sql = `	SELECT id, name FROM complain;`;	
		logger.debug(sql);

		return db.queryAsync(sql);

	}).then(function(result) {

		logger.debug(result);
		complainReasons = result;

		res.render('site/request.pug', {
			records: records,
			complainReasons: complainReasons,
			type: req.params.type,
			isAuthorized: req.isAuthorized,
			userId: req.user_id,
			isUnderConstruction: (req.params.type === 'complains') ? true : false
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
					FROM roommate_request 
					WHERE from_user_id = ${req.user_id}
					  AND to_user_id = ${req.body.user_id}`;

		logger.debug(sql);
		return db.queryAsync(sql);
	
	}).then(function(result) {	
		
		logger.debug(result);
		
		if (result[0].cnt > 0) {
			throw new Error('USER_ALREADY_INVITED');
		}

		var sql = `	INSERT INTO roommate_request(
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
		var sql = ` UPDATE roommate_request
					SET \`status\` = 'accepted'	
					WHERE id = ${req.body.requestId};`;

		logger.debug(sql);
		return db.queryAsync(sql);
	
	}).then(function(result) {	
		
		logger.debug(result);

		var sql = `	SELECT phone
					FROM \`user\`
					JOIN roommate_request req ON \`user\`.id = from_user_id
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
		var sql = ` UPDATE roommate_request
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

router.post('/complain', function(req, res, next) {
	var db = null;
	var complainsAvailable = null;
	var isUserUpdated = false;
	
	if (!req.isAuthorized) {
		res.redirect('/?message=Пожалуйста,%20авторизуйтесь%20в%20системе');
		return;
	}

	connectionPromise().then(function(connection) {
	
		db = connection;
		var sql = ` 
			SELECT 
				complains_available,
				(SELECT COUNT(*)
					FROM user_complains
					WHERE from_user_id = ${req.user_id}
					AND to_user_id = ${req.body.user_id}) cnt
			FROM \`user\`	
			WHERE id = ${req.user_id};`;
		logger.debug(sql);
		return db.queryAsync(sql);
	
	}).then(function(result) {

		logger.debug(result);
		complainsAvailable = result[0].complains_available;

		if (complainsAvailable == 0) {
			throw new Error('NO_AVAILABLE_COMPLAINS');
		}

		if (result[0].cnt > 0) {
			throw new Error('COMPLAIN_IS_ALREADY_EXISTS');	
		}

		var sql = ` UPDATE \`user\`
					SET complains_available = ${complainsAvailable - 1} 	
					WHERE id = ${req.user_id};`;

		logger.debug(sql);
		return db.queryAsync(sql);
	
	}).then(function(result) {

		logger.debug(result);

		if (result.affectedRows > 0) {
			isUserUpdated = true;
		}

		var sql = ` INSERT INTO user_complains(
						from_user_id,
						to_user_id,
						complain_id,
						comment,
						date_created) 
					VALUES (
						${req.user_id},
						${req.body.user_id},
						${req.body.complain_id},
						'${req.body.complain_comment}',
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

		if (isUserUpdated) {
			logger.debug('Rollback table \'user\'');
			var sql = ` UPDATE \`user\` 
						SET complains_available = ${complainsAvailable}
						WHERE id = ${req.user_id};`;
			logger.debug(sql);
			db.queryAsync(sql);
		}

		res.json({
			status: 'not ok',
			reason: err.message
		});

	});
});


module.exports = router;