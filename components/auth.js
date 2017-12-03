'use strict';

const randomstring = require('randomstring');
const connectionPromise = require('../components/connectionPromise.js');
const logger = require('log4js').getLogger();

var db = null;

function sessionExistsByToken(token) {
	return new Promise(function(resolve, reject) {
		connectionPromise().then(function(connection) {
			db = connection;
			var sql = `	SELECT count(*) cnt FROM Session WHERE token = '${token}';`;
			logger.debug(sql);
			return db.queryAsync(sql);
		}).then(function(result) {
			logger.debug(result);
			if (result[0].cnt !== 1) {
				reject(new Error(`NO SESSION FOUND FOR TOKEN '${token}'`));
			} else {
				resolve();
			}
		});
	});
}

function sessionExistsByUserId(userId) {
	return new Promise(function(resolve, reject) {
		connectionPromise().then(function(connection) {
			db = connection;
			var sql = `	SELECT count(*) cnt FROM Session WHERE user_id = ${userId};`;
			logger.debug(sql);
			return db.queryAsync(sql);
		}).then(function(result) {
			logger.debug(result);
			if (result[0].cnt !== 1) {
				reject(new Error(`NO SESSION FOUND FOR USER '${userId}'`));
			} else {
				resolve();
			}
		});
	});
}

module.exports = {
	sessionStart: function(userId) {
		var token;
		return new Promise(function(resolve, reject) {
			connectionPromise().then(function(connection) {
				db = connection;
				token = randomstring.generate();
				var sql = `	INSERT INTO Session(token, user_id) 
							VALUES ('${token}', ${userId});`;
				logger.debug(sql);
				return db.queryAsync(sql);
			}).then(function(result) {
				logger.debug(result);
				resolve(token);
			}).catch(function(err) {
				logger.error(err.stack, err.message);
				reject(new Error(`CAN'T START SESSION FOR user_id=${userId}`));
			});
		});
	},

	sessionEnd: function(userId) {
		return connectionPromise().then(function(connection) {
			db = connection;
			var sql = `	DELETE FROM Session WHERE user_id = ${userId};`;
			logger.debug(sql);
			return db.queryAsync(sql);
		});
	},

	authorization: function(req) {
		return new Promise(function(resolve, reject) {
			if (!req.cookies['AlaskaRoomAuthToken']) {
				req.isAuthorized = false;
				reject(new Error(`REQUEST '${req.originalUrl}' IS NOT AUTHORIZED`));
			} else {
				sessionExistsByToken(req.cookies['AlaskaRoomAuthToken']).then(function() {
					req.isAuthorized = true;
					resolve();
				}).catch(function(err) {
					logger.error(err);
					reject(new Error(`REQUEST '${req.originalUrl}' IS NOT AUTHORIZED`));
				});
			}
		});
	}
}