'use strict';

const router = require('express').Router();
const Promise = require('bluebird');
const menuConfig = require('../../config/menu.js');
const userCriterias = require('../../config/search-criterias.js').user;
const postCriterias = require('../../config/search-criterias.js').post;
const connectionPromise = require('../../components/connectionPromise.js');
const myUtil = require('../../components/myUtil.js');
const sizeOfAsync = Promise.promisify(require('image-size'));
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');
const logger = require('log4js').getLogger();

var currentUserId = 1;

const multer  = require('multer');
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'public/images/uploads')
	},
	filename: function (req, file, cb) {
		const i = file.originalname.lastIndexOf('.');
		const ext = file.originalname.substr(i);
		cb(null, 'user-' + currentUserId + '_time-' + Date.now() + ext);
	}
})
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

var menuGenerated;

function validateFlat(flat) {
	if (!flat.description) {
		throw new Error(`Parameters validation error (flat.description): ${flat.description}.`);
	}
	if (!flat.description.length > 200) {
		throw new Error(`Parameters validation error: flat.description.length = ${flat.description.length}.`);
	}
	if (!flat.address) {
		throw new Error(`Parameters validation error (flat.address): ${flat.address}.`);
	}
	if (!flat.address.length > 200) {
		throw new Error(`Parameters validation error: flat.address.length = ${flat.address.length}.`);
	}
	if (!flat.room_num) {
		throw new Error(`Parameters validation error (flat.room_num): ${flat.room_num}.`);
	}
	// todo: validate room_num is integer
	
	if (!flat.flat_total_pay) {
		throw new Error(`Parameters validation error (flat.flat_total_pay): ${flat.flat_total_pay}.`);
	}
	// 
	if (!flat.square) {
		throw new Error(`Parameters validation error (flat.square): ${flat.square}.`);	
	}
	// todo: validate square is float
	if (!flat.traffic.length > 300) {
		throw new Error(`Parameters validation error: flat.traffic.length = ${flat.traffic.length}.`);
	}
}

function validatePost(post) {

	if (!post.rent_pay) {
		throw new Error(`Parameters validation error (post.rent_pay): ${post.rent_pay}.`);
	}
	// todo: validate rent_pay is float
	if (!post.enter_date.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
		throw new Error(`Parameters validation error: post.enter_date=\'${post.enter_date}\' doesn\'t match dd.mm.yyyy format!`);
	}
	// todo: log validation errors?
	// todo: validate enter_date is float
}

function formatRequestBodyForSQL(body) {
	// The following processes data, received from the form into sql query values
	var obj = body;
	for (var key in obj) {
		if (obj.hasOwnProperty(key)) {
			//convert 'true'/'false' into 1/0 (checkbox values in mind...)
			switch (obj[key]) {
				case 'true':
					obj[key] = 1;
					break;
				case 'false':
					obj[key] = 0;
					break;
			}

			//convert blank strings into 'NULL's
			if (obj[key].length === 0) {
				obj[key] = 'NULL';	
			} 

			//escaping all, except 'NULL', into single quotes, preparing it for sql query
			if (obj[key] !== 'NULL') {
				obj[key] = '\'' + obj[key] + '\'';
			}
		
		}
	}
}

router.all('*', function(req, res, next) {
	/*if (!req.isAuth) {
		res.status(403).send('У Вас недостаточно прав для доступа к данному ресурсу.');
	}*/

	menuGenerated = myUtil.menuGenerate(menuConfig.menuAdmin, req);
	
	req['user'] = {};

	next();
});

