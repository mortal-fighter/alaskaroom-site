'use strict';

const router = require('express').Router();
const Promise = require('Bluebird');
const connectionPromise = require('../../components/connectionPromise.js');
const rp = require('request-promise');


function getUserInfo() {
	/*var options = {
		uri: 'https://oauth.vk.com/access_token',
		qs: {
			client_id: '5763848',
			code: '962d5238bb566af565',
			client_secret: '9W8DQ2D3r97l3hWNoAfY',
			redirect_uri: 'http://localhost/auth/login_vk_callback'
		},
		json: true
	};*/

	var options = {
		uri: 'https://api.vk.com/method/users.get',
		qs: {
			access_token: '2ca5f3b149a82cb91eb246b9d671ab99867af34790f17b05125c0abd2b62c61509650b076d4f5d48db257',
			user_ids: '16718732',
			fields: 'bdate,city,universities',
			client_secret: '9W8DQ2D3r97l3hWNoAfY',
			redirect_uri: 'http://localhost/auth/login_vk_callback'
		},
		json: true
	};

	rp(options).then(function (result) {
		console.log(result);
		/*
		{ access_token: '2ca5f3b149a82cb91eb246b9d671ab99867af34790f17b05125c0abd2b62c61509650b076d4f5d48db257',
		  expires_in: 86374,
		  user_id: 16718732 }
		*/
	}).catch(function(err) {
		console.error(err);
	});
}

getUserInfo();

router.get('/login_soc', function(req, res, next) {
	res.redirect('https://oauth.vk.com/authorize?client_id=5763848&display=page&redirect_uri=http://localhost/auth/login_vk_callback&response_type=code&v=5.69');
});

router.all('/login_vk_callack', function(req, res, next) {
	console.log(req.query);
	res.send(req.query);

	/*https://oauth.vk.com/access_token, передав следующие параметры: 

client_id
обязательный	Идентификатор Вашего приложения
client_secret
обязательный	Защищенный ключ Вашего приложения (указан в настройках приложения)
redirect_uri
обязательный	URL, который использовался при получении code на первом этапе авторизации. Должен быть аналогичен переданному при авторизации.
code
обязательный	Временный код, полученный после прохождения авторизации.*/
});

function newSession() {

};



module.exports = router;