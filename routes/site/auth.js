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

var codes = {
	0: {
		desc: 'По умолчанию (Профиль)',
		url1: '/profile/view/me',
		url2: '/profile/edit/me'
	},
	1: {
		desc: 'Поиск жилья',
		url1: '/filter',
		url2: '/profile/edit/me'
	},
	2: {
		desc: 'Поиск румейта',
		url1: '/filter/find-roommate',
		url2: '/profile/edit/me/show_flat_area'
	},
	3: {
		desc: 'Кампус500',
		url1: '/campus500',
		url2: '/campus500'
	},
	4: {
		desc: 'Отписаться от рассылки',
		url1: '/profile/unsubscribe',
		url2: '/profile/unsubscribe'
	}
};

router.get('/login_soc/:destinationCode(\\d+)?', function(req, res, next) {
	Promise.resolve().then(function() {
		
		if (!req.params.destinationCode) req.params.destinationCode = 0;	

		var valid = ( codes[parseInt(req.params.destinationCode)] ) ? true : false;
		
		if (!valid) {
			throw new Error(`WARN: Parameters validation error: destinationCode = '${req.params.destinationCode}' is not valid`);
		}

		res.cookie('AlaskaRoomDestinationCode', req.params.destinationCode);
		res.redirect(`https://oauth.vk.com/authorize?client_id=${config.vkApp.id}&display=page&redirect_uri=${config.vkApp.redirectUrl}&response_type=code&v=${config.vkApp.version}`);

	}).catch(function(err) {

		if (err.message.match(/^WARN:/)) {
			logger.info(err.message, err.stack);
			res.render('errors/404.pug');
		} else {
			logger.error(err.message, err.stack);
			res.render('errors/500.pug');
		}
	});
	
});

router.get('/logout/:userId(\\d+)', function(req, res, next) {
	auth.sessionEnd(req.params.userId).then(function() {
		res.cookie('AlaskaRoomAuthToken', '');
		res.redirect(`/`);	
	}).catch(function(err) {
		logger.error(err);
		res.render('errors/500.pug');
	});
})

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

	auth.sessionEndAnyway(req).then(function() {

		if (!req.cookies['AlaskaRoomDestinationCode']) {
			res.cookie('AlaskaRoomDestinationCode', 0);
		}

		var redirectUrl = config.vkApp.redirectUrl;

		var options = {
			uri: 'https://oauth.vk.com/access_token',
			qs: {
				client_id: config.vkApp.id,
				code: req.query.code,
				client_secret: config.vkApp.clientSecret,
				redirect_uri: redirectUrl
			},
			json: true
		};

		return rp(options).catch(function(err) {

			res.render('errors/operation_expired.pug', {
				isAuthorized: req.isAuthorized,
				userId: req.user_id
			});

			throw new Error('EXIT');

		});

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
				fields: 'about,contacts,personal,bdate,sex,universities,photo_200',
				v: 5.71
			},
			json: true
		};
		logger.info('rp opts=', JSON.stringify(options));
		return rp(options);
	
	}).then(function(result) {

		logger.info(JSON.stringify(result));
		user = result.response[0];
		
		var sql = `SELECT id FROM \`user\` WHERE vk_id = ${user.id};`;

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
				var authCode = parseInt(req.cookies['AlaskaRoomDestinationCode']);
				res.cookie('AlaskaRoomDestinationCode', '');
				res.redirect(codes[authCode].url1);
			}).catch(function(err) {
				logger.error(err);
				res.render('errors/500.pug');
			});
			
		
		} else {
			
			// NEW USER
			
			// optional step:
			var promiseChain = Promise.resolve();

			// 1. get city name from vk (optional)
			if (user.universities.length && user.universities[0].city !== 0) {	
				var options = {
					uri: 'https://api.vk.com/method/database.getCitiesById',
					qs: {
						access_token: access.access_token,
						city_ids: user.universities[0].city,
						v: 5.71
					},
					json: true
				};
				logger.info('city qs=' + JSON.stringify(options));
				
				promiseChain = promiseChain.then(function() {
					return rp(options);
				}).then(function(result) {
					logger.info('city result=' + JSON.stringify(result));
					user.universities[0].cityName = result.response[0].title;
				});	
			} else {
				logger.info(`Can't define user city (no university or 'city' field = 0)`);
			}
			
			// 2. insert db (mandatory)
			promiseChain = promiseChain.then(function() {
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



				var about = (user.about) ? user.about : '';

				var university = '';
				if (user.universities.length) {
					university = `(SELECT id FROM university WHERE vk_id = '${user.universities[0].id}')`;
				} else {
					university = 'NULL';
				}

				var faculty = '';
				if (user.universities.length && user.universities[0].faculty) {
					faculty = `(SELECT id FROM faculty WHERE vk_id = '${user.universities[0].faculty}')`;
				} else {
					faculty = 'NULL';
				}

				var department = '';
				if (user.universities.length && user.universities[0].chair) {
					department = `(SELECT id FROM department WHERE vk_id = '${user.universities[0].chair}')`;
				} else {
					department = 'NULL';
				}

				var city = '';
				if (user.universities.length && user.universities[0].city != '0') {
					city = user.universities[0].cityName;
				}

				var hasBirthDate = (user.bdate) ? true : false;
				var hasBirthYear = false;
				var dateFormat = '%e.%c';
				var age = null;
				var birthDate = null;

				if (hasBirthDate) {
					if (user.bdate.match(/^\d+\.\d+\.\d+$/)) {
						hasBirthYear = true;
						dateFormat = '%e.%c.%Y';
					}
					birthDate = `STR_TO_DATE('${user.bdate}', '${dateFormat}')`;
				} else {
					age = 'NULL';
					birthDate =	'NULL';					
				}
				
				if (hasBirthYear) {
					var now = moment();
					var bdate = moment(user.bdate, 'D.M.YYYY');
					age = "'" + now.diff(bdate, 'years') + "'";
				}
				
				var sql = `	INSERT INTO \`user\`(	first_name, 
													last_name, 
													sex, 
													age, 
													birth_date, 
													city, 
													about, 
													avatar,
													wish_pay,
													university_id, 
													faculty_id, 
													department_id,
													vk_id, 
													date_register)
							VALUES (	'${user.first_name.replace(/\'/g, '\\\'')}',
										'${user.last_name.replace(/\'/g, '\\\'')}',
										'${sex}',
										${age},
										${birthDate},
										'${city.replace(/\'/g, '\\\'')}',
										'${about.replace(/\'/g, '\\\'')}',
										'/images/photo.jpg',
										3000,
										${university},
										${faculty},
										${department},
										${user.id},
										NOW())`;
				logger.info('sql=', sql.replace('\n', ' '));
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
					promiseChain = promiseChain.then(function() {
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
						logger.info('sql=', sql);
						return db.queryAsync(sql);
					}).catch(function(err) {
						logger.error(err.message+' '+err.stack);
					});
				}
				return promiseChain;
			
			}).then(function(result) {
				auth.sessionStart(newUserId).then(function(token) {
					res.cookie('AlaskaRoomAuthToken', token);
					var authCode = parseInt(req.cookies['AlaskaRoomDestinationCode']);
					res.cookie('AlaskaRoomDestinationCode', '');
					res.redirect(codes[authCode].url2);
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
	
		if (err.message.match(/^EXIT$/)) {
			return;
		}

		//todo: remove both on server and client
		/*logger.debug(`END SESSION FOR USER ${userId}...`);
		auth.sessionEnd(userId);*/

		logger.error(err.message, err.stack);

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