router.get('/', function(req, res, next) {
	var db = null;
	var records = null;

	connectionPromise().then(function(connection) {
		db = connection;

		console.log('req.body', req.body, 'req.params', req.params);

		var sql = `
			SELECT 	Post.id post_id, 
					Post.type, 
					rent_pay, 
					CONCAT(\`User\`.first_name, ' ', \`User\`.last_name) user_name,
					UPPER(SUBSTRING(\`User\`.sex, 1, 1)) sex, 
					\`User\`.avatar,
					\`User\`.last_name, 
					\`User\`.age, 
					\`User\`.city, 
					\`User\`.university,
					Flat.id flat_id,
					(SELECT src_small FROM Photo WHERE Photo.flat_id = flat_id ORDER BY id LIMIT 1) src_small  
			FROM Post
			JOIN \`User\` ON Post.user_id = \`User\`.id
			LEFT JOIN Flat ON Post.flat_id = Flat.id
			ORDER BY date_created DESC
			LIMIT 9;`;

		console.log(sql);
		return db.queryAsync(sql);
	}).then(function(result) {	
		
		console.log('query ok, count=' + result.length);
		//todo: check correctness sql query
		records = result;

		res.render('site/post_startup.pug', {
			message: '',
			messageType: '', 
			menu: menuGenerated,
			records: records,
			postType: postCriterias.type,
			userSuccess: userCriterias.success,
			userUniver: userCriterias.university,
			userCar: userCriterias.car,
			userPets: userCriterias.pets,
			userHabbits: userCriterias.badHabbits,
			userAge: userCriterias.age,
			userSex: userCriterias.sex,
			userSocialActivity: userCriterias.socialActivity,
			type: req.params.type
		});
	}).catch(function(err) {
		logger.error(err.message, err.stack);
		res.render('errors/500.pug');
	});
});

router.post('/ajax', function(req, res, next) {
	var db = null;
	var records = null;

	connectionPromise().then(function(connection) {
		db = connection;

		var sql = `
			SELECT 	Post.id post_id, 
					Post.type, 
					rent_pay, 
					CONCAT(\`User\`.first_name, ' ', \`User\`.last_name) user_name,
					UPPER(SUBSTRING(\`User\`.sex, 1, 1)) sex,  
					\`User\`.avatar,
					\`User\`.age, 
					\`User\`.city, 
					\`User\`.university,
					Flat.address,
					Flat.id flat_id,
					(SELECT src_small FROM Photo WHERE Photo.flat_id = flat_id ORDER BY id LIMIT 1) src_small  
			FROM Post
			JOIN \`User\` ON Post.user_id = \`User\`.id
			LEFT JOIN Flat ON Post.flat_id = Flat.id
			WHERE 	1 = 1`;

		formatRequestBodyForSQL(req.body);

		// Когда человек ищет оъявление о поиске квартиры, то надо понимать что вбазе оно хрантися 
		// как find-roomate. Почему?
		// Когда объявление создается, то все просто: "ищу румейта" - тип find-roommate, "ищу квартиру" - тип find-flat.
		// Но когда другой человек ищет объявление, то процесс обратный. 
		// "Я ищу квартиру" - значит я ищу того, кто ищет румейта - тип "find-roommate"
		// "Я ищу румейта" - значит у меня есть квартира, в которую я пущу человека - тип "find-flat"
		if (req.body.type !== '\'all\'') {
			if (req.body.type === '\'find-roommate\'') {
				sql += `\n AND type = 'find-flat'`;
			} else {
				sql += `\n AND type = 'find-roommate'`;
			}
		}
		if (req.body.user_sex !== '\'не важно\'') {
			sql += `\n AND user_sex = ${req.body.user_sex}`;
		}
		if (req.body.user_age_range !== '\'не важно\'') {
			sql += `\n AND user_age_range = ${req.body.user_age_range}`;
		}
		if (req.body.user_activity !== '\'не важно\'') {
			sql += `\n AND user_activity = ${req.body.user_activity}`;
		}
		if (req.body.user_pets !== '\'не важно\'') {
			sql += `\n AND user_pets = ${req.body.user_pets}`;
		}
		if (req.body.user_car !== '\'не важно\'') {
			sql += `\n AND user_car = ${req.body.user_car}`;
		}
		if (req.body.user_university !== '\'не важно\'') {
			sql += `\n AND user_university = ${req.body.user_university}`;
		}
		if (req.body.user_success !== '\'не важно\'') {
			sql += `\n AND user_success = ${req.body.user_success}`;
		}

		sql += '\nORDER BY date_created DESC\nLIMIT 9;'

		console.log(sql);
		return db.queryAsync(sql);
	}).then(function(result) {	
		console.log('query ok, count=' + result.length);
		records = result;

		res.json({
			status: 'ok',
			records: records
		});
	
	}).catch(function(err) {
		logger.error(err.message, err.stack);
		res.json({
			status: 'not ok'
		});
	});
});

