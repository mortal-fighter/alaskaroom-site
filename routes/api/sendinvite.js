'use strict';
const router = require('express').Router();
const sendmailPromise = require('../../components/sendmailPromise.js');
const connectionPromise = require('../../components/connectionPromise.js');
const Promise = require('bluebird');
const fetch = require('isomorphic-fetch');
const config = require('../../config/common.js');
const FormData = require('form-data');
const logger = require('log4js').getLogger();

router.all('*', function(req, res, next) {
	if (!req.isAuth) {
		res.status(403).send('У Вас не достаточно прав для доступа к данному ресурсу.');
	}

	// The following processes data, received from the form into sql query values
	var obj = req.body;
	for (var key in obj) {
		if (obj.hasOwnProperty(key)) {
			//convert 'true'/'false' into 1/0 (checkbox values in mind...)
			switch (obj[key]) {
				case 'true':
					obj[key] = 1;
					break;
				case 'false':
					obj[key] = 0;
					break;
			}

			//convert blank strings into 'NULL's
			if (obj[key].length === 0) {
				obj[key] = 'NULL';	
			} 

			//escaping all, except 'NULL', into single quotes, preparing it for sql query
			if (obj[key] !== 'NULL') {
				obj[key] = '\'' + obj[key] + '\'';
			}
		
		}
	}

	req['user'] = {};

	next();
});

router.post('/', function (req, res, next) {
	var db = null;
	Promise.resolve().then(function() {
		if (req.body.userName.match(/$\s*^/) ||  
			!req.body.userEmail.match(/^([a-z0-9_-]+\.)*[a-z0-9_-]+@[a-z0-9_-]+(\.[a-z0-9_-]+)*\.[a-z]{2,6}$/) ) {
			
			throw new Error('VALIDATION_HAS_FAILED');
		}

		return connectionPromise();
	}).then(function(connection) {
		db = connection;
		var sql = `	INSERT INTO Users_beta (user_name, user_email) 
					VALUES (${req.body.userName}, ${req.body.userEmail})`;
		return db.queryAsync(sql);
	}).then(function() {
		const mailOptions = {
			from: config.app.emailAdmin,
			to: req.body.userEmail,
			subject: 'Сервис поиска руммейтов Alaska Room',
			text: `
				Здравствуйте, ${req.body.userName}!
				
				Сообщаем, что Вы успешно зарегистрировались на сайте Alaska Room.

				Спасибо!
			`,
			html: `
				<p>Здравствуйте, ${req.body.userName}!</p>
				
				<p>Сообщаем, что Вы успешно зарегистрировались на сайте Alaska Room.</p>

				<p>Спасибо!</p>	
			`
		};
		return sendmailPromise(mailOptions);
	}).then(function() {
		res.json({
			code: 200,
			message: 'Спасибо за интерес! Вы получите приглашение в течение нескольких дней!'
		});	
	}).catch(function(err) {
		logger.error(err.message, err.stack);
		if (err.message === 'VALIDATION_HAS_FAILED') {
			res.json({
				code: 200,
				message: 'Письмо не может быть отправленно: проверьте, пожалуйста, введенную информацию'
			});
		} else {
			res.json({
				code: 500,
				message: 'Письмо не может быть отправлено сейчас. Пожалуйста повторите попытку позднее.'
			});	
		}
	});
});

module.exports = router;