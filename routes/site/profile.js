'use strict';

const router = require('express').Router();
const Promise = require('bluebird');
const moment = require('moment');
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');
const sizeOfAsync = Promise.promisify(require('image-size'));

const connectionPromise = require('../../components/connectionPromise.js');
const logger = require('../../components/myLogger.js');
const util = require('../../components/myUtil.js');

const multer = require('multer');
//todo: fix bug with duplicating && corrupting images 

const storage = multer.diskStorage({
	
	destination: function (req, file, cb) {
		
		fs.statAsync(path.normalize(__dirname + '/../../public/images/uploads/user_'+req.user_id)).then(function() {
			
			cb(null, 'public/images/uploads/user_'+req.user_id);	
		
		}).catch(function(err) {
			
			fs.statAsync(path.normalize(__dirname + '/../../public/images/uploads'))
			
			.catch(function(err) {
				
				return fs.mkdirAsync(path.normalize(__dirname + '/../../public/images/uploads'), 0o755);

			})
			
			.then(function() {
				
				fs.mkdirAsync(path.normalize(__dirname + '/../../public/images/uploads/user_'+req.user_id), 0o755) 
			
			})
			
			.then(function() {
			
				cb(null, 'public/images/uploads/user_'+req.user_id);
			
			}).catch(function(err) {
			
				logger.error(req, err.stack, err.message);
			
			});
		});	
	},
	
	filename: function (req, file, cb) {
		const i = file.originalname.lastIndexOf('.');
		const ext = file.originalname.substr(i);
		cb(null, Date.now() + ext);
	}
});

const uploader = multer({ 
	storage: storage,
	fileFilter: function (req, file, cb) {
		if (file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png' && file.mimetype !== 'image/gif') {
			cb(null, false);
			return;	
		}
		cb(null, true);
	}
});

function formatObjectForSQL(object) {
	// The following processes data, received from the form into sql query values
	for (var key in object) {
		if (object.hasOwnProperty(key)) {
			//convert 'true'/'false' into 1/0 (checkbox values in mind...)
			switch (object[key]) {
				case 'true':
					object[key] = 1;
					break;
				case 'false':
					object[key] = 0;
					break;
			}

			//convert blank strings into 'NULL's
			if (object[key].length === 0) {
				object[key] = 'NULL';	
			} 

			//1. surround all, except 'NULL', with single quotes, preparing it for sql query
			//2. escape single quote inside text
			if (object[key] !== 'NULL') {
				object[key] = '\'' + object[key].replace(/\'/g, '\\\'') + '\'';
			}
		
		}
	}
}

function formatObjectForSQLCopy(object) {
	// The following processes data, received from the form into sql query values
	var copy = Object.assign({}, object); 
	for (var key in copy) {
		//convert 'true'/'false' into 1/0 (checkbox values in mind...)
		switch (copy[key]) {
			case 'true':
				copy[key] = 1;
				break;
			case 'false':
				copy[key] = 0;
				break;
		}

		//convert blank strings into 'NULL's
		if (copy[key].length === 0) {
			copy[key] = 'NULL';	
		} 

		//1. surround all, except 'NULL', with single quotes, preparing it for sql query
		//2. escape single quote inside text
		if (copy[key] !== 'NULL') {
			copy[key] = '\'' + copy[key].replace(/\'/g, '\\\'') + '\'';
		}
	}

	return copy;
}

function validateFlat(flat) {
	if (flat.id && !flat.id.match(/^\d+$/)) {
		throw new Error(`Parameters validation error (flat.id): '${flat.id}'.`);
	}
	if (flat.description && flat.description.length > 3000) {
		throw new Error(`Parameters validation error: flat.description.length = ${flat.description.length}.`);
	}
	if (!flat.address) {
		throw new Error(`Parameters validation error (flat.address): '${flat.address}'.`);
	} else if (flat.address.length > 200) {
		throw new Error(`Parameters validation error: flat.address.length = ${flat.address.length}.`);
	}
	if (!flat.room_num.match(/^\d+$/)) {
		throw new Error(`Parameters validation error (flat.room_num): '${flat.room_num}'.`);
	}
	if (!flat.rent_pay.match(/^\d+$/)) {
		throw new Error(`Parameters validation error (flat.rent_pay): '${flat.rent_pay}'.`);
	}
	if (!flat.total_pay.match(/^\d+$/)) {
		throw new Error(`Parameters validation error (flat.total_pay): '${flat.total_pay}'.`);
	}
	if (!flat.square) {
		throw new Error(`Parameters validation error (flat.square): '${flat.square}'.`);	
	}
	// todo: validate square is float
	if (flat.traffic && flat.traffic.length > 300) {
		throw new Error(`Parameters validation error: flat.traffic.length = ${flat.traffic.length}.`);
	}
	if (!flat.enter_date.match(/^\d{2}.\d{2}.\d{4}$/)) {
		throw new Error(`Parameters validation error (flat.enter_date): '${flat.enter_date}'.`);
	}
}

