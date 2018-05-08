'use strict';

const router = require('express').Router();
const Promise = require('bluebird');
const logger = require('log4js').getLogger();

const connectionPromise = require('../../components/connectionPromise.js');
const sendmailPromise = require('../../components/sendmailPromise.js');
const util = require('../../components/myUtil.js');
const config = require('../../config/common.js');

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

router.post('/has_new_requests', function(req, res, next) {

	var countIncoming = 0;
	var countAccepted = 0;
	var db = null;

	if (!req.isAuthorized) {
		res.redirect('/?message=Пожалуйста,%20авторизуйтесь%20в%20системе');
		return;
	}
	
	connectionPromise().then(function(connection) {

		db = connection;

		var sql = ` SELECT count(*) cnt FROM roommate_request WHERE is_viewed = 0 AND to_user_id = ${req.user_id};`;
		//logger.debug(sql);

		return connection.queryAsync(sql);

	}).then(function(result) {

		//logger.debug(result);
		countIncoming = result[0].cnt;	

		var sql = ` SELECT count(*) cnt FROM roommate_request WHERE is_viewed = 0 AND from_user_id = ${req.user_id} AND status = 'accepted';`;
		//logger.debug(sql);

		return db.queryAsync(sql);

	}).then(function(result) {

		//logger.debug(result);
		countAccepted = result[0].cnt;	

		res.json({
			status: 'ok',
			countIncoming: countIncoming,
			countAccepted: countAccepted
		});

	}).catch(function(err) {
	
		logger.error(err.message + '\n' + err.stack);
		res.json({
			status: 'not ok'
		});
	
	});
});

