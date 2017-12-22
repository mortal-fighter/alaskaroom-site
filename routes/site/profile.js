'use strict';

const router = require('express').Router();
const Promise = require('bluebird');
const connectionPromise = require('../../components/connectionPromise.js');
const logger = require('log4js').getLogger();
const moment = require('moment');
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');
const sizeOfAsync = Promise.promisify(require('image-size'));

const multer  = require('multer');
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
			
				logger.error(err.stack, err.message);
			
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

			//escaping all, except 'NULL', into single quotes, preparing it for sql query
			if (object[key] !== 'NULL') {
				object[key] = '\'' + object[key] + '\'';
			}
		
		}
	}
}

function validateFlat(flat) {
	if (flat.id && !flat.id.match(/^\d+$/)) {
		throw new Error(`Parameters validation error (flat.id): '${flat.id}'.`);
	}
	if (flat.description && flat.description.length > 200) {
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
	if (!user.speciality) {
		throw new Error(`Parameters validation error (user.speciality): '${user.speciality}'.`);
	} else if (user.speciality.length > 150) {
		throw new Error(`Parameters validation error: user.speciality.length = ${user.speciality.length}.`);
	}
	if (user.phone && !user.phone.match(/^((8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{7,10}$/)) {
		throw new Error(`Parameters validation error (user.phone): '${user.phone}'.`);
	}
	if (user.wish_pay && !user.wish_pay.match(/^\d+$/)) {
		throw new Error(`Parameters validation error (user.wish_pay): '${user.wish_pay}'.`);
	}

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
	var priorities = [];
	var photos = [];
	var roommate_request_status = null;

	connectionPromise().then(function(connection) {
		
		db = connection;
		
		var sql = `	SELECT 
						user_id,
						user_first_name,
						user_last_name,
						user_name,
						user_age,
						user_about,
						user_avatar,
						university_id,
						university_name,	
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
						DATE_FORMAT(flat_enter_date, '%d.%m') flat_enter_date
					FROM v_user
					WHERE user_id = ${req.params.userId};`;
		logger.debug(sql);
		return db.queryAsync(sql);
	
	}).then(function(result) {

		logger.debug(result);
		data = result[0];

		var sql = `	SELECT priority_name_full, option_name
					FROM v_user_priority
					WHERE user_id = ${req.params.userId};`;
		logger.debug(sql);
		return db.queryAsync(sql);
	
	}).then(function(result) {
			
		logger.debug(result);
		priorities = result;		
		
		if (data.flat_id) {
			return Promise.resolve().then(function() {	
				var sql = `	SELECT 
								src_small, src_orig,
								width_small, height_small, width_orig, height_orig
							FROM photo
							WHERE flat_id = ${data.flat_id};`;
				return db.queryAsync(sql);
			}).then(function(result) {
				logger.debug(result);
				photos = result;
			});
		} else {
			return Promise.resolve();
		}
	
	}).then(function() {
		if (req.params.userId != req.user_id) {
			var sql = `	SELECT status 
						FROM roommate_request 
						WHERE from_user_id = ${req.user_id}
						  AND to_user_id = ${req.params.userId};`
			logger.debug(sql);
			return db.queryAsync(sql);
		} else {
			return Promise.resolve();
		}

	}).then(function(result) {
		
		if (result) {
			logger.debug(result);
		}

		if (result && result.length) {
			roommate_request_status = result[0].status;
		}

		res.render('site/profile_view.pug', {
			user_id: req.params.userId,
			data: data,
			photos: photos,
			priorities: priorities,
			roommate_request_status: roommate_request_status,
			isAuthorized: req.isAuthorized,
			userId: req.user_id
		});
	
	}).catch(function(err) {
		
		logger.error(err.message, err.stack);
		res.render('errors/500.pug');
	
	});
});

router.get('/edit/:userId((\\d+|me))', function(req, res, next) {
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

	var data = null;
	var universities = [];
	var faculties = [];
	var photos = [];
	var priorities = [];
	var userPriorities = [];
	var prioritySelect = [];
	var utilities = [];
	var flatUtilities = [];
	var utilityObject = [];
	var hasFlat = false;
	
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
						university_id,
						university_name,
						faculty_id,
						faculty_name,
						speciality_name,
						user_study_year,
						user_about,
						user_first_name,
						user_last_name,
						CONCAT(user_first_name, " ", user_last_name) user_name,
						user_wish_pay,
						flat_id,
						flat_description,
						flat_square,
						flat_traffic,
						flat_address,
						flat_room_num,
						flat_rent_pay,
						flat_total_pay,
						DATE_FORMAT(flat_enter_date, '%d.%m.%Y')	flat_enter_date
					FROM v_user
					WHERE user_id = ${req.params.userId};`;
		logger.debug(sql);
		return db.queryAsync(sql);
	
	}).then(function(result) {

		logger.debug(result);
		data = result[0];
		if (data.flat_id) {
			hasFlat = true;
		}

		var sql = ` SELECT id, name_short FROM university;`;
		logger.debug(sql);
		return db.queryAsync(sql);

	}).then(function(result) {

		logger.debug(result);
		universities = result;

		var sql = ` SELECT id, name_full FROM faculty WHERE university_id = ${data.university_id};`;
		logger.debug(sql);
		return db.queryAsync(sql);

	}).then(function(result) {

		logger.debug(result);
		faculties = result;

		var sql = `	SELECT * FROM v_priority`;
		logger.debug(sql);
		return db.queryAsync(sql);

	}).then(function(result) {

		//logger.debug(result);
		priorities = result;

		var sql = `	SELECT * FROM v_user_priority WHERE user_id = ${req.params.userId};`;
		logger.debug(sql);
		return db.queryAsync(sql);

	}).then(function(result) {

		//logger.debug(result);
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

		if (hasFlat) {
			return Promise.resolve().then(function() {	
				var sql = `	SELECT 
								id, src_small, src_orig,
								width_small, height_small, width_orig, height_orig
							FROM photo
							WHERE flat_id = ${data.flat_id};`;
				return db.queryAsync(sql);
			}).then(function(result) {
				logger.debug(result);
				photos = result;
			});
		} else {
			return Promise.resolve();
		}
	
	}).then(function() {

		var sql = `	SELECT 
						id 				utility_id, 
						display_name	utility_name 
					FROM utility
					ORDER BY display_order;`;
		logger.debug(sql);
		return db.queryAsync(sql);
	
	}).then(function(result) {

		logger.debug(result);
		logger.debug('hasFlat='+hasFlat);
		utilities = result;

		if (hasFlat) {
			var sql = `	SELECT utility_id
						FROM flat_utility
						WHERE flat_id = ${data.flat_id}; `;
			return db.queryAsync(sql);			
		} else {
			return Promise.resolve();
		}

	}).then(function(result) {

		if (hasFlat) {
			logger.debug(result);
			flatUtilities = result;
		}

		for (var i = 0; i < utilities.length; i++) {
			utilityObject.push({
				id: utilities[i].utility_id,
				name: utilities[i].utility_name,
				isChecked: false
			});
			
			if (hasFlat) {
				for (var j = 0; j < flatUtilities.length; j++) {
					if (flatUtilities[j].utility_id === utilities[i].utility_id) {
						utilityObject[i].isChecked = true;
						break;
					}
				}
			}
		}

		res.render('site/profile_edit.pug', {
			user_id: req.params.userId,
			data: data,
			universities: universities,
			faculties: faculties,
			photos: photos,
			priorities: prioritySelect,
			utilities: utilityObject,
			isAuthorized: req.isAuthorized,
			userId: req.user_id
		});
	
	}).catch(function(err) {
		
		logger.error(err.message, err.stack);
		res.render('errors/500.pug');
	
	});

});

router.post('/edit', function(req, res, next) {
	var db = null;

	if (!req.isAuthorized) {
		res.redirect(`/?message='Пожалуйста, авторизуйтесь в системе`);
		return;
	}

	connectionPromise().then(function(connection) {
		
		db = connection;
		
		console.log('FLAT=',req.body.flat);

		if (!req.body.flat) {
			req.body.flat = {
				id: ''
			};
		}
		var hasFlat = (req.body.flat.address) ? true : false; 		// address is primary field
		var hasId = (req.body.flat.id !== '') ? true : false;	//
		console.log('hasFlat, hasId', hasFlat, hasId);
		if (hasFlat) {
			validateFlat(req.body.flat);
			formatObjectForSQL(req.body.flat);
			var sql;

			if (hasId) {
				// update

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

			} else {
				// insert

				sql = `		INSERT INTO Flat(	description,
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

			} // end has flatId

			logger.debug(sql);

			return db.queryAsync(sql).then(function(result) {

				logger.debug(result);
				
				if (!hasId) {
					req.body.flat.id = result.insertId;
				}

				var sql = `	UPDATE photo 
							SET flat_id = ${req.body.flat.id}, 
								temporary_user_id = NULL
							WHERE temporary_user_id = ${req.user_id};`;
				logger.debug(sql);
				return db.queryAsync(sql);

			}).then(function(result) {

				logger.debug(result);
				
				if (!hasId) {
					var sql = `	DELETE FROM flat_utility WHERE flat_id = ${req.body.flat.id}`;
					logger.debug(sql);
					return db.queryAsync(sql);
				} else {
					return Promise.resolve();
				}

			}).then(function(result) {

				if (result) {
					logger.debug(result);
				}

				if (req.body.utility.length) {
					var sql = `	INSERT INTO flat_utility(flat_id, utility_id) 
								VALUES 
									(${req.body.flat.id}, ${req.body.utility[0]})`;
					for (var i = 1; i < req.body.utility.length; i++) {
						sql += `\n, (${req.body.flat.id}, ${req.body.utility[i]})`;
					}
					logger.debug(sql);
					return db.queryAsync(sql);
				}
			});

		} else { // end has flat

			return Promise.resolve();
			
		}

	}).then(function(result) {

		if (result) {
			logger.debug(result);
		}
			
		validateUser(req.body.user);
		formatObjectForSQL(req.body.user);

		var now = moment();
		var bdate = moment(req.body.user.birth_date, 'DD.MM.YYYY');
		var age = now.diff(bdate, 'years');
		var wish_pay = (req.body.user.wish_pay) ? req.body.user.wish_pay : 'NULL';
		var about = (req.body.user.about) ? req.body.user.about : '\'\'';

		var sql =
			`	UPDATE \`user\`
				SET first_name = ${req.body.user.first_name},
					last_name = ${req.body.user.last_name},
					sex = ${req.body.user.sex},
					birth_date = STR_TO_DATE(${req.body.user.birth_date}, '%d.%m.%Y'),
					age = ${age},
					about = ${about},
					phone = ${req.body.user.phone},
					email = ${req.body.user.email},
					city = ${req.body.user.city},
					university_id = ${req.body.user.university},
					faculty_id = ${req.body.user.faculty},
					speciality = ${req.body.user.speciality},
					study_year = ${req.body.user.study_year},
					phone = ${req.body.user.phone},
					wish_pay = ${wish_pay},
					flat_id = ${req.body.flat.id}
				WHERE id = ${req.body.user.id};`;
		logger.debug(sql);
		return db.queryAsync(sql);
	
	}).then(function(result) {

		logger.debug(result);
		var sql = `DELETE FROM user_priority_option WHERE user_id = ${req.body.user.id};`;
		logger.debug(sql);
		return db.queryAsync(sql);

	}).then(function(result) {

		logger.debug(result);
			
		// todo: ?
		if (!req.body.priority.length) {
			return Promise.resolve();
		}	

		var sql = `	INSERT INTO user_priority_option(user_id, priority_option_id) 
					VALUES (${req.body.user.id}, ${req.body.priority[0]})`;
		for (var i = 1; i < req.body.priority.length; i++) {
					sql += ` \n ,(${req.body.user.id}, ${req.body.priority[i]})`;
		}
		sql += ';';

		logger.debug(sql);
		return db.queryAsync(sql);

	}).then(function(result) {

		logger.debug(result);
		res.json({
			status: 'ok'
		});

	}).catch(function(err) {
	
		logger.error(err.stack, err.message);
		res.json({
			status: 'not ok'
		})
	
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

		logger.debug(sql);
		return db.queryAsync(sql);
	
	}).then(function(result) {
		
		logger.debug(result);
		res.json({
			status: 'ok',
			user_avatar: photo
		});

	}).catch(function(err) {
		
		logger.error(err.message, err.stack);
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
		var sql = `	INSERT INTO Photo(	src_small, 
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

		logger.debug(sql);
		return db.queryAsync(sql);
	}).then(function(result) {
		logger.debug(result);
		
		for (var i = 0; i < result.affectedRows; i++) {
			newPhotos[i].id = result.insertId + i;
		}

		res.json({
			status: 'ok',
			newPhotos: newPhotos
		});

	}).catch(function(err) {
	
		logger.error(err.message, err.stack);
		res.json({
			status: 'not ok'
		});
	
	});
});

router.delete('/delete_photo', function(req, res, next) {
	var db = null;
	connectionPromise().then(function(connection) {
		
		db = connection;
		var sql = ` SELECT filename_orig FROM photo WHERE id = ${req.body.photo_id};`;
		logger.debug(sql);
		return db.queryAsync(sql);
	
	}).then(function(result) {
	
		logger.debug(result);
		return fs.unlinkAsync(path.normalize(__dirname + '/../../public/images/uploads/user_'+req.user_id+'/'+result[0].filename_orig));
	
	}).then(function() {
		
		logger.debug(`Unlink file success`);
		var sql = `	DELETE FROM photo WHERE id = ${req.body.photo_id};`;
		logger.debug(sql);
		return db.queryAsync(sql);
	
	}).then(function(result) {
	
		logger.debug(result);
		res.json({
			status: 'ok'
		});
	
	}).catch(function(err) {
	
		logger.error(err.stack + err.message);
		res.json({
			status: 'not ok'
		});
	
	});
});

router.get('/get_faculties/:university_id', function(req, res, next) {
	var db = null;
	connectionPromise().then(function(connection) {
		db = connection;
		var sql = ` SELECT id, name_full FROM faculty WHERE university_id = ${req.params.university_id};`;	
		logger.debug(sql);
		return db.queryAsync(sql);
	}).then(function(result) {
		logger.debug(result);
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

module.exports = router;