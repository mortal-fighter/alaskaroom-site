'use strict';

const router = require('express').Router();
const Promise = require('bluebird');
const logger = require('log4js').getLogger();

const connectionPromise = require('../../components/connectionPromise.js');

router.get('/', function(req, res, next) {
	res.render('site/faculty.pug', {
		isAuthorized: req.isAuthorized,
		userId: req.user_id
	});
});

module.exports = router;