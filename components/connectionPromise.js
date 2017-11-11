'use strict';

// This for handle mysql disconnection when mysql gets no requests for a while

const config = require('../config/common.js');
const mysql = require('mysql');
const Promise = require('bluebird');

var connection = null;

var connectionPromise = function() {
	const maxAttempts = 5;

	function tryConnect(attempts, connection, resolve, reject) {
		if (attempts >= maxAttempts) {
			reject(new Error('A connection attempt has failed ' + attempts + ' times'));
			return;
		}
		
		connection.connect(function(err) {
			if (err) {
				reject(err);
				return;
			} 
			
			connection.on('error', function(err) {
				console.log('db error', err.message, err.stack);
				if (err.code === 'PROTOCOL_CONNECTION_LOST') { 
					tryConnect(attempts+1, connection, resolve, reject);                         
				} else {                                  
					throw err;                           
				}
			});

			resolve(Promise.promisifyAll(connection));
		});
	}

	return new Promise(function(resolve, reject) {
		if (connection && connection.state === 'authenticated') {
			resolve(connection);
			return;
		}

		try {
			connection = mysql.createConnection({
				host: config.database.host,
				user: config.database.user,
				password: config.database.password,
				database: config.database.database
			});
		} catch(e) {
			reject(new Error('can\'t create db connection'));
			return;
		}
		tryConnect(0, connection, resolve, reject);
	});	
}

module.exports = connectionPromise;