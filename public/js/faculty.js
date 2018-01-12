'use strict'

var countRecords = 0;
let type = 'university';
var lastForm = {
	type: type
};


/* HANDLERS UI CONTROLS */
function handlersFaculty() {
	$('a.load-nav').on('click', function() {
		// clear current, set current menu item
		$('a.load-nav').removeClass('current');
		$(this).addClass('current');

		//save type
		type = $(this).attr('type');	

		load();
	});

	$('#load-more').on('click', function(e) {
		e.preventDefault();
		loadMore();
	});

	// start from here
	load();
}

function load() {

	var form = {
		type: type
	};
	lastForm = form;

	$.ajax({
		method: 'POST',
		url: '/faculty/ajax_get_people_by_type',
		dataType: 'json',
		data: form,
		success: function(result) {
			
			if (result.status === 'ok') {
				
				countRecords = result.records.length;

				var content = $('#content');
				content.html('');
				
				if (result.records.length === 0) {
					content.html('<div class="no-records">Никого не найдено</div>');
					$('#load-more').hide();
				} else if (result.records.length < result.recordsCountTotal) {
					content.html('');
					$('#load-more').show();
				} else {
					content.html('');
					$('#load-more').hide();
				}

				for (var i = 0; i < result.records.length; i++) {
					var record = result.records[i];
					var newItem = null;
					newItem = $('<div class="user-small"></div>');
					newItem.append($('<img src="'+ record.user_avatar +'" alt="Room"/>'));
					newItem.append($('<h4>' + record.user_first_name + ' ' + record.user_last_name + '</h4>'));
					newItem.append($('<p>' + record.user_sex.substr(0, 1).toUpperCase() + ', ' + record.user_age + ', ' +  record.university_name + '</p>'));
					$('<a href="/profile/view/'+record.user_id+'"></a>')
						.append(newItem)
						.appendTo(content);
				}
			} else {
				alert('При загрузке данных произошла ошибка');
			}
		},
		error: function() {
			alert('Проверьте соединение с Интернетом');
		}
	});
}

function loadMore() {
	
	lastForm.offset = countRecords;

	$.ajax({
		method: 'POST',
		url: '/faculty/ajax_get_people_by_type',
		dataType: 'json',
		data: lastForm,
		success: function(result) {
			
			if (result.status === 'ok') {
				
				countRecords += result.records.length;

				if (countRecords === result.recordsCountTotal) {
					$('#load-more').hide();
				}

				var content = $('#content');

				for (var i = 0; i < result.records.length; i++) {
					var record = result.records[i];
					var newItem = null;
					newItem = $('<div class="user-small"></div>');
					newItem.append($('<img src="'+ record.user_avatar +'" alt="Room"/>'));
					newItem.append($('<h4>' + record.user_first_name + ' ' + record.user_last_name + '</h4>'));
					newItem.append($('<p>' + record.user_sex.substr(0, 1).toUpperCase() + ', ' + record.user_age + ', ' +  record.university_name + '</p>'));
					$('<a href="/profile/view/'+record.user_id+'"></a>')
						.append(newItem)
						.appendTo(content);
				}
			} else {
				alert('При загрузке данных произошла ошибка');
			}
		},
		error: function() {
			alert('Проверьте соединение с Интернетом');
		}
	});
}

/* VALIDATION */

/* OTHER */

$(document).ready(function() {
	handlersFaculty();
});