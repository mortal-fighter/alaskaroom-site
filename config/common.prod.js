module.exports = {
	app: {
		mode: 'development',
		port: 7777,
		emailAdmin: 'kirillmybox@rambler.ru',
		secret: 'холоднаяводабрррр!'
	},
	database: {
		host: '127.0.0.1',
		port: 3306,
		user: 'user101',
		password: 'adobe_vegas_8',
		database: 'onemarkt_alaskaroom'
	},
	logger: {
		level: 'DEBUG'
	},
	vkApp: {
		id: 5763848,
		name: 'Alaska Room',
		clientSecret: '9W8DQ2D3r97l3hWNoAfY',
		redirectUrl: 'http://alaskaroom.ru/auth/login_vk_callback',
		version: 5.71
	},
	mailer: { 
		host: 'smtp.yandex.ru',
		port: 465,
		secure: true, // true for 465, false for other ports 587
		auth: {
			user: 'info@alaskaroom.ru',
			pass: '19882010'
		}
	}
};