const HOST = 'localhost';
const PORT = 80;

module.exports = {
	app: {
		mode: 'development',
		port: PORT,
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
		redirectUrl: 'http://' + HOST + ':' + PORT + '/auth/login_vk_callback',
		version: 5.71
	},
	mailer: { 
		smtpConfig: {
			service: 'Yandex',
			auth: {
				user: 'info@alaskaroom.ru',
				pass: '19882010'
			}
			/*host: 'smtp.yandex.ru',
			port: 465,
			secure: true, // true for 465, false for other ports 587
			auth: {
				user: 'info@alaskaroom.ru',
				pass: '19882010'
			}*/
		}
	}
};