'use strict';

const Promise = require('bluebird');
const connectionPromise = require('../components/connectionPromise.js');

module.exports = {
	// for `source` type look at  config/menu.js
	// `req` current request object
	menuGenerate: function(source, req) {
		var i = 0;
		var ind = -1;
		source.forEach(function(menuItem) {
			
			if (menuItem.hrefSecondary && req.originalUrl.includes(menuItem.hrefSecondary)) {
				ind = i;
			} else if (req.originalUrl.includes(menuItem.href)) {
				ind = i;
			}
			i++;
		});
		return {
			items: source,
			indexCurrent: ind
		};
	},
	generatePrioritySelects: function(req, opts) {
		var db = null;
		var priorities = [];
		var userPriorities = [];
		var prioritySelect = [];

		return connectionPromise().then(function(connection) {

			db = connection;
			var sql = `	SELECT * FROM v_priority`;
			//logger.debug(sql);
			return db.queryAsync(sql);

		}).then(function(result) {

			//logger.debug(result);
			priorities = result;

			if (opts.fill) {
				var sql = `	SELECT * FROM v_user_priority WHERE user_id = ${req.user_id};`;
				//logger.debug(sql);
				return db.queryAsync(sql);
			} else {
				return Promise.resolve();
			}

		}).then(function(result) {

			//logger.debug(result);
			if (opts.fill) {
				userPriorities = result;
			}

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

				if (opts.fill && !isSelected && userPriorities.length) {
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
			return Promise.resolve(prioritySelect);
		
		})
	},

	generateUniversitySelect: function(opts) {
		var db = null;
		var universitySelect = [];

		return connectionPromise().then(function(connection) {

			db = connection;

			var sql = `	
				SELECT '' id, 'Не выбран' name
				UNION
				SELECT id, name_short name FROM university;`;
			
			return db.queryAsync(sql);

		}).then(function(result) {

			for (var i = 0; i < result.length; i++) {
				universitySelect.push({
					id: result[i].id,
					name: result[i].name,
					isSelected: (result[i].id == opts.default) ? true : false 
				});
			}

			return Promise.resolve(universitySelect);

		}).catch(function(err) {

			logger.error(err.message+err.stack);

		});
	},

	generateFacultySelect: function(university_id, isDefaultOption) {
		var db = null;
		var facultySelect = [];

		return connectionPromise().then(function(connection) {

			db = connection;

			var sql = '';

			if (isDefaultOption) {
				sql += ` SELECT 0 id, 'не выбран' name 
					   	UNION\n`;
			}

			sql += `	SELECT id, name_full name FROM faculty WHERE university_id = ${university_id};`;
			
			return db.queryAsync(sql);

		}).then(function(result) {

			for (var i = 0; i < result.length; i++) {
				facultySelect.push({
					id: result[i].id,
					name: result[i].name});
			}

			return Promise.resolve(facultySelect);

		}).catch(function(err) {

			logger.error(err.message+err.stack);

		});
	}
};