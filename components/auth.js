'use strict';

const randomstring = require('randomstring');
const connectionPromise = require('../components/connectionPromise.js');
const logger = require('log4js').getLogger();

var db = null;

function sessionUserIdByToken(token) {
	return new Promise(function(resolve, reject) {
		connectionPromise().then(function(connection) {
			db = connection;
			var sql = `	SELECT user_id FROM session WHERE token = '${token}';`;
			//logger.debug(sql);
			return db.queryAsync(sql);
		}).then(function(result) {
			//logger.debug(result);
			if (result.length === 0) {
				reject(new Error(`WARN: NO SESSION FOUND FOR TOKEN '${token}'`));
			} else {
				resolve(result[0].user_id);
			}
		});
	});
}

function isSessionExistsByUserId(userId) {
	return new Promise(function(resolve, reject) {
		connectionPromise().then(function(connection) {
			db = connection;
			var sql = `	SELECT count(*) cnt FROM session WHERE user_id = ${userId};`;
			logger.debug(sql);
			return db.queryAsync(sql);
		}).then(function(result) {
			//logger.debug(result);
			if (result[0].cnt !== 1) {
				reject(new Error(`WARN: NO SESSION FOUND FOR USER '${userId}'`));
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
				var sql = `	INSERT INTO session(token, user_id) 
							VALUES ('${token}', ${userId});`;
				logger.debug(sql);
				return db.queryAsync(sql);
			}).then(function(result) {
				//logger.debug(result);
				resolve(token);
			}).catch(function(err) {
				logger.error(err.stack, err.message);
				reject(new Error(`WARN: CAN'T START SESSION FOR user_id=${userId}`));
			});
		});
	},

	sessionEnd: function(userId) {
		return connectionPromise().then(function(connection) {
			db = connection;
			var sql = `	DELETE FROM session WHERE user_id = ${userId};`;
			logger.debug(sql);
			return db.queryAsync(sql);
		});
	},

	authorization: function(req) {
		return new Promise(function(resolve, reject) {
			if (!req.cookies['AlaskaRoomAuthToken']) {
				req.isAuthorized = false;
				reject(new Error(`WARN: REQUEST '${req.originalUrl}' IS NOT AUTHORIZED`));
			} else {
				sessionUserIdByToken(req.cookies['AlaskaRoomAuthToken']).then(function(user_id) {
					req.isAuthorized = true;
					req.user_id = user_id;
					resolve();
				}).catch(function(err) {
					//logger.error(err);
					reject(err);
				});
			}
		});
	},

	isSessionExistsByUserId: isSessionExistsByUserId
}