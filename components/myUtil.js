'use strict';

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
	}
};