router.get('/page/:page(\\d+)', function(req, res, next) {
	var db = null;
	var countRows = null;
	var news = null;
	connectionPromise().then(function(connection) {
		db = connection;
		var sql = `	SELECT COUNT(*) num_rows
					FROM info_units WHERE date_deleted is null;`;
		return db.queryAsync(sql);
	}).then(function(results) {
		countRows = results[0].num_rows;
		return db.queryAsync(`	SELECT id, title, text_short, text_full, info_types_id, 
								DATE_FORMAT(CAST(date_created AS CHAR), '%d.%m.%Y') date_created, 
								DATE_FORMAT(CAST(date_published AS CHAR), '%d.%m.%Y') date_published,
								date_created sort
								FROM info_units WHERE date_deleted is null
								ORDER BY sort DESC
								LIMIT ${(req.params.page-1)*10}, 10;`);
	}).then(function(rows) {	
		news = rows;
			
		var idsList = '';
		for (var i = 0, len = rows.length; i < len; i++) {
			idsList += rows[i].id;
			if (i !== len - 1) {
				idsList += ',';
			}
		}

		const query = `	SELECT src_small, info_unit_id, width, height
						FROM info_units_photos
						WHERE info_unit_id IN (${idsList})
						AND date_deleted IS NULL;`;

		return db.queryAsync(query);
	}).then(function(photos) {
		res.render('admin/admin_news_all', {
			news: news,
			photos: photos,
			menu: menuGenerated,
			message: '',
			messageType: '',
			pagination: {
				currentPage: req.params.page,
				step: 10,
				totalPages: Math.trunc(countRows / 10) + 1
			}
		});
	}).catch(function(err) {
		logger.error(err.message, err.stack);
		res.render('admin/server_error.pug');
	});
});

router.get('/create/:type(\\S+)?', function(req, res, next) {
	var db = null;
	var postsFindRoommate = null;
	var postsFindFlat = null;
	
	Promise.resolve().then(function() {
		if (!req.params.type) {
			req.params.type = 'roommate';
		}
		if (req.params.type !== 'roommate' && req.params.type !== 'flat') {
			throw new Error(`Parameters validation error: req.params.type=\'${req.params.type}\' is not \'roommate\' or \'flat\'.`);
		}
		
		return connectionPromise();	
	}).then(function(connection) {
		db = connection;
		/*var sql = `
			SELECT *
			FROM Post
			WHERE user_id = ${currentUserId}
			  AND type = 'find-${req.params.type}';
		`;
		logger.log(sql);
		return db.queryAsync(sql);*/
	}).then(function(results) {
		/*logger.log(results);*/
	}).then(function() {
		res.render('site/post_create.pug', {
			message: '',
			messageType: '', 
			menu: menuGenerated,
			userSuccess: userCriterias.success,
			userUniver: userCriterias.university,
			userCar: userCriterias.car,
			userPets: userCriterias.pets,
			userHabbits: userCriterias.badHabbits,
			userAge: userCriterias.age,
			userSex: userCriterias.sex,
			userSocialActivity: userCriterias.socialActivity,
			type: req.params.type
		});	
	}).catch(function(err) {
		console.log(err.message);
		if (err.message.includes('Parameters validation error')) {
			console.log(err.message, err.stack);
			res.render('errors/404.pug');
			return;
		}
		console.error(err.message, err.stack);
		res.render('errors/500.pug');
	});
});

