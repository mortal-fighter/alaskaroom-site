'use strict';

const router = require('express').Router();
const config = require('../../config/common.js');
const Promise = require('Bluebird');
const connectionPromise = require('../../components/connectionPromise.js');
const rp = require('request-promise');
const request = require('request');
const moment = require('moment');
const fs = require('fs');
const path = require('path');

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
	res.redirect(`https://oauth.vk.com/authorize?client_id=${config.vkApp.id}&display=page&redirect_uri=${config.vkApp.redirectUrl}&response_type=code&v=${config.vkApp.version}`);
});

router.get('/login_vk_callback', function(req, res, next) {
	var db = null;
	var access = null;
	var user = null;
	var university = null;
	var newUserId = null; 
	var avatar = null;
	var isAvatarFileCreated = false;
	var userHasPhoto = false;

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
		var options = {
			uri: 'https://oauth.vk.com/access_token',
			qs: {
				client_id: config.vkApp.id,
				code: req.query.code,
				client_secret: config.vkApp.clientSecret,
				redirect_uri: config.vkApp.redirectUrl
			},
			json: true
		};

		return rp(options);
	}).then(function(result) {
		console.log(result);
		access = result;
		return connectionPromise();
	}).then(function(connection) {
		db = connection;
		var sql = `	INSERT INTO access_token(access_token, expires_in, vk_id, date_created)
					VALUES (
						'${access.access_token}',
						${access.expires_in},
						${access.user_id},
						NOW())`;
		console.log(sql);
		return db.queryAsync(sql);
	}).then(function(result) {
		console.log(result);
		var options = {
			uri: 'https://api.vk.com/method/users.get',
			qs: {
				access_token: access.access_token,
				user_ids: access.user_id,
				fields: 'bdate,sex,city,universities,photo_200,photo_max'
			},
			json: true
		};

		return rp(options);
	}).then(function(result) {
		console.log(result);
		user = result.response[0];
		
		var options = {
			uri: 'https://api.vk.com/method/database.getCitiesById',
			qs: {
				access_token: access.access_token,
				city_ids: user.universities[0].city
			},
			json: true
		};

		return rp(options);
	}).then(function(result) {
		user.universities[0].cityName = result.response[0].title;

		var sex;
		switch (user.sex) {
			case 1:
				sex = 'женский';
				break;
			case 2:
				sex = 'мужской';
				break;
			default:
				sex = 'не важно';
		}

		var hasBirthYear = false;
		var dateFormat = '%e.%c';

		if (user.bdate.match(/^\d+\.\d+\.\d+$/)) {
			hasBirthYear = true;
			dateFormat = '%e.%c.%Y';			
		}		

		var age = 0;
		if (hasBirthYear) {
			var now = moment();
			var bdate = moment(user.bdate, 'D.M.YYYY');
			age = now.diff(bdate, 'years');
		}

		var sql = `	INSERT INTO \`User\`(	first_name, last_name, sex, age, birth_date, city, 
											university, faculty, avatar,
											login, password, 
											vk_id)
					VALUES (	'${user.first_name}',
								'${user.last_name}',
								'${sex}',
								'${age}',
								STR_TO_DATE('${user.bdate}', '${dateFormat}'),
								'${user.universities[0].cityName}',
								'${user.universities[0].name}',
								'${user.universities[0].faculty_name}',
								'/images/photo.jpg',
								NULL,
								NULL,
								${user.uid})`;
		console.log(sql);
		return db.queryAsync(sql);
	}).then(function(result) {
		console.log(result);
		newUserId = result.insertId;
		avatar = path.normalize(__dirname + '/../../public/images/avatar-user-'+newUserId+'.jpg');
		userHasPhoto = (user.photo_200 !== 'https://vk.com/images/camera_200.png') ? true : false;		
		
		/*if (userHasPhoto) {
			// download photo
			const options = {
				url: user.photo_200,
				encoding: 'binary'
			};	
			return request.get(options);
		} else {
			return Promise.resolve();
		}*/
		return Promise.resolve();
	}).then(function(res) {
		
		/*if (userHasPhoto) {
			// save photo to disk
			isAvatarFileCreated = true;

			const buffer = Buffer.from(res, 'utf8');
			fs.writeFileSync(avatar, buffer);
			
			//update db
			var sql = `UPDATE \`User\` SET avatar = '/images/avatar-user-`+newUserId+`.jpg' WHERE id = ${newUserId};`;
			console.log(sql);
			return db.queryAsync(sql);
		} else {
			return Promise.resolve();
		}*/
		return Promise.resolve();
	}).then(function(result) {
		/*if (userHasPhoto) {
			console.log(result);
		}*/	
		res.redirect('/profile/'+newUserId);
	}).catch(function(err) {
		console.error(err.message, err.stack);
		
		if (isAvatarFileCreated) {
			console.log('REMOVE AVATAR FROM DISK...');
			fs.unlinkSync(avatar);
		}

		if (newUserId) {
			console.log('ROLLBACK User...');
			var sql = `DELETE FROM \`User\` WHERE id = ${newUserId};`;
			console.log(sql);
			db.queryAsync(sql);
		}

		if (access) {
			console.log('ROLLBACK access_token...');
			var sql = `DELETE FROM access_token WHERE access_token = '${access.access_token}';`;
			console.log(sql);
			db.queryAsync(sql);
		}

		res.render('errors/500.pug');
	});
});

function newSession() {

};

module.exports = router;