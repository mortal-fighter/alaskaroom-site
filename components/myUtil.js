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
	generatePrioritySelects: function(req, fill) {
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

			if (fill) {
				var sql = `	SELECT * FROM v_user_priority WHERE user_id = ${req.user_id};`;
				//logger.debug(sql);
				return db.queryAsync(sql);
			} else {
				return Promise.resolve();
			}

		}).then(function(result) {

			//logger.debug(result);
			if (fill) {
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

				if (fill && !isSelected && userPriorities.length) {
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
	}
};