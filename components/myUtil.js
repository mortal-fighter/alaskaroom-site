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
	},

	// params: dictionaryTableName, table2Name, orderByColumn, table2_id (optional)
	generateCheckbox: function(p) {

		var db = null;
		var sql = null;
		var dictionary = [];
		var intersection = [];
		var resultObject = [];

		return connectionPromise().then(function(connection) {

			db = connection;

			sql = ` SELECT * FROM ${p.dictionaryTableName} ORDER BY ${p.orderByColumn};`;
			//console.log(sql);
			return db.queryAsync(sql);
		
		}).then(function(result) {

			//console.log(result);
			dictionary = result;

			if (p.table2_id) {
				sql = ` SELECT ${p.dictionaryTableName}_id
						FROM ${p.table2Name}_${p.dictionaryTableName}
						WHERE ${p.table2Name}_id = ${p.table2_id};`; 
				//console.log(sql);
				return db.queryAsync(sql);
			} else {
				return Promise.resolve([]);
			}
		
		}).then(function(result) {

			//console.log(result);
			intersection = result;

			var isChecked = false;
			dictionary.forEach(function(item) {
				
				var one = {};
				for (var key in item) {
					if (item.hasOwnProperty(key)) {
						one[key] = item[key];
					}
				}

				if (p.table2_id) {
					isChecked = false;
					for (var i = 0; i < intersection.length; i++) {
						if (intersection[i][p.dictionaryTableName + '_id'] === item.id) {
							isChecked = true;
							break;
						}
					}
				} 
				one.isChecked = isChecked;
				
				resultObject.push(one);

			});

			return resultObject;
		});
	},

	formatObjectForSQL: function(object) {
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

			//1. surround all, except 'NULL', with single quotes, preparing it for sql query
			//2. escape single quote inside text
			if (object[key] !== 'NULL') {
				object[key] = '\'' + object[key].replace(/\'/g, '\\\'') + '\'';
			}
		
		}
	}
}
};