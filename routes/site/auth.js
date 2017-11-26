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

//getUserInfo();

router.get('/login_soc', function(req, res, next) {
	res.redirect('https://oauth.vk.com/authorize?client_id=5763848&display=page&redirect_uri=http://localhost/auth/login_vk_callback&response_type=code&v=5.69');
});

router.get('/login_vk_callback', function(req, res, next) {
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
	Promise.resolve().then(function() {
		console.log(req.query.code);
	});
});

function newSession() {

};

module.exports = router;