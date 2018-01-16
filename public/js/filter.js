'use strict'

/*var eventData = {
	type: null,
	countRecords: 0,
	lastForm: null
};*/
var type = null;
var countRecords = 0;
var lastForm = null;
var isMobile = false;

/* HANDLERS UI CONTROLS */
function handlersFilter() {
	/*$('.room-list, .user-list').on('click', function() {
		window.location.href='/profile/view/'+$(this).attr('data-user-id');
	});*/
	isMobile = ( $('.main-filter').css('display') === 'none' ) ? true : false;

	$('.prime-filter, .lower-filter').on('change', function() {
		search();
	});

	$('#user_university').on('change', function() {
		var universityId = processInputSelect('user_university');
		if (universityId === '0') {
			$('#user_faculty_container').hide();
			return;
		}
		
		$.ajax({
			method: 'GET',
			url: '/filter/get_faculties_by_university_id/' + universityId,
			success: function(result) {
				if (result.status === 'ok') {
					//
					var target = $('#user_faculty').html(''); // returns element itself
					for (var i = 0; i < result.faculties.length; i++) {
						target.append( $('<option value="'+result.faculties[i].id+'">'+result.faculties[i].name+'</option>') );
					}
					$('#user_faculty_container').show();
				} else {
					console.log('При загрузке факультетов для ВУЗА id="' + universityId + '" произошла ошибка');
				}
			},
			error: function(error) {
				console.log('Ошибка сетевого соединения');
			}
		})
	});

	$('.mbl-filter').on('click', function() {
		$('.listing').hide();
		$('.main-filter').show();
	});

	$('#btn-find').on('click', function(e) {
		e.preventDefault();
		if (isMobile) {
			$('.main-filter').hide();
			$('.listing').show();	
		}
		search();
	});

	$('#load-more').on('click', function(e) {
		e.preventDefault();
		loadMore();
	});

	search();
}

function search() {
	var form = {};
	form.type = type = processInputSelect('type');
	form.priorities = [];
	$('.priority').each(function() {
		var cur = processInputSelect($(this).attr('id'), true);
		if (cur) {
			form.priorities.push(cur);
		}
	});

	form.user_sex = processInputSelect('user_sex');
	form.user_age_range = processInputSelect('user_age_range');
	form.university_id = processInputSelect('user_university');
	form.faculty_id = processInputSelect('user_faculty');

	lastForm = form;

	$.ajax({
		method: 'POST',
		url: '/filter/ajax',
		dataType: 'json',
		data: form,
		success: function(result) {
			
			if (result.status === 'ok') {
				
				countRecords = result.records.length;

				var listing = $('#listing-content');
				listing.html('');
				
				if (result.records.length === 0) {
					listing.html('<div class="no-records">Поиск не дал результатов</div>');	
					$('#load-more').hide();
				} else if (result.records.length < result.recordsCountTotal ) {
					$('#load-more').show();
				} else {
					$('#load-more').hide();
				}

				for (var i = 0; i < result.records.length; i++) {
					var record = result.records[i];
					var newItem = null;
					if (type === 'find-flat') {
						newItem = $('<div class="room-list"></div>');
						newItem.append($('<img src="'+ record.flat_first_photo +'" alt="Room"/>'));
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
								.append($('<span>' + record.university_name + '</span>')));
					} else {
						newItem = $('<div class="user-list"></div>');
						newItem.append($('<img src="'+ record.user_avatar +'" alt="Room"/>'));
						newItem.append($('<h4>'+record.user_first_name+' '+record.user_last_name+'</h4>'));
						newItem
							.append($('<p>Ваш сосед: </p>')
								.append($('<span>' + record.user_sex + ', </span>'))
								.append($('<span>' + record.user_age + ', </span>'))
								.append($('<span>' + record.university_name + '</span>')));
					}
					$('<a href="/profile/view/'+record.user_id+'"></a>')
						.append(newItem)
						.appendTo(listing);
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
		url: '/filter/ajax',
		dataType: 'json',
		data: lastForm,
		success: function(result) {
			
			if (result.status === 'ok') {
				
				countRecords += result.records.length;

				if (countRecords == result.recordsCountTotal) {
					$('#load-more').hide();
				}

				var listing = $('#listing-content');

				for (var i = 0; i < result.records.length; i++) {
					var record = result.records[i];
					var newItem = null;
					if (type === 'find-flat') {
						newItem = $('<div class="room-list"></div>');
						newItem.append($('<img src="'+ record.flat_first_photo +'" alt="Room"/>'));
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
								.append($('<span>' + record.university_name + '</span>')));
					} else {
						newItem = $('<div class="user-list"></div>');
						newItem.append($('<img src="'+ record.user_avatar +'" alt="Room"/>'));
						newItem.append($('<h4>'+record.user_first_name+' '+record.user_last_name+'</h4>'));
						newItem
							.append($('<p>Ваш сосед: </p>')
								.append($('<span>' + record.user_sex + ', </span>'))
								.append($('<span>' + record.user_age + ', </span>'))
								.append($('<span>' + record.university_name + '</span>')));
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