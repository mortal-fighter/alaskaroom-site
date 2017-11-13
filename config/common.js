module.exports = {
	app: {
		mode: 'development',
		port: 80,
		emailAdmin: 'kirillmybox@rambler.ru',
		secret: 'холоднаяводабрррр!'
	},
	database: {
		host: '127.0.0.1',
		port: 3306,
		user: 'root',
		password: '',
		database: 'onemarkt_alaskaroom'
	},
	logger: {
		level: 'DEBUG'
	},
	mailer: { 
		smtpConfig: {
			service: "gmail",
			auth: {
				user: 'mortal.fighter.89@gmail.com',
				pass: 'CucumbeR_7386px'
			}
		}
	}
};