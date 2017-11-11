const config = require('../config/common.js');
const nodemailer = require('nodemailer');
const Promise = require('bluebird');

const transporter = nodemailer.createTransport(config.mailer.smtpConfig);

/* example options */
/* 
const mailOptions = {
	from: 'Сайт Академии',
	to: 'academy.optimus@yandex.ru',
	subject: `Вопрос от посетителя ${req.body.userName}`,
	text: `
		Вопрос от посетителя ${req.body.userName} (${req.body.userEmail}).
		Текст вопроса: 

		${req.body.userMessage}
	`,
	html: `
		<p>Вопрос от посетителя <b>${req.body.userName}</b> (<b>${req.body.userEmail}</b>).</p>
		<p>Текст вопроса:</p> 
		<p>${req.body.userMessage}</p>
	`
};
*/
function sendmailPromise(options) {
	return new Promise(function(resolve, reject) {
		transporter.sendMail(options, function(err) {
			if (err) {
				reject(err);
				return;
			}
			resolve();
		});	
	});
	
}

module.exports = sendmailPromise; 