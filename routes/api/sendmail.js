'use strict';
const router = require('express').Router();
const sendmailPromise = require('../../components/sendmailPromise.js');
const Promise = require('bluebird');
const fetch = require('isomorphic-fetch');
const config = require('../../config/common.js');
const FormData = require('form-data');
const logger = require('log4js').getLogger();

router.post('/', function (req, res, next) {
	Promise.resolve().then(function() {
		if (req.body.userName.match(/$\s*^/) ||  
			!req.body.userEmail.match(/^([a-z0-9_-]+\.)*[a-z0-9_-]+@[a-z0-9_-]+(\.[a-z0-9_-]+)*\.[a-z]{2,6}$/) ||
			req.body.userMessage.match(/$\s*^/) ) {
			
			throw new Error('VALIDATION_HAS_FAILED');
		}

		var uri = 'https://www.google.com/recaptcha/api/siteverify';
		var form = new FormData();
		form.append('secret', config.recaptcha.secret);
		form.append('response', req.body.recaptchaResponse);
		form.append('remoteip', req.ip);
		var opts = {
			method: 'post',
			body: form
		};
		return fetch(uri, opts).then(function(response) {

			if (!response.ok) {
				throw new Error('GOOGLE_IS_UNAVAILABLE');
			} 

			return response.json();
		});
	}).then(function(result) {
		if (!result.success) {
			throw new Error('RECAPTCHA_WRONG_CODE');
		}

		const mailOptions = {
			from: 'Сайт Академии ОПТИМУС',
			to: config.app.emailAdmin,
			subject: `Вопрос от посетителя ${req.body.userName}`,
			text: `
				Пользователь ${req.body.userName} (${req.body.userEmail}) прислал письмо.
				Текст письма: 

				${req.body.userMessage}
			`,
			html: `
				<p>Пользователь <b>${req.body.userName}</b> (<a href="mailto:${req.body.userEmail}">${req.body.userEmail}</a>) прислал письмо.</p>
				<p>Текст письма:</p> 
				<p><b>${req.body.userMessage}</b></p>
			`
		};
		return sendmailPromise(mailOptions);
	}).then(function() {
		res.json({
			code: 200,
			message: 'Ваше письмо успешно отправлено! Мы скоро Вам ответим!'
		});	
	}).catch(function(err) {
		logger.error(err.message, err.stack);
		if (err.message === 'VALIDATION_HAS_FAILED') {
			res.json({
				code: 200,
				message: 'Письмо не может быть отправленно: проверьте, пожалуйста, введенную информацию'
			});
		} else if (err.message === 'RECAPTCHA_WRONG_CODE') {
			res.json({
				code: 200,
				message: 'Введен неправильный код reCaptcha'
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