'use strict';

var countRecords = 0;
var lastForm = null;
var isMobile = false;

function campus500handlers() {
	isMobile = ( $('.main-filter').css('display') === 'none' ) ? true : false;

	$('.load-more').on('click', function(e) {
		e.preventDefault();
		loadMore();
	});

	$('#campus-option').on('change', function() {
		search();
	});

	if ( $('#isAuthorized').val() === '1' ) {
		search();
	}

	$('.cpm-filter').on('click', function() {
		$('.listing, .kampus-rules').hide();
		$('.main-filter').show();
	});

	$('.find-filter').on('click', function(e) {
		e.preventDefault();
		if (isMobile) {
			$('.main-filter').hide();
			$('.listing, .kampus-rules').show();
			$(window).scrollTop( $('#listing-content').offset().top );;	
		}
		search();
	});
}

function search() {
	var form = {};
	form.campus = processInputSelect('campus-option');

	lastForm = form;

	$.ajax({
		method: 'POST',
		url: '/campus500/search',
		dataType: 'json',
		data: form,
		success: function(result) {
			
			if (result.status === 'ok') {
				
				var formattedRecords = [];
				
				result.users.forEach(function(user) {
					formattedRecords.push({
						id: user.id,
						first_name: user.first_name,
						last_name: user.last_name,
						avatar: user.avatar,
						campusOptions: []
					});
					
					for (var i = 0; i < result.campusOptions.length; i++) {	
						if (user.id === result.campusOptions[i].user_id) {
							formattedRecords[formattedRecords.length - 1].campusOptions.push({
								name: result.campusOptions[i].name,
								icon: result.campusOptions[i].icon
							});
						}
					}
				});

				//console.log('formattedRecords=', formattedRecords);

				countRecords = formattedRecords.length;

				var listing = $('#listing-content');
				listing.html('');
				
				//console.log('result.usersCountTotal=', result.usersCountTotal);

				if (result.users.length === 0) {
					listing.html('<div class="no-records">Поиск не дал результатов. Пожалуйста, зайдите попозже, мы найдем лучшего кандидата на эту роль.</div>');	
					$('.load-more').hide();
				} else if (formattedRecords.length < result.usersCountTotal ) {
					$('.load-more').show();
				} else {
					$('.load-more').hide();
				}
				
				for (var i = 0; i < formattedRecords.length; i++) {
					var user = formattedRecords[i];
					var newItem = null;
					
					newItem = $('<div class="user-list"></div>');
					newItem.append($('<img src="'+ user.avatar +'" alt="User"/>'));
					newItem.append($('<h4>'+ user.first_name + '</h4>'));

					var helpBox = $('<div class="help-box"></div>');
					user.campusOptions.forEach(function(option) {
						helpBox.append('<img src="' + option.icon + '" alt="' + option.name + '" title="' + option.name + '" />');
					});
					newItem.append(helpBox);	

					$('<a href="/profile/view/'+user.id+'" title="Перейти на страницу пользователя ' + user.first_name + '"></a>')
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
		url: '/campus500/search',
		dataType: 'json',
		data: lastForm,
		success: function(result) {
			
			if (result.status === 'ok') {
				
				var formattedRecords = [];
				
				result.users.forEach(function(user) {
					formattedRecords.push({
						id: user.id,
						first_name: user.first_name,
						last_name: user.last_name,
						avatar: user.avatar,
						campusOptions: []
					});
					
					for (var i = 0; i < result.campusOptions.length; i++) {	
						if (user.id === result.campusOptions[i].user_id) {
							formattedRecords[formattedRecords.length - 1].campusOptions.push({
								name: result.campusOptions[i].name,
								icon: result.campusOptions[i].icon
							});
						}
					}
				});

				countRecords += formattedRecords.length;

				if (countRecords == result.usersCountTotal) {
					$('.load-more').hide();
				}

				var listing = $('#listing-content');

				for (var i = 0; i < formattedRecords.length; i++) {
					var user = formattedRecords[i];
					var newItem = null;
					
					newItem = $('<div class="user-list"></div>');
					newItem.append($('<img src="'+ user.avatar +'" alt="User"/>'));
					newItem.append($('<h4>'+ user.first_name + '</h4>'));

					var helpBox = $('<div class="help-box"></div>');
					user.campusOptions.forEach(function(option) {
						helpBox.append('<img src="' + option.icon + '" alt="' + option.name + '" title="' + option.name + '" />');
					});
					newItem.append(helpBox);	

					$('<a href="/profile/view/'+user.id+'" title="Перейти на страницу пользователя ' + user.first_name + '"></a>')
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
	campus500handlers();
});