'use strict'

/* HANDLERS UI CONTROLS */
function handlersFilter() {
	/*$('.room-list, .user-list').on('click', function() {
		window.location.href='/profile/view/'+$(this).attr('data-user-id');
	});*/

	$('.prime-filter, .lower-filter').on('change', function() {
		search();
	});

	$('#btn-find').on('click', function(e) {
		e.preventDefault();
		search();
	});
}

function search() {
	var form = {};
	var type;
	form.type = type = processInputSelect('type');
	form.priorities = [];
	$('.priority').each(function() {
		var cur = processInputSelect($(this).attr('id'), true);
		if (cur) {
			form.priorities.push(cur);
		}
	});

	$.ajax({
		method: 'POST',
		url: '/filter/ajax',
		dataType: 'json',
		data: form,
		success: function(result) {
			if (result.status === 'ok') {
				var listing = $('#listing-content');
				listing.html('');
				for (var i = 0; i < result.records.length; i++) {
					var record = result.records[i];
					var newItem = null;
					if (type === 'find-flat') {
						newItem = $('<div class="room-list"></div>');
						newItem.append($('<img src="'+ record.photo_src_small +'" alt="Room"/>'));
						newItem
							.append($('<h5>' + record.flat_rent_pay + '</h5>')
								.append($('<span> рублей</span>')));
						newItem
							.append($('<h4></h4>')
								.append($('<span>' + record.user_city + '</span>'))
								.append($('<span>, ' + record.flat_address + '</span>')));
						newItem
							.append($('<p>Сосед: </p>')
								.append($('<span>' + record.user_sex + ', </span>'))
								.append($('<span>' + record.user_age + ', </span>'))
								.append($('<span>' + record.user_university + '</span>')));
					} else {
						newItem = $('<div class="user-list"></div>');
						newItem.append($('<img src="'+ record.user_avatar +'" alt="Room"/>'));
						newItem.append($('<h4>'+record.user_first_name+' '+record.user_last_name+'</h4>'));
						newItem
							.append($('<p>Ваш сосед: </p>')
								.append($('<span>' + record.user_sex + ', </span>'))
								.append($('<span>' + record.user_age + ', </span>'))
								.append($('<span>' + record.user_university + '</span>')));
					}
					newItem.appendTo(listing);
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
function processInputSelect(id, isSkipDefault) {
	var elems = $('#'+id+'>option')
	var result;

	if (isSkipDefault) {
		result = null;
	} else {
		result = elems.eq(0).val(); // default return first val
	}
	
	elems.each(function(index) {
		if ($(this).prop('selected') && !(isSkipDefault && index === 0)) {
			result = $(this).val();
			return false; // break the loop
		}
	});
	return result;
}

$(document).ready(function() {
	handlersFilter();
});