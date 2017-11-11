module.exports = {
	app: {
		mode: 'production',
		port: 2017,
		emailAdmin: 'kirillmybox@rambler.ru'
	},
	database: {
		host: '78.140.140.200',
		port: 3306,
		user: 'onemarkt',
		password: 'zW91uL1nl9',
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