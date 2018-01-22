const config = require('../config/common.js');
const nodemailer = require('nodemailer');
const Promise = require('bluebird');

const transporter = nodemailer.createTransport(config.mailer.smtpConfig);

/* example options */
/* 
const mailOptions = {
	from: config.mailer.smtpConfig.auth.user,
	to: 'kirillmybox@rambler.ru',
	subject: `Заголовок письма`,
	text: `
		Да прибудет с Вами Сила!
	`,
	html: `
		<p>Да прибудет с Вами Сила!</p>
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