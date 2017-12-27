'use strict';

const router = require('express').Router();
const logger = require('log4js').getLogger();
const Promise = require('bluebird');

const connectionPromise = require('../../components/connectionPromise.js');

router.get('/', function(req, res, next) {
	var db = null;

	if (req.isAuthorized) {
		res.redirect('/profile/view/' + req.user_id);
		return;
	}

	connectionPromise().then(function(connection) {
		db = connection;
		
		var sql = ` SELECT 
						user_sex,
						user_age,
						university_name,
						user_city,
						flat_rent_pay,
						flat_address,
						flat_first_photo
					FROM v_user
					WHERE flat_id IS NOT NULL
					ORDER BY user_date_register DESC
					LIMIT 6`;

		logger.debug(sql);
		return db.queryAsync(sql);

	}).then(function(result) {

		logger.debug(result);
		res.render('site/homepage.pug', {
			lastRecordsWithFlat: result, 
			message: req.query.message,
			isAuthorized: req.isAuthorized,
			userId: req.user_id
		});
	
	}).catch(function(err) {
	
		logger.error(err.message, err.stack);
		res.render('errors/500.pug');
	
	});
});

module.exports = router;