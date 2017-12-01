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
	vkApp: {
		id: 5763848,
		name: 'localhost',
		clientSecret: '9W8DQ2D3r97l3hWNoAfY',
		redirectUrl: 'http://localhost/auth/login_vk_callback',
		version: 5.69
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