router.get('/:newsId(\\d+)/photos/', function(req, res, next) {
	var db = null;
	connectionPromise().then(function(connection) {
		db = connection;
		return db.queryAsync(`
			SELECT id, src_small, src_big, width, height
			FROM info_units_photos
			WHERE info_unit_id = ${req.params.newsId} 
			AND date_deleted is NULL;`);
	}).then(function(photos) {
		res.render('admin/admin_photos', {
			message: '',
			messageType: '', 
			menu: menuGenerated,
			photos: photos,
			infoUnitId: req.params.newsId
		});	
	}).catch(function(err) {
		logger.error(err.message, err.stack);
		res.render('admin/server_error.pug');
	});
});

router.get('/edit/:id(\\d+)', function(req, res, next) {
	var db = null;
	connectionPromise().then(function(connection) {
		db = connection;
		var sql = `SELECT id, name FROM info_types`;
		return db.queryAsync(sql);
	}).then(function(infoTypes) {
		req.user.infoTypes = infoTypes;
		return db.queryAsync(`	SELECT id, title, text_short, text_full, info_types_id,
								DATE_FORMAT(CAST(date_published AS CHAR), '%d.%m.%Y') date_published
								FROM info_units WHERE id = ${req.params.id}`);
	}).then(function(rows) {
		if (rows.length < 1) {
			throw new Error('No news were found.')
		} else if (rows.length > 1) {
			throw new Error('Duplicate news were found');
		}

		res.render('admin/admin_news_edit', {
			message: '',
			messageType: '', 
			menu: menuGenerated,
			newsOnce: rows[0],
			infoTypes: req.user.infoTypes
		});
	}).catch(function(err) {
		logger.error(err.message, err.stack);
		res.render('admin/server_error.pug');
	});
});

