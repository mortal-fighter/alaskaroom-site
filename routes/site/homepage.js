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
						\`User\`.sex,
						\`User\`.age,
						\`User\`.university,
						\`User\`.city,
						Flat.rent_pay,
						Flat.address,
						(SELECT 
							Photo.src_small
						FROM Photo
						WHERE flat_id = \`User\`.flat_id
						LIMIT 1) photo
					FROM \`User\`
					JOIN Flat ON Flat.id = \`User\`.flat_id
					ORDER BY date_register DESC
					LIMIT 6`;

		logger.debug(sql);
		return db.queryAsync(sql);

	}).then(function(result) {

		logger.debug(result);
		res.render('site/homepage.pug', {
			lastFlats: result, 
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