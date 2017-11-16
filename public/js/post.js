'use strict';

/* MESSAGE POPUP */
function closePopup() {
	$('body').removeClass('stop-scrolling');
	$('#popup-window').fadeOut(400);
}
function showPopup(message) {
	if (message) {
		$('#popup-window .popup-content').html(message);
	}
	$('body').addClass('stop-scrolling');
	$('#popup-window').height($(document).height());
	$('#popup-window').fadeIn(400);
}
function initPopup() {
	$('.popup-header, .popup-content').on('click', function(evt) {
		evt.stopPropagation();
	});
	$('#popup-window, .popup-close').on('click', function() {
		closePopup();	
	});
}

/* HANDLERS UI CONTROLS */
function handlersPostStartup() {
	$('#btn-header-find-roomate').on('click', function(e) {
		e.preventDefault();
		window.location.href='/post/create/find-roommate';
	});
	//todo: move all of this to the main.js
}
function handlersPostCreate() {
	$('#btn-find-roommate').on('click', function() {
		$('#type').val('find-roomate');
		$('.room-info, .utilities, .room-photos').fadeIn(200);

		$(this).addClass('selected');
		$('#btn-find-flat').removeClass('selected');
	});

	$('#btn-find-flat').on('click', function() {
		$('#type').val('find-flat');
		$('.room-info, .utilities, .room-photos').fadeOut(200);

		$(this).addClass('selected');
		$('#btn-find-roommate').removeClass('selected');
	});

	$('#btn-add-post').on('click', function() {
		if (validatePostCreate()) {
			
			var form = {};
			form.type = $('#type').val();
			form.rent_pay = $('#rent_pay').val();
			form.flat_total_pay = $('#flat_total_pay').val();
			form.enter_date = $('#enter_date').val();
			form.user_sex = $('#user_sex').val();
			form.user_age_range = $('#user_age_range').val();
			form.user_activity = $('#user_activity').val();
			form.user_badhabbits = $('#user_badhabbits').val();
			form.user_pets = $('#user_pets').val();
			form.user_car = $('#user_car').val();
			form.user_university = $('#user_university').val();
			form.user_success = $('#user_success').val();

			if (form.type === 'find-roommate') {
				form.description = $('#description').val();
				form.address = $('#address').val();
				form.square = $('#square').val();
				form.room_num = $('#room_num').val();
				form.traffic = $('#traffic').val();
			}

			console.log(form);

			/*$.ajax({
				method: 'POST',
				url: '/post',
				dataType: 'json',
				data: form,
				success: function(result) {
					if (result.code === 'ok') {
						_showPopup(result.message);
					} else {
						_showPopup(result.message);
					}
				},
				error: function() {
					_showPopup('Ошибка сетевого соединения. Сожалеем.');
				}
			});*/
		}
	});
}

/* VALIDATION */
function validatePostCreate() {

}


/* OTHER */
function processInputSelect(id) {
	var elems = $('#'+id+'>option')
	var result = elems.eq(0).val(); // default return first val
	
	elems.each(function() {
		if ($(this).prop('selected')) {
			result = $(this).val();
			return false; // break the loop
		}
	});
	return result;
}

$(document).ready(function() {
	initPopup();
	handlersPostStartup();
	handlersPostCreate();
});