router.post('/', function(req, res, next) {
	var db = null;
	var type = null;
	var flatId = null;
	var postId = null;
	var photoFlag = null;

	Promise.resolve().then(function() {
		if (!req.body.type) {
			throw new Error(`Parameters validation error (type): ${req.body.type}.`);
		}
		if (req.body.type !== 'find-roommate' && req.body.type !== 'find-flat') {
			throw new Error(`Parameters validation error: req.body.type=\'${req.body.type}\' is not \'find-roommate\' or \'find-flat\'.`);
		}

		// Если уже есть квартира и ищу соседа
		if (req.body.type === 'find-roommate') {
			validateFlat(req.body);
			validatePost(req.body);
		} else {
			// Ищу соседа с квартирой
			validatePost(req.body);
		}

		return connectionPromise(); 
	}).then(function(connection) {
		db = connection;	
		
		formatRequestBodyForSQL(req.body);

		if (req.body.type === '\'find-roommate\'') {
			var sql = 
			`	INSERT INTO Flat(	description, 
									address, 
									room_num, 
									flat_total_pay, 
									square, 
									traffic,
									util_conditioner,
									util_coffee,
									util_microwave,
									util_internet,
									util_parking)
				VALUES (${req.body.description},
					${req.body.address},
					${req.body.room_num},
					${req.body.flat_total_pay},
					${req.body.square},
					${req.body.traffic},
					${req.body.util_conditioner},
					${req.body.util_coffee},
					${req.body.util_microwave},
					${req.body.util_internet},
					${req.body.util_parking});
			`;

			console.log(sql);
			return db.queryAsync(sql);
		}
	}).then(function(result) {
		if (req.body.type === '\'find-roommate\'') {
			console.log(result);
			flatId = result.insertId;
		}

		var sql = null;
		if (req.body.type === '\'find-flat\'') {
			// less fields
			sql = 
			`	INSERT INTO Post(	type, 
									enter_date, 
									date_created,
									date_updated,
									rent_pay,
									user_sex,
									user_age_range,
									user_activity,
									user_badhabbits,
									user_pets,
									user_university,
									user_car,
									user_success,
									user_id,
									flat_id)
				VALUES (${req.body.type},
					STR_TO_DATE(${req.body.enter_date}, '%d.%m.%Y'),
					NOW(),
					NOW(),
					${req.body.rent_pay},
					${req.body.user_sex},
					${req.body.user_age_range},
					${req.body.user_activity},
					${req.body.user_badhabbits},
					${req.body.user_pets},
					${req.body.user_university},
					${req.body.user_car},
					${req.body.user_success},
					${currentUserId},
					${flatId});
			`;
		} else {
			// all fields
			sql = 
			`	INSERT INTO Post(	type, 
									enter_date, 
									date_created,
									date_updated,
									rent_pay,
									user_sex,
									user_age_range,
									user_activity,
									user_badhabbits,
									user_pets,
									user_university,
									user_car,
									user_success,
									flat_conditioner,
									flat_coffee,
									flat_microwave,
									flat_internet,
									flat_parking,
									user_id,
									flat_id)
				VALUES (${req.body.type},
					STR_TO_DATE(${req.body.enter_date}, '%d.%m.%Y'),
					NOW(),
					NOW(),
					${req.body.rent_pay},
					${req.body.user_sex},
					${req.body.user_age_range},
					${req.body.user_activity},
					${req.body.user_badhabbits},
					${req.body.user_pets},
					${req.body.user_university},
					${req.body.user_car},
					${req.body.user_success},
					${req.body.util_conditioner},
					${req.body.util_coffee},
					${req.body.util_microwave},
					${req.body.util_internet},
					${req.body.util_parking},
					${currentUserId},
					${flatId});
			`;
		}

		console.log(sql);
		return db.queryAsync(sql);
	}).then(function(result) {
		console.log(result);
		postId = result.insertId;
		
		var sql = `UPDATE Photo SET temporary_user_id = NULL, flat_id = ${flatId} WHERE temporary_user_id = ${currentUserId};`;
		return db.queryAsync(sql);
	}).then(function(result) {
		
		console.log(result);
		// todo: store messages in config file in filesystem (priority:low)
		res.json({
			status: 'ok',
			id: postId
		});
	}).catch(function(err) {
		logger.error(err.message, err.stack);
		
		logger.log('Rollback table Photo (temporary photos)');
		var sql = `DELETE FROM Photo WHERE temporary_user_id = ${currentUserId};`;
		console.log(sql);
		db.queryAsync(sql);

		if (flatId) {
			logger.log('Rollback table Flat');
			var sql = `DELETE FROM Flat WHERE id = ${flatId};`;
			console.log(sql);
			db.queryAsync(sql);
		}
		if (postId) {
			logger.log('Rollback table Post');
			var sql = `DELETE FROM Post WHERE id = ${postId};`;
			console.log(sql);
			db.queryAsync(sql);
		}
		res.render('errors/500.pug');
	});

});

router.put('/:id(\\d+)', function(req, res, next) {
	var db = null;
	connectionPromise().then(function(connection) {	
		db = connection;
		validate(req.body); // it'll throw an exception if validation fails

		var datePublished = (req.body.isPublished === '\'1\'') ? 'NOW()' : 'NULL';

		var sql = `UPDATE info_units
						SET title = ${req.body.title},
						text_short = ${req.body.textShort},
						text_full = ${req.body.textFull},
						date_updated = NOW(),
						date_published = ${datePublished},
						info_types_id = ${req.body.infoTypesId}
					WHERE id = ${req.params.id}`;
		return db.queryAsync(sql);
	}).then(function() {
		res.json({
			code: 200,
			message: 'Новость успешно обновлена',
			id: req.params.id
		});
	}).catch(function(err) {
		logger.error(err.message, err.stack);
		res.json({
			code: 404,
			message: 'Новость не обновлена'
		});
	})
});

