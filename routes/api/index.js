'use strict';

const router = require('express').Router();
const sendmailPromise = require('../../components/sendmailPromise.js');
const Promise = require('bluebird');
const fetch = require('isomorphic-fetch');
const config = require('../../config/common.js');
const FormData = require('form-data');
const logger = require('log4js').getLogger();

router.use('/landing', function(req, res, next) {
	Promise.resolve().then(function() {
		if (req.body.userName.match(/$\s*^/) ||  
			!req.body.userEmail.match(/^([a-z0-9_-]+\.)*[a-z0-9_-]+@[a-z0-9_-]+(\.[a-z0-9_-]+)*\.[a-z]{2,6}$/) ) {
			
			throw new Error('VALIDATION_HAS_FAILED');
		}

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
			message: 'Ваше письмо успешно отправлено! Спасибо за регистрацию!'
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

router.get('/test', function(req, res, next) {
	res.send('1234');
});

router.use(function(req, res) {
	res.render('site/errors/404.pug');
});

module.exports = router;