function validateUser(user) {
	if (user.id && !user.id.match(/^\d+$/)) {
		throw new Error(`Parameters validation error (user.id): '${user.id}'.`);
	}
	if (!user.first_name) {
		throw new Error(`Parameters validation error (user.first_name): '${user.first_name}'.`);
	} else if (user.first_name.length > 100) {
		throw new Error(`Parameters validation error: user.first_name.length = ${user.first_name.length}.`);
	}
	if (!user.last_name) {
		throw new Error(`Parameters validation error (user.last_name): '${user.last_name}'.`);
	} else if (user.last_name.length > 100) {
		throw new Error(`Parameters validation error: user.last_name.length = ${user.last_name.length}.`);
	}
	if (user.email && user.email.length > 100) {
		throw new Error(`Parameters validation error: user.email.length = ${user.email.length}.`);
	}
	if (user.email && !user.email.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
		throw new Error(`Parameters validation error: user.email '${user.email.length}' is wrong`);
	}
	if (!user.sex.match(/^(мужской|женский|не важно)$/)) {
		throw new Error(`Parameters validation error (user.sex): '${user.sex}'.`);
	}
	/*if (!user.age.match(/^\d+$/)) {
		throw new Error(`Parameters validation error (user.age): '${user.age}'.`);
	}*/
	if (!user.birth_date.match(/^\d{2}.\d{2}.\d{4}$/)) {
		throw new Error(`Parameters validation error (user.birth_date): '${user.birth_date}'.`);
	}
	if (!user.city) {
		throw new Error(`Parameters validation error (user.city): '${user.city}'.`);
	} else if (user.city.length > 100) {
		throw new Error(`Parameters validation error: user.city.length = ${user.city.length}.`);
	}
	if (user.phone && !user.phone.match(/^((8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{7,10}$/)) {
		throw new Error(`Parameters validation error (user.phone): '${user.phone}'.`);
	}
	if (!user.wish_pay.match(/^\d+$/)) {
		throw new Error(`Parameters validation error (user.wish_pay): '${user.wish_pay}'.`);
	}

	// todo: сделать проверку что у пользователя есть квартира, если user.search_status === '2'
}

router.get('/view/:userId((\\d+|me))', function(req, res, next) {
	
	var db = null;
	
	if (!req.isAuthorized) {
		res.redirect(`/?message=Пожалуйста,%20авторизуйтесь%20в%20системе`);
		return;
	}

	if (req.params.userId === 'me') {
		req.params.userId = req.user_id;
	}

	var data = null;
	var sql = null;
	var priorities = [];
	var photos = [];
	var utilities = [];
	var status_sended = null;
	var status_incoming = null;
	var isCameFromCampus500 = false;
	var similarity = null;
	var messages = [];

	connectionPromise().then(function(connection) {
		
		db = connection;
		
		sql = `	SELECT 
						user_id,
						user_first_name,
						user_last_name,
						user_sex,
						user_city,
						user_name,
						user_age,
						user_about,
						user_avatar,
						user_phone,
						user_wish_pay,
						user_is_activated,
						user_search_status,
						university_id,
						university_name,
						department_name,	
						studyyear_name,
						faculty_id,
						faculty_name,	
						flat_id,
						flat_description,
						flat_square,
						flat_traffic,
						flat_address,
						flat_room_num,
						flat_rent_pay,
						flat_total_pay,
						SUBSTR(flat_enter_date, 1, 5) flat_enter_date
					FROM v_user_all
					WHERE user_id = ${req.params.userId};`;
		logger.debug(req, sql);
		return db.queryAsync(sql);
	
	}).then(function(result) {

		logger.debug(req, result);
		data = result[0];

		sql = `	SELECT priority_name_full, option_name
					FROM v_user_priority
					WHERE user_id = ${req.params.userId};`;
		logger.debug(req, sql);
		return db.queryAsync(sql);
	
	}).then(function(result) {
			
		//logger.debug(req, result);
		priorities = result;
		
		if (data.flat_id) {
			return Promise.resolve().then(function() {	
				sql = `	SELECT 
								src_small, src_orig,
								width_small, height_small, width_orig, height_orig
							FROM photo
							WHERE flat_id = ${data.flat_id};`;
				return db.queryAsync(sql);
			}).then(function(result) {
				photos = result;
				
				sql = ` SELECT 
							utility.id,
							utility.display_name
						FROM utility
						JOIN flat_utility ON utility.id = flat_utility.utility_id
						WHERE flat_utility.flat_id = ${data.flat_id}
						ORDER BY utility.display_order;`;
				logger.debug(req, sql);
				return db.queryAsync(sql);
			}).then(function(result) {
				utilities = result;
			});
		} else {
			return Promise.resolve();
		}
	
	}).then(function() {
		if (req.params.userId != req.user_id) {
			var sql = `	SELECT (SELECT status
							FROM roommate_request 
							WHERE from_user_id = ${req.user_id}
						  	  AND to_user_id = ${req.params.userId}) status_sended,
							(SELECT status
							FROM roommate_request 
							WHERE from_user_id = ${req.params.userId}
						  	  AND to_user_id = ${req.user_id}) status_incoming;`
			logger.debug(req, sql);
			return db.queryAsync(sql);
		} else {
			return Promise.resolve();
		}

	}).then(function(result) {
		
		if (result) {
			logger.debug(req, result);
			status_sended = result[0].status_sended;
			status_incoming = result[0].status_incoming;
		}

		if (req.user_id == data.user_id && data.user_is_activated == 0) {
			messages.push({
				type: 'info',
				text: 'Заполните и сохраните <a href="/profile/edit/me" title="Профиль">анкету</a>, чтобы другие пользователи могли найти Вас в Поиске'
			});
		}

		isCameFromCampus500 = false;
		if ( req.header('Referer') && req.header('Referer').match(/campus500/) ) {
			isCameFromCampus500 = true;
		}

		if (req.params.userId != req.user_id) {
			var minId = Math.min(req.params.userId, req.user_id);
			var maxId = Math.max(req.params.userId, req.user_id);
			var sql = ` SELECT percent FROM similarity 
						WHERE user_id1 = ${minId}
						  AND user_id2 = ${maxId};`;
			logger.debug(req, sql);
			return db.queryAsync(sql);
		} else {
			return Promise.resolve();
		}

	}).then(function(result) {

		if (result && result.length) {
			similarity = Math.trunc(result[0].percent * 100);
		}

		res.render('site/profile_view.pug', {
			data: data,
			photos: photos,
			utilities: utilities,
			priorities: priorities,
			status_sended: status_sended,
			status_incoming: status_incoming,
			user_phone: ( isCameFromCampus500 ) ? data.user_phone : null,
			similarity: similarity,
			isAuthorized: req.isAuthorized,
			userId: req.user_id,
			messages: messages
		});
	
	}).catch(function(err) {
		
		logger.error(req, err.message, err.stack);
		res.render('errors/500.pug');
	
	});
});

router.get('/edit/:userId((\\d+|me))/:postaction(\\S+)?', function(req, res, next) {
	var db = null;
	
	if (req.params.userId === 'me') {
		req.params.userId = req.user_id;
	}
	if (!req.isAuthorized) {
		res.redirect(`/?message='Пожалуйста, авторизуйтесь в системе`);
		return;
	} else if (req.user_id != req.params.userId) {
		res.render('errors/403.pug');
		return;
	}

	if (req.params.postaction && req.params.postaction !== 'show_flat_area') {
		throw new Error(`Parameters validation error: req.params.postaction = '${req.params.postaction}' is invalid`);
	}

	var data = null;
	var universities = [];
	var faculties = [];
	var departments = [];
	var studyYears = [];
	var photos = [];
	var priorities = [];
	var userPriorities = [];
	var prioritySelect = [];
	
	var userDistricts = [];
	var campus500Object = [];
	var flatDistricts = [];
	var utilityObject = [];

	var hasFlat = false;
	var messages = [];
	
	connectionPromise().then(function(connection) {
		
		db = connection;
		
		var sql = `	SELECT 
						user_id,
						user_avatar,
						user_sex,
						user_birth_date,
						user_age,
						user_phone,
						user_email,
						user_city,
						user_is_activated,
						university_id,
						university_name,
						faculty_id,
						faculty_name,
						department_id,
						department_name,
						studyyear_id,
						studyyear_name,
						user_about,
						user_first_name,
						user_last_name,
						CONCAT(user_first_name, " ", user_last_name) user_name,
						user_wish_pay,
						user_search_status,
						flat_id,
						flat_description,
						flat_square,
						flat_traffic,
						flat_address,
						flat_room_num,
						flat_rent_pay,
						flat_total_pay,
						flat_enter_date
					FROM v_user_all
					WHERE user_id = ${req.user_id};`;
		logger.debug(req, sql);
		return db.queryAsync(sql);
	
	}).then(function(result) {

		//logger.debug(req, result);
		data = result[0];
		if (data.flat_id) {
			hasFlat = true;
		}

		var sql = ` 
			SELECT '' id, 'Не выбран' name_short 
			UNION
			SELECT id, name_short FROM university;`;
		logger.debug(req, sql);
		return db.queryAsync(sql);

	}).then(function(result) {

		//logger.debug(req, result);
		universities = result;

		var sql = ` 
			SELECT '' id, 'Не выбран' name_full 
			UNION
			SELECT id, name_full FROM faculty WHERE university_id = ${data.university_id};`;
		logger.debug(req, sql);
		return db.queryAsync(sql);

	}).then(function(result) {

		//logger.debug(req, result);
		faculties = result;

		var sql = ` 
			SELECT '' id, 'Не выбрана' name_full 
			UNION
			SELECT id, name_full FROM department WHERE faculty_id = ${data.faculty_id};`;
		logger.debug(req, sql);
		return db.queryAsync(sql);

	}).then(function(result) {

		//logger.debug(req, result);
		departments = result;

		var sql = ` 
			SELECT '' id, 'Не выбран' name_full 
			UNION
			SELECT id, name_full FROM studyyear;`;
		logger.debug(req, sql);
		return db.queryAsync(sql);

	}).then(function(result) {

		//logger.debug(req, result);
		studyYears = result;

		var sql = `	SELECT * FROM v_priority`;
		logger.debug(req, sql);
		return db.queryAsync(sql);

	}).then(function(result) {

		//logger.debug(req, result);
		priorities = result;

		var sql = `	SELECT * FROM v_user_priority WHERE user_id = ${req.params.userId};`;
		logger.debug(req, sql);
		return db.queryAsync(sql);

	}).then(function(result) {

		//logger.debug(req, result);
		userPriorities = result;

		// construct priority <select>s (begin)

		var curPriorityId = -1;
		var priorSelIndex = -1;
		var isSelected = false;

		for (var i = 0; i < priorities.length; i++) {
			var priority = priorities[i];
			isSelected = false;
			
			if (priority.priority_id !== curPriorityId) {
				prioritySelect.push({
					priority_id: priority.priority_id,
					priority_name_full: priority.priority_name_full,
					options: []
				});
				priorSelIndex++;	
				curPriorityId = priority.priority_id;
			}

			if (!isSelected && userPriorities.length) {
				for (var j = 0; j < userPriorities.length; j++) {
					if (userPriorities[j].option_id === priority.option_id) {
						isSelected = true;
						break;
					}
				}
			}

			prioritySelect[priorSelIndex].options.push({
				id: priority.option_id,
				name: priority.option_name,
				isSelected: isSelected
			});
		}	
		
		// construct priority <select>s (end)


		return util.generateCheckbox({
			dictionaryTableName: 'district',
			table2Name: 'user',
			orderByColumn: 'name',
			table2_id: req.user_id
		});
		
	}).then(function(result) {

		userDistricts = result;

		return util.generateCheckbox({
			dictionaryTableName: 'campus500',
			table2Name: 'user',
			orderByColumn: 'display_order',
			table2_id: req.user_id
		});

	}).then(function(result) {

		campus500Object = result;	

		var promiseChain = util.generateCheckbox({
			dictionaryTableName: 'utility',
			table2Name: 'flat',
			orderByColumn: 'display_order',
			table2_id: (hasFlat) ? data.flat_id : undefined
		}).then(function(result) {

			utilityObject = result;

			return util.generateCheckbox({
				dictionaryTableName: 'district',
				table2Name: 'flat',
				orderByColumn: 'name',
				table2_id: (hasFlat) ? data.flat_id : undefined
			});

		}).then(function(result) {

			flatDistricts = result;

		});

		if (hasFlat) {
			
			promiseChain = promiseChain.then(function() {	
				
				var sql = `	SELECT 
								id, src_small, src_orig,
								width_small, height_small, width_orig, height_orig
							FROM photo
							WHERE flat_id = ${data.flat_id};`;
				return db.queryAsync(sql);

			}).then(function(result) {
				
				photos = result;

			});
		}

		return promiseChain;

	}).then(function() {

		res.render('site/profile_edit.pug', {
			user_id: req.params.userId,
			data: data,
			universities: universities,
			faculties: faculties,
			departments: departments,
			studyYears: studyYears,
			photos: photos,
			priorities: prioritySelect,
			userDistricts: userDistricts,
			campus500: campus500Object,
			utilities: utilityObject,
			flatDistricts: flatDistricts,
			showFlatAnyway: (req.params.postaction && req.params.postaction === 'show_flat_area') ? true : false,
			isAuthorized: req.isAuthorized,
			userId: req.user_id,
			messages: messages
		});
	
	}).catch(function(err) {
		
		if (err.message.match(/^Parameters validation error/)) {
			logger.debug(req, err.message, err.stack);
			res.render('errors/404.pug');
		}

		logger.error(req, err.message, err.stack);
		res.render('errors/500.pug');
	
	});
});

router.get('/unsubscribe', function(req, res, next) {
	Promise.resolve().then(function() {
		res.render('site/profile_unsubscribe.pug', {
			isAuthorized: req.isAuthorized,
			userId: req.user_id
		});
	}).catch(function(err) {
		logger.error(err.message, err.stack);
		res.render('errors/500.pug');
	});;
});

router.post('/edit', function(req, res, next) {
	var db = null;
	var sql = null;
	var POSTData = null;
	var countPriority = 0;
	var countBasicValues = 5;
	var countValuesTotal = 0;
	var similarityPairs = [];
	var users = [];
	var age = null;

	if (!req.isAuthorized) {
		res.redirect(`/?message='Пожалуйста, авторизуйтесь в системе`);
		return;
	}

	connectionPromise().then(function(connection) {
		
		db = connection;

		if (!req.body.flat) {
			req.body.flat = {
				id: ''
			};
		}

		var flatDataExists = (req.body.flat.address) ? true : false; 		// address is primary field
		var hasId = (req.body.flat.id !== '') ? true : false;	//
		var promiseChain = Promise.resolve();
		

		if (flatDataExists) {
			// Flat data exists

			validateFlat(req.body.flat);
			formatObjectForSQL(req.body.flat);
			
			if (hasId) {
				// existing flat

				promiseChain = promiseChain.then(function() {
					
					sql = `	UPDATE flat
						SET description = ${req.body.flat.description},
							address = ${req.body.flat.address},
							square = ${req.body.flat.square},
							room_num = ${req.body.flat.room_num},
							traffic = ${req.body.flat.traffic},
							rent_pay = ${req.body.flat.rent_pay},
							total_pay = ${req.body.flat.total_pay},
							enter_date = STR_TO_DATE(${req.body.flat.enter_date}, '%d.%m.%Y')
						WHERE id = ${req.body.flat.id};`
					logger.debug(req, sql);
					return db.queryAsync(sql);

				});

			} else {
				// new flat

				promiseChain = promiseChain.then(function() {

					sql = `		INSERT INTO flat(	description,
														address,
														square,
														room_num,
														traffic,
														rent_pay,
														total_pay,
														enter_date)
									VALUES (	${req.body.flat.description},
												${req.body.flat.address},
												${req.body.flat.square},
												${req.body.flat.room_num},
												${req.body.flat.traffic},
												${req.body.flat.rent_pay},
												${req.body.flat.total_pay},
												STR_TO_DATE(${req.body.flat.enter_date}, '%d.%m.%Y'));`;
					logger.debug(req, sql);
					return db.queryAsync(sql);
				
				}).then(function(result) {

					req.body.flat.id = result.insertId;

				});

			} // end 'new flat'

			promiseChain = promiseChain.then(function() {

				sql = `	UPDATE photo 
							SET flat_id = ${req.body.flat.id}, 
								temporary_user_id = NULL
							WHERE temporary_user_id = ${req.user_id};`;
				logger.debug(req, sql);
				return db.queryAsync(sql);

			}).then(function() {

				sql = ` DELETE FROM flat_district WHERE flat_id = ${req.body.flat.id};`;
				logger.debug(req, sql);
				return db.queryAsync(sql);
				
			});

			if (req.body.flatDistricts && req.body.flatDistricts.length) {
				promiseChain = promiseChain.then(function() {

					var sqlValues = [];
					req.body.flatDistricts.forEach(function(item) {
						sqlValues.push(`(${req.body.flat.id}, ${item})`);
					});

					sql = `	INSERT INTO flat_district(flat_id, district_id)
								VALUES ${sqlValues.join(',')};`;
					logger.debug(req, sql);
					return db.queryAsync(sql);
				});
			}

			promiseChain = promiseChain.then(function() {

				sql = ` DELETE FROM flat_utility WHERE flat_id = ${req.body.flat.id};`;
				logger.debug(req, sql);
				return db.queryAsync(sql);
				
			});

			if (req.body.utility && req.body.utility.length) {
				promiseChain = promiseChain.then(function() {

					var sqlValues = [];
					req.body.utility.forEach(function(item) {
						sqlValues.push(`(${req.body.flat.id}, ${item})`);
					});

					sql = `	INSERT INTO flat_utility(flat_id, utility_id)
								VALUES ${sqlValues.join(',')};`;
					logger.debug(req, sql);
					return db.queryAsync(sql);
				});
			}

		} // end 'flat data exists'

		return promiseChain;

	}).then(function() {
			
		validateUser(req.body.user);
		POSTData = formatObjectForSQLCopy(req.body.user);

		var now = moment();
		var bdate = moment(POSTData.birth_date, 'DD.MM.YYYY');
		age = now.diff(bdate, 'years');
		var wish_pay = (POSTData.wish_pay) ? POSTData.wish_pay : 'NULL';
		var about = (POSTData.about) ? POSTData.about : '\'\'';
		var flat_id = (req.body.flat.id !== '') ? req.body.flat.id : 'NULL';

		sql =
			`	UPDATE \`user\`
				SET first_name = ${POSTData.first_name},
					last_name = ${POSTData.last_name},
					sex = ${POSTData.sex},
					birth_date = STR_TO_DATE(${POSTData.birth_date}, '%d.%m.%Y'),
					age = ${age},
					about = ${about},
					phone = ${POSTData.phone},
					email = ${POSTData.email},
					city = ${POSTData.city},
					university_id = ${POSTData.university},
					faculty_id = ${POSTData.faculty},
					department_id = ${POSTData.department},
					studyyear_id = ${POSTData.studyyear},
					phone = ${POSTData.phone},
					wish_pay = ${wish_pay},
					flat_id = ${flat_id},
					is_activated = 1,
					search_status = ${POSTData.search_status}
				WHERE id = ${POSTData.id};`;
		logger.debug(req, sql);
		return db.queryAsync(sql);
	
	}).then(function() {

		sql = `DELETE FROM user_priority_option WHERE user_id = ${req.body.user.id};`;
		logger.debug(req, sql);
		return db.queryAsync(sql);

	}).then(function() {
			
		// todo: ?
		if (!req.body.priority.length) {
			return Promise.resolve();
		}	

		sql = `	INSERT INTO user_priority_option(user_id, priority_option_id) 
					VALUES (${req.body.user.id}, ${req.body.priority[0].id})`;
		for (var i = 1; i < req.body.priority.length; i++) {
					sql += ` \n ,(${req.body.user.id}, ${req.body.priority[i].id})`;
		}
		sql += ';';

		logger.debug(req, sql);
		return db.queryAsync(sql);

	}).then(function() {

		var promiseChain = Promise.resolve().then(function() {
			sql = `	DELETE FROM user_district WHERE user_id = ${req.body.user.id};`;
			logger.debug(req, sql);
			return db.queryAsync(sql);
		});

		if (req.body.userDistricts && req.body.userDistricts.length) {
			promiseChain = promiseChain.then(function() {

				var sqlValues = [];

				req.body.userDistricts.forEach(function(elem) {
					sqlValues.push(`(${elem}, ${req.body.user.id})`);
				});

				sql = ` INSERT INTO user_district(district_id, user_id)
							VALUES ${sqlValues.join(',')}`;
				logger.debug(req, sql);
				return db.queryAsync(sql);
			});
		}

		promiseChain = promiseChain.then(function() {
			sql = `	DELETE FROM user_campus500 WHERE user_id = ${req.body.user.id};`;
			logger.debug(req, sql);
			return db.queryAsync(sql);
		});

		if (req.body.userCampus500 && req.body.userCampus500.length) {
			promiseChain = promiseChain.then(function() {

				var sqlValues = [];

				req.body.userCampus500.forEach(function(elem) {
					sqlValues.push(`(${elem}, ${req.body.user.id})`);
				});

				sql = ` INSERT INTO user_campus500(campus500_id, user_id)
							VALUES ${sqlValues.join(',')}`;
				logger.debug(req, sql);
				return db.queryAsync(sql);
			});
		}

		return promiseChain;

	}).then(function() {

		countPriority = req.body.priority.length;
		countValuesTotal = countBasicValues + countPriority;

		sql = ` SELECT 
					id user_id,
					sex user_sex,
					age user_age,
					department_id,
					faculty_id,
					university_id 
				FROM user`;
		logger.debug(req, sql);
		return db.queryAsync(sql);

	}).then(function(result) {

		users = result;

		var promiseChain = Promise.resolve();

		for (let i = 0; i < users.length; i++) {
			promiseChain = promiseChain.then(function() {

				sql = ` SELECT a.id, a.default 
						FROM user_priority_option b
						JOIN priority_option a ON b.priority_option_id = a.id
						WHERE b.user_id = ${users[i].user_id}
						ORDER BY a.id;`;
				//logger.debug(req, sql);
				return db.queryAsync(sql);

			}).then(function(result) {

				//logger.debug(req, JSON.stringify(result));

				users[i].priorities = [];
				
				for (var j = 0; j < result.length; j++) {
					users[i].priorities.push({
						id: result[j].id,
						isDefault: (result[j].default === 1) ? true : false
					});
				}
			});
		}

		return promiseChain;

	}).then(function() {

		for (var i = 0; i < users.length; i++) {
			if (users[i].user_id == req.body.user.id) continue;

			var score = 0.0;

			if (users[i].user_sex == req.body.user.sex) score += 1;

			if (users[i].university_id && req.body.user.university !== '' && users[i].university_id == req.body.user.university) {
				score += 1;
			} else {
				score += 0.3;
			}

			if (users[i].faculty_id && req.body.user.faculty !== '' && users[i].faculty_id == req.body.user.faculty) {
				score += 1;
			} else {
				score += 0.3;
			}

			if (users[i].department_id && req.body.user.department !== '' && users[i].department_id == req.body.user.department) {
				score += 1;
			} else {
				score += 0.3;
			}

			if (users[i].user_age && age) {
				var diffAge = Math.abs(users[i].user_age - age);	
				if (diffAge < 3) {
					score += 1;
				} else if (diffAge < 6) {
					score += 0.6;
				} else {
					score += 0.3;
				}
			}

			if (users[i].priorities.length && req.body.priority.length) {
				for (var k = 0; k < users[i].priorities.length; k++) {
					if (users[i].priorities[k].id == req.body.priority[k].id) {
						if (users[i].priorities[k].isDefault) {
							score += 0.3;
						} else {
							score += 1;
						}
					} else if ( (users[i].priorities[k].isDefault && req.body.priority[k].isDefault !== 'true') ||
								(!users[i].priorities[k].isDefault && req.body.priority[k].isDefault === 'true') ) {
						score += 0.3;
					} 
				}
			}
			
			var scorePercent = score / countValuesTotal;
			var min = Math.min(users[i].user_id, req.body.user.id);
			var max = Math.max(users[i].user_id, req.body.user.id);
			similarityPairs.push({
				userId1: min,
				userId2: max,
				percent: Math.round(scorePercent * 100) / 100
			});
		}

		console.log('similarityPairs=', similarityPairs);

		var myId = parseInt(req.body.user.id);

		sql = `	DELETE FROM similarity
				WHERE (user_id1 < ${myId} AND user_id2 = ${myId})
				   OR (user_id1 = ${myId} AND user_id2 > ${myId});`;
		return db.queryAsync(sql);
				   
	}).then(function() {

		var sqlValues = [];
		
		similarityPairs.forEach(function(pair) {
			sqlValues.push(`(${pair.userId1}, ${pair.userId2}, ${pair.percent})`);
		});

		sql = ` INSERT INTO similarity (user_id1, user_id2, percent)
				VALUES ${ sqlValues.join(',') };`;

		return db.queryAsync(sql);

	}).then(function() {

		res.json({
			status: 'ok'
		});

	}).catch(function(err) {
	
		logger.error(req, err.stack, err.message);
		res.json({
			status: 'not ok'
		});
	
	});
});

router.post('/upload_avatar', uploader.single('upload'), function(req, res, next) {
	function convertResourceLocator(path) {
		var uri = path.replace(/\\/g, '/');
		var ind = uri.indexOf('/');
		var res = uri.substr(ind);
		return res;
	}

	var db = null;
	var photo = null;

	connectionPromise().then(function(connection) {
		
		db = connection;
		photo = convertResourceLocator(req.file.path);

		var sql = `
			UPDATE \`user\`
			SET avatar = '${photo}'
			WHERE id = ${req.body.user_id};`;

		logger.debug(req, sql);
		return db.queryAsync(sql);
	
	}).then(function(result) {
		
		logger.debug(req, result);
		res.json({
			status: 'ok',
			user_avatar: photo
		});

	}).catch(function(err) {
		
		logger.error(req, err.message, err.stack);
		res.json({
			status: 'not ok'
		});

	});
});

router.post('/upload_photos', uploader.array('uploads'), function(req, res, next) {
	
	function convertResourceLocator(path) {
		var uri = path.replace(/\\/g, '/');
		var ind = uri.indexOf('/');
		var res = uri.substr(ind);
		return res;
	}

	//todo: handle errors when file uploading
	var db = null;
	var newPhotos = [];
	
	connectionPromise().then(function(connection) {
		
		db = connection;
		
		var promises = [];
		for (var i = 0; i < req.files.length; i++) {
			promises.push(sizeOfAsync(req.files[i].path));
		}
		
		return Promise.all(promises);
	
	}).then(function(dimensionsArray) {
		var sql = `	INSERT INTO photo(	src_small, 
										src_orig, 
										filename_small,
										filename_orig,
										width_small, 
										height_small, 
										width_orig, 
										height_orig,
										date_created,
										date_updated,
										temporary_user_id)
					VALUES 
			`;
		//todo: abstract photo upload
		//todo: compress photo
		for (var i = 0; i < req.files.length; i++) {
			
			var photoHref = convertResourceLocator(req.files[i].path);
			newPhotos.push({href: photoHref});

			sql += `(	'${photoHref}', 
						'${photoHref}',
						'${req.files[i].filename}',
						'${req.files[i].filename}', 
						${dimensionsArray[i].width}, 
						${dimensionsArray[i].height}, 
						${dimensionsArray[i].width}, 
						${dimensionsArray[i].height}, 
						NOW(),
						NOW(),
						${req.user_id})`;
			if (i !== (req.files.length - 1)) {
				sql += ', ';
			}
		}	

		logger.debug(req, sql);
		return db.queryAsync(sql);
	}).then(function(result) {
		logger.debug(req, result);
		
		for (var i = 0; i < result.affectedRows; i++) {
			newPhotos[i].id = result.insertId + i;
		}

		res.json({
			status: 'ok',
			newPhotos: newPhotos
		});

	}).catch(function(err) {
	
		logger.error(req, err.message, err.stack);
		res.json({
			status: 'not ok'
		});
	
	});
});

router.post('/unsubscribe', function(req, res, next) {
	var db = null;
	var sql = null;

	if (!req.isAuthorized) {
		res.render('site/profile_unsubscribe.pug', {
			isAuthorized: req.isAuthorized,
			userId: req.user_id
		});
		return;
	}

	connectionPromise().then(function(connection) {

		db = connection;

		sql = ` UPDATE user SET is_emailable = 0 WHERE id = ${req.user_id};`;
		logger.debug(req, sql);
		return db.queryAsync(sql);

	}).then(function() {

		res.json({
			status: 'ok',
			message: 'Вы успешно отписались от рассылки'
		});
		
	}).catch(function(err) {

		logger.error(err.message, err.stack);
		res.json({
			status: 'not ok',
			message: 'Ошибка'
		});

	});
});

router.delete('/delete_photo', function(req, res, next) {
	var db = null;
	connectionPromise().then(function(connection) {
		
		db = connection;
		var sql = ` SELECT filename_orig FROM photo WHERE id = '${req.body.photo_id.replace(/\'/g, '\\\'')}';`;
		logger.debug(req, sql);
		return db.queryAsync(sql);
	
	}).then(function(result) {
	
		logger.debug(req, result);
		return fs.unlinkAsync(path.normalize(__dirname + '/../../public/images/uploads/user_'+req.user_id+'/'+result[0].filename_orig));
	
	}).then(function() {
		
		logger.debug(req, `Unlink file success`);
		var sql = `	DELETE FROM photo WHERE id = '${req.body.photo_id.replace(/\'/g, '\\\'')}';`;
		logger.debug(req, sql);
		return db.queryAsync(sql);
	
	}).then(function(result) {
	
		logger.debug(req, result);
		res.json({
			status: 'ok'
		});
	
	}).catch(function(err) {
	
		logger.error(req, err.stack + err.message);
		res.json({
			status: 'not ok'
		});
	
	});
});

router.delete('/clear_temporary_flat_photos', function(req, res, next) {
	if (!req.isAuthorized) {
		res.json({
			status: 'not ok',
			message: 'You are not authorized'
		});
		return;
	}

	connectionPromise().then(function(connection) {

		var sql = ` DELETE 
					FROM photo 
					WHERE temporary_user_id = ${req.user_id}; `;

		logger.debug(req, sql);

		return connection.queryAsync(sql);

	}).then(function(result) {

		logger.debug(req, result);
		res.json({
			status: 'ok'
		});
		
	}).catch(function(err) {

		logger.error(err.message, err.stack);
		res.render('errors/500.pug');

	});
});

router.get('/get_faculties/:university_id(\\d+)', function(req, res, next) {
	var db = null;
	connectionPromise().then(function(connection) {
		db = connection;
		var sql = ` 
			SELECT '' id, 'Не выбран' name_full
			UNION
			SELECT id, name_full FROM faculty WHERE university_id = ${req.params.university_id};`;	
		logger.debug(req, sql);
		return db.queryAsync(sql);
	}).then(function(result) {
		logger.debug(req, result);
		res.json({
			status: 'ok',
			faculties: result
		});
	}).catch(function(err) {
		res.json({
			status: 'not ok'
		});
	});
});

router.get('/get_departments/:faculty_id(\\d+)', function(req, res, next) {
	var db = null;
	var departments = [];
	connectionPromise().then(function(connection) {
		db = connection;
		var sql = ` 
			SELECT '' id, 'Не выбрана' name_full
			UNION
			SELECT id, name_full FROM department WHERE faculty_id = ${req.params.faculty_id};`;	
		logger.debug(req, sql);
		return db.queryAsync(sql);
	}).then(function(result) {
		logger.debug(req, result);
		departments = result;
		res.json({
			status: 'ok',
			departments: departments
		});
	}).catch(function(err) {
		res.json({
			status: 'not ok'
		});
	});
});

module.exports = router;