router.delete('/:id(\\d+)', function(req, res, next) {
	var db = null;
	connectionPromise().then(function(connection) {
		db = connection;
		var sql = `SELECT COUNT(*) AS 'is_deleted' FROM info_units WHERE id = ${req.params.id} AND date_deleted IS NOT NULL;`;
		return db.queryAsync(sql).then(function(rows) {
			
			// if this news is already deleted, then throwing error
			if (rows[0].is_deleted > 0) {
				throw new Error('News is already deleted');
			}

			sql = `UPDATE info_units SET date_deleted = NOW() WHERE id = ${req.params.id}`;
			return db.queryAsync(sql);	
		});
	}).then(function(result) {
		var sql = `UPDATE info_units_photos SET date_deleted = NOW() WHERE info_unit_id = ${req.params.id};`
		return db.queryAsync(sql);
	}).then(function(result) {
		res.json({
			code: 200,
			message: 'Новость была удалена'
		});
	}).catch(function(err) {
		logger.error(err.message, err.stack);
		res.json({
			code: 404,
			message: 'Новость не удалена'
		});
	})
});

router.post('/upload_photo', uploader.single('upload'), function(req, res, next) {
	function convertResourceLocator(path) {
		var uri = path.replace(/\\/g, '/');
		var ind = uri.indexOf('/');
		var res = uri.substr(ind);
		return res;
	}

	var db = null;
	var photoHref = null;
	var photoId = null;

	connectionPromise().then(function(connection) {
		db = connection;
		
		photoHref = convertResourceLocator(req.file.path);
		return sizeOfAsync(req.file.path);
	}).then(function(dimensions) {
	
		var sql = `
			INSERT INTO Photo (
				src_small, 
				src_orig, 
				width_small, 
				height_small, 
				width_orig, 
				height_orig,
				date_created,
				date_updated,
				temporary_user_id)
			VALUES (
				'${photoHref}', 
				'${photoHref}', 
				${dimensions.width}, 
				${dimensions.height}, 
				${dimensions.width}, 
				${dimensions.height}, 
				NOW(),
				NOW(),
				${currentUserId}
			);
		`;

		console.log(sql);
		return db.queryAsync(sql);
	}).then(function(result) {
		console.log(result);

		photoId = result.insertId;
		res.json({
			status: 'ok',
			photoHref: photoHref
		});
	}).catch(function(err) {
		logger.error(err.message, err.stack);
		var sql = null;
		if (photoId) {
			console.log('ROLLBACK Photo...');
			sql = `DELETE FROM Photo WHERE id = ${photoId};`;
			console.log(sql);
			db.queryAsync(sql);
		}
		
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
			newPhotos.push(photoHref);

			sql += `(	'${photoHref}', 
						'${photoHref}', 
						${dimensionsArray[i].width}, 
						${dimensionsArray[i].height}, 
						${dimensionsArray[i].width}, 
						${dimensionsArray[i].height}, 
						NOW(),
						NOW(),
						${currentUserId})`;
			if (i !== (req.files.length - 1)) {
				sql += ', ';
			}
		}	

		console.log(sql);
		return db.queryAsync(sql);
	}).then(function(result) {
		console.log(result);
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

router.delete('/remove_all_photos', function(req, res, next) {
	var db = null;
	connectionPromise().then(function(connection) {
		db = connection;

		var sql = `UPDATE info_units_photos SET date_deleted = NOW() WHERE info_unit_id = ${req.body.infoUnitId};`;
		return db.queryAsync(sql);	
	}).then(function(result) {
		
		res.json({
			code: 200,
			message: 'Фотографии успешно удалены'
		});

	}).catch(function(err) {
	
		logger.error(err.message, err.stack);
		res.json({
			code: 404,
			message: 'Ошибка при удалении фотографий'
		});
	
	});
});

module.exports = router;