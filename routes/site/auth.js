'use strict';

const router = require('express').Router();

const Promise = require('bluebird');
const rp = require('request-promise');
const request = require('request');
const moment = require('moment');
const fs = require('fs');
const path = require('path');
const logger = require('log4js').getLogger();
const imageDownloader = require('image-downloader');

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
	var avatarPath = null;
	var avatarHref = null;
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
				fields: 'about,contacts,personal,bdate,sex,universities,photo_200'
			},
			json: true
		};
		logger.debug(options);
		return rp(options);
	
	}).then(function(result) {

		logger.debug(JSON.stringify(result));
		user = result.response[0];
		
		var sql = `SELECT id FROM \`user\` WHERE vk_id = ${user.uid};`;

		logger.debug(sql);
		return db.queryAsync(sql);
	
	}).then(function(result) {
	
		logger.debug('USER' + JSON.stringify(result));

		if (result.length) {
			userId = result[0].id;
		}

		if (userId) {
			
			// EXISTING USER
			auth.sessionStart(userId).then(function(token) {
				res.cookie('AlaskaRoomAuthToken', token);
				res.redirect(`/profile/view/${userId}`);	
			}).catch(function(err) {
				logger.error(err);
				res.render('errors/500.pug');
			});
			
		
		} else {
			
			// NEW USER
			
			// optional step:
			var promiseChain = Promise.resolve();

			// 1. get city name from vk (optional)
			if (user.universities.length) {	
				var options = {
					uri: 'https://api.vk.com/method/database.getCitiesById',
					qs: {
						access_token: access.access_token,
						city_ids: user.universities[0].city
					},
					json: true
				};
				logger.debug('qs='+JSON.stringify(options));
				
				promiseChain.then(rp(options).then(function(result) {
					logger.debug('rp result='+JSON.stringify(result));
					user.universities[0].cityName = result.response[0].name;
				}));	
			} 
			
			// 2. insert db (mandatory)
			promiseChain.then(function() {
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

				var university = '';
				if (user.universities.length) {
					university = `(SELECT id FROM university WHERE vk_id = '${user.universities[0].id}')`;
				} else {
					university = 'NULL';
				}

				var faculty = '';
				if (user.universities.length && user.universities[0].faculty_name !== '') {
					faculty = `(SELECT id FROM faculty WHERE vk_id = '${user.universities[0].faculty}')`;
				} else {
					faculty = 'NULL';
				}

				var department = '';
				if (user.universities.length && user.universities[0].faculty_name !== '') {
					department = `(SELECT id FROM department WHERE vk_id = '${user.universities[0].chair}')`;
				} else {
					department = 'NULL';
				}

				var city = '';
				if (user.universities.length && user.universities[0].city != '0') {
					city = user.universities[0].cityName;
				}

				var sql = `	INSERT INTO \`user\`(	first_name, 
													last_name, 
													sex, 
													age, 
													birth_date, 
													city, 
													about, 
													avatar,
													university_id, 
													faculty_id, 
													department_id,
													vk_id, 
													date_register)
							VALUES (	'${user.first_name}',
										'${user.last_name}',
										'${sex}',
										'${age}',
										STR_TO_DATE('${user.bdate}', '${dateFormat}'),
										'${city}',
										'${about}',
										'/images/photo.jpg',
										${university},
										${faculty},
										${department},
										${user.uid},
										NOW())`;
				logger.debug(sql);
				return db.queryAsync(sql);
			
			}).then(function(result) {
				
				// 2.1 download and save avatar from vk (optional)
				logger.debug(result);
				newUserId = result.insertId;
				//auth.sessionStart(newUserId);

				userHasPhoto = (user.photo_200 !== 'https://vk.com/images/camera_200.png') ? true : false;		
				
				var promiseChain = Promise.resolve();
				if (userHasPhoto) {
					
					// create user folder, download photo from vk, save it and update mysql
					promiseChain.then(function() {
						fs.mkdirSync(path.normalize(__dirname + '/../../public/images/uploads/user_'+newUserId), 0o755);
					}).then(function() {
						var ext = user.photo_200.substr(user.photo_200.lastIndexOf('.') + 1);
						var time = (new Date()).getTime();
						avatarPath = path.normalize(`${__dirname}/../../public/images/uploads/user_${newUserId}/avatar_${time}.${ext}`);
						avatarHref = `/images/uploads/user_${newUserId}/avatar_${time}.${ext}`;
						
						const options = {
							url: user.photo_200,
							dest: avatarPath                 
						}
						return imageDownloader.image(options);
					}).then(function(res) {
						isAvatarFileCreated = true;
						//update db
						var sql = `UPDATE \`user\` SET avatar = '${avatarHref}' WHERE id = ${newUserId};`;
						logger.debug(sql);
						return db.queryAsync(sql);
					});
				}
				return promiseChain;
			
			}).then(function(result) {
				/*todo: fix sessions duplicate
				
					[2017-12-20 11:54:25.487] [DEBUG] [default] -   INSERT INTO Session(token, user_id)
			                                                        VALUES ('6WSrrtUEwEGy8nn76L5hAD8VWqt5IiDQ', 25);
					[2017-12-20 11:54:25.490] [DEBUG] [default] -   INSERT INTO Session(token, user_id)
					                                                        VALUES ('cQGhDKdL72rjd40ZFy3mdQgGlGdZT4AZ', 25);
				*/
				auth.sessionStart(newUserId).then(function(token) {
					res.cookie('AlaskaRoomAuthToken', token);
					res.redirect(`/profile/edit/${newUserId}`);	
				}).catch(function(err) {
					logger.error(err);
					res.render('errors/500.pug');
				});
			
			}).catch(function(err) {
			
				logger.error(err.message, err.stack);
				
				if (isAvatarFileCreated) {
					logger.debug('REMOVE AVATAR FROM DISK...');
					fs.unlinkSync(avatarPath);
				}

				if (newUserId) {
					logger.debug('ROLLBACK User...');
					var sql = `DELETE FROM \`user\` WHERE id = ${newUserId};`;
					logger.debug(sql);
					db.queryAsync(sql);
					/*logger.debug(`END SESSION FOR USER ${newUserId}...`);
					auth.sessionEnd(newUserId);*/
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
		
		//todo: remove both on server and client
		/*logger.debug(`END SESSION FOR USER ${userId}...`);
		auth.sessionEnd(userId);*/

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