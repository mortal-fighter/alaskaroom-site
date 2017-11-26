'use strict';

const Promise = require('Bluebird');
const connectionPromise = require('../../components/connectionPromise.js');
const fetch = require('isomorphic-fetch');


function getUserInfo() {
	var db = null;
	connectionPromise().then(function(connection) {
		db = connection;
		return fetch('https://oauth.vk.com/', access_token?client_id=6254823&redirect_uri=http://alaskaroom.ru/vk.php&client_secret=MtvKylS2ZR9A5QpDbMmG&code=', {method: 'get'}, {
		});
	}).then(function(result) {
		if (!result.ok) {
			throw new Error('fetch failed')
		}
		return result.text();
	}).then(function(html) {
		console.log(html);
	}).catch(function(err) {
		console.error(err);
	});
}

getUserInfo();