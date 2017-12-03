'use strict';

const router = require('express').Router();

const Promise = require('Bluebird');
const rp = require('request-promise');
const request = require('request');
const moment = require('moment');
const fs = require('fs');
const path = require('path');
const logger = require('log4js').getLogger();

const config = require('../../config/common.js');
const connectionPromise = require('../../components/connectionPromise.js');
const auth = require('../../components/auth.js');

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
	var userId = null;

	Promise.resolve().then(function() {
		
		logger.debug(req.query.code);
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
		
		logger.debug(result);
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
		logger.debug(sql);
		return db.queryAsync(sql);
	
	}).then(function(result) {
	
		logger.debug(result);
		var options = {
			uri: 'https://api.vk.com/method/users.get',
			qs: {
				access_token: access.access_token,
				user_ids: access.user_id,
				fields: 'about,contacts,personal,bdate,sex,universities,photo_200,photo_max'
			},
			json: true
		};
		logger.debug(options);
		return rp(options);
	
	}).then(function(result) {

		logger.debug(result);
		user = result.response[0];
		
		var sql = `SELECT id FROM \`User\` WHERE vk_id = ${user.uid};`;

		logger.debug(sql);
		return db.queryAsync(sql);
	
	}).then(function(result) {
	
		logger.debug(result);

		if (result.length) {
			userId = result[0].id;
		}

		if (userId) {
			
			// existing user 
			auth.sessionStart(userId).then(function(token) {
				res.cookie('AlaskaRoomAuthToken', token);
				res.redirect('/profile/' + userId);	
			}).catch(function(err) {
				logger.error(err);
				res.render('errors/500.pug');
			});
			
		
		} else {
			
			//new user
			var options = {
				uri: 'https://api.vk.com/method/database.getCitiesById',
				qs: {
					access_token: access.access_token,
					city_ids: user.universities[0].city
				},
				json: true
			};
			logger.debug(options);
			
			rp(options).then(function(result) {
				logger.debug(result);
				user.universities[0].cityName = result.response[0].name;

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

				var about = (user.about) ? user.about : '';

				var sql = `	INSERT INTO \`User\`(	first_name, last_name, sex, age, birth_date, city, about,
													university, faculty, avatar,
													login, password, 
													vk_id, register_from_vk, date_register)
							VALUES (	'${user.first_name}',
										'${user.last_name}',
										'${sex}',
										'${age}',
										STR_TO_DATE('${user.bdate}', '${dateFormat}'),
										'${user.universities[0].cityName}',
										'${about}',
										'${user.universities[0].name}',
										'${user.universities[0].faculty_name}',
										'/images/photo.jpg',
										NULL,
										NULL,
										${user.uid},
										1,
										NOW())`;
				logger.debug(sql);
				return db.queryAsync(sql);
			
			}).then(function(result) {
			
				logger.debug(result);
				newUserId = result.insertId;
				auth.sessionStart(newUserId);

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
					logger.debug(sql);
					return db.queryAsync(sql);
				} else {
					return Promise.resolve();
				}*/
				return Promise.resolve();
			
			}).then(function(result) {
			
				/*if (userHasPhoto) {
					logger.debug(result);
				}*/	
				auth.sessionStart(newUserId).then(function(token) {
					res.cookie('AlaskaRoomAuthToken', token);
					res.redirect('/profile/' + newUserId);	
				}).catch(function(err) {
					logger.error(err);
					res.render('errors/500.pug');
				});
			
			}).catch(function(err) {
			
				logger.error(err.message, err.stack);
				
				if (isAvatarFileCreated) {
					logger.debug('REMOVE AVATAR FROM DISK...');
					fs.unlinkSync(avatar);
				}

				logger.debug(`END SESSION FOR USER ${newUserId}...`);
				auth.sessionEnd(newUserId);

				if (newUserId) {
					logger.debug('ROLLBACK User...');
					var sql = `DELETE FROM \`User\` WHERE id = ${newUserId};`;
					logger.debug(sql);
					db.queryAsync(sql);
				}

				if (access) {
					logger.debug('ROLLBACK access_token...');
					var sql = `DELETE FROM access_token WHERE access_token = '${access.access_token}';`;
					logger.debug(sql);
					db.queryAsync(sql);
				}

				res.render('errors/500.pug');
			});

		}

	}).catch(function(err) {
	
		logger.error(err.message, err.stack);
		
		logger.debug(`END SESSION FOR USER ${userId}...`);
		auth.sessionEnd(userId);

		if (access) {
			logger.debug('ROLLBACK access_token...');
			var sql = `DELETE FROM access_token WHERE access_token = '${access.access_token}';`;
			logger.debug(sql);
			db.queryAsync(sql);
		}

		res.render('errors/500.pug');
	
	});
});

module.exports = router;