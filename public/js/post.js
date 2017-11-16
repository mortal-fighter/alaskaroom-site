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
		$('#type').val('find-roommate');
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
			form.user_sex = processInputSelect('user_sex');
			form.user_age_range = processInputSelect('user_age_range');
			form.user_activity = processInputSelect('user_activity');
			form.user_badhabbits = processInputSelect('user_badhabbits');
			form.user_pets = processInputSelect('user_pets');
			form.user_car = processInputSelect('user_car');
			form.user_university = processInputSelect('user_university');
			form.user_success = processInputSelect('user_success');

			if (form.type === 'find-roommate') {
				form.description = $('#description').val();
				form.address = $('#address').val();
				form.square = $('#square').val();
				form.room_num = $('#room_num').val();
				form.traffic = $('#traffic').val();

				form.util_conditioner = $('#util_conditioner').prop('checked');
				form.util_coffee = $('#util_coffee').prop('checked');
				form.util_parking = $('#util_parking').prop('checked');
				form.util_microwave = $('#util_microwave').prop('checked');
				form.util_internet = $('#util_internet').prop('checked');
			}

			console.log(form);

			$.ajax({
				method: 'POST',
				url: '/post',
				dataType: 'json',
				data: form,
				success: function(result) {
					if (result.status === 'ok') {
						alert('ok: ' + result.message);
					} else {
						alert('not ok: ' + result.message);
					}
				},
				error: function() {
					alert('Ошибка сетевого соединения. Сожалеем.');
				}
			});
		}
	});
}

/* VALIDATION */
function validatePostCreate() {
	return true;
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