router.post('/requests_seen', function(req, res, next) {

	if (!req.isAuthorized) {
		res.redirect('/?message=Пожалуйста,%20авторизуйтесь%20в%20системе');
		return;
	}

	if (req.body.type !== 'incoming' && req.body.type !== 'accepted') {
		throw new Error(`Parameters validation error: req.body.type = '${req.body.type}'`);
	}

	connectionPromise().then(function(connection) {

		var sql = '';
		if (req.body.type === 'incoming') {
			sql = ` UPDATE roommate_request SET is_viewed = 1 WHERE to_user_id = ${req.user_id} AND is_viewed = 0;`;
		} else {
			sql = ` UPDATE roommate_request SET is_viewed = 1 WHERE from_user_id = ${req.user_id} AND status = 'accepted' AND is_viewed = 0;`;
		}
		logger.debug(sql);
		return connection.queryAsync(sql);

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
		req.params.type = 'incoming';
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
						req.to_user_id,
						req.status,
						user_id,
						user_first_name,
						user_last_name,
						user_age,
						university_name,
						faculty_name,
						studyyear_name,
						user_avatar
				FROM roommate_request req
				JOIN v_user ON to_user_id = v_user.user_id
				WHERE from_user_id = ${req.user_id}
				  AND req.status <> 'accepted'`;
				break;
			case 'incoming':
				sql = `	SELECT 	req.id 		request_id,
							req.from_user_id,
							req.status,
							user_id,
							user_first_name,
							user_last_name,
							user_age,
							university_name,
							faculty_name,
							studyyear_name,
							user_avatar,
							user_phone
						FROM roommate_request req
						JOIN v_user ON from_user_id = v_user.user_id
						WHERE to_user_id = ${req.user_id};`;
				break;
			case 'accepted':
				sql = `	SELECT 	req.id 	request_id,
								req.to_user_id,
								req.status,
								user_id,
								user_first_name,
								user_last_name,
								user_age,
								university_name,
								faculty_name,
								studyyear_name,
								user_avatar,
								user_phone
						FROM roommate_request req
						JOIN v_user ON to_user_id = v_user.user_id
						WHERE from_user_id = ${req.user_id}
						  AND req.status = 'accepted'`;
				break;
			case 'complains':
				sql = ` SELECT 1;`;
				break;
			default:
				throw new Error(`Parameters validation error: req.params.type='${req.params.type}' is inconsistent;`);
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
		
		if (err.message.match(/^Parameters validation error:/)) {
			res.render('errors/404.pug');	
		} else {
			res.render('errors/500.pug');
		}
	});

});

router.post('/invite', function(req, res, next) {
	var db = null;
	var from = null;
	var to = null;
	
	if (!req.isAuthorized) {
		res.redirect('/?message=Пожалуйста,%20авторизуйтесь%20в%20системе');
		return;
	}

	connectionPromise().then(function(connection) {
	
		db = connection;
		
		util.formatObjectForSQL(req.body);

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

	}).then(function() {

		var sql = `	SELECT 
						id 				user_id, 
						first_name 		user_first_name,
						last_name 		user_last_name
					FROM user
					WHERE id = ${req.user_id};`;

		logger.debug(sql);
		return db.queryAsync(sql);

	}).then(function(result) {

		logger.debug(result);
		from = result[0];

		var sql = `	SELECT 
						first_name 		user_first_name,
						email 			user_email,
						is_emailable
					FROM user
					WHERE id = ${req.body.user_id};`;

		logger.debug(sql);
		return db.queryAsync(sql);

	}).then(function(result) {

		logger.debug(result);
		to = result[0];

		if (to.is_emailable === 0) return Promise.resolve();

		const options = {
			from: config.mailer.smtpConfig.auth.user,
			to: to.user_email,
			subject: `${from.user_first_name + ' ' + from.user_last_name} предложил Вам соседство`,
			text: `
				Здравствуйте, ${to.user_first_name}! 
				Пользователь ${from.user_first_name + ' ' + from.user_last_name} отправил Вам заявку на соседство. Вы можете ответить ему на странице Отклики -> Полученные.
				
				--------
				С уважением, 
				команда Alaskaroom.ru

				Если вы не хотите больше получать от нас письма, перейдите по ссылке http://alaskaroom.ru/profile/unsubscribe
			`,
			html: `
				<p>Здравствуйте, ${to.user_first_name}!</p> 
				<p>Пользователь <a href='http://alaskaroom.ru/profile/view/${from.user_id}'>${from.user_first_name + ' ' + from.user_last_name}</a> отправил Вам заявку на соседство. Вы можете ответить ему на странице <a href='http://alaskaroom.ru/requests/incoming'>Полученные отклики</a>.</p>
				<br>
				--------<br>
				С уважением,<br> 
				команда Alaskaroom.ru<br>
				<br>
				<span style="font-size:10px">Если вы не хотите больше получать от нас письма, перейдите по <a href="http://alaskaroom.ru/profile/unsubscribe">ссылке</a></span> 
			`
		};

		return sendmailPromise(options);

	}).catch(function(err) {
		
		logger.error(err.message + '\n' + err.stack);

	});
});

router.post('/accept', function(req, res, next) {
	var db = null;
	var from = null;
	var to = null;

	if (!req.isAuthorized) {
		res.redirect('/?message=Пожалуйста,%20авторизуйтесь%20в%20системе');
		return;
	}

	connectionPromise().then(function(connection) {
	
		db = connection;
		util.formatObjectForSQL(req.body);

		var sql = ` SELECT to_user_id
					FROM roommate_request
					WHERE id = ${req.body.requestId};`;

		logger.debug(sql);
		return db.queryAsync(sql);

	}).then(function(result) {

		logger.debug(result);

		if (result[0].to_user_id !== req.user_id) {
			throw new Error(`Trying to accept request ('friend request') which is not belong to user. Request_id = ${req.body.requestId}, user_id = ${req.user_id}.`);
		}

		var sql = ` UPDATE roommate_request
					SET \`status\` = 'accepted'	
					WHERE id = ${req.body.requestId};`;

		logger.debug(sql);
		return db.queryAsync(sql);
	
	}).then(function(result) {	
		
		logger.debug(result);

		var sql = `	SELECT 
						user_id, 
						user_phone,
						user_first_name,
						user_last_name
					FROM v_user
					JOIN roommate_request req ON v_user.user_id = from_user_id
					WHERE req.id = ${req.body.requestId};`;

		logger.debug(sql);
		return db.queryAsync(sql);
	
	}).then(function(result) {

		logger.debug(result);
		from = result[0];
		res.json({
			status: 'ok',
			phone: result[0].user_phone
		});
	
	}).then(function() {

		var sql = `	SELECT 
						user_id, 
						user_first_name,
						user_last_name,
						user_email,
						user_phone
					FROM v_user
					JOIN roommate_request req ON v_user.user_id = to_user_id
					WHERE req.id = ${req.body.requestId};`;

		logger.debug(sql);
		return db.queryAsync(sql);

	}).then(function(result) {

		logger.debug(result);
		to = result[0];

		const options = {
			from: config.mailer.smtpConfig.auth.user,
			to: to.user_email,
			subject: `${to.user_first_name + ' ' + to.user_last_name} принял Вашу заявку`,
			text: `
				Здравствуйте, ${from.user_first_name}! 
				Пользователь ${to.user_first_name + ' ' + to.user_last_name} принял Вашу заявку на соседство. Теперь Вы можете связаться с ним, позвонив ему по телефону ${to.user_phone}.
				
				--------
				С уважением, 
				команда Alaskaroom.ru
			`,
			html: `
				<p>Здравствуйте, ${from.user_first_name}!</p> 
				<p>Пользователь <a href='http://alaskaroom.ru/profile/view/${to.user_id}'>${to.user_first_name + ' ' + to.user_last_name}</a> принял Вашу заявку на соседство. Теперь Вы можете связаться с ним, позвонив ему по телефону ${to.user_phone}.</p>
				<br>
				--------<br>
				С уважением,<br> 
				команда Alaskaroom.ru<br>
			`
		};

		return sendmailPromise(options);

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

		util.formatObjectForSQL(req.body);

		var sql = ` SELECT to_user_id
					FROM roommate_request
					WHERE id = ${req.body.requestId};`;

		logger.debug(sql);
		return db.queryAsync(sql);

	}).then(function(result) {

		logger.debug(result);

		if (result[0].to_user_id !== req.user_id) {
			throw new Error(`Trying to decline request ('friend request') which is not belong to user. Request_id = ${req.body.requestId}, user_id = ${req.user_id}.`);
		}

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

		util.formatObjectForSQL(req.body);

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
						${req.body.complain_comment},
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