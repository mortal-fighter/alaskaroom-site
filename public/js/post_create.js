'use strict';
function _closePopup() {
	$('body').removeClass('stop-scrolling');
	$('#popup-window').fadeOut(400);
}

function _showPopup(message) {
	if (message) {
		$('#popup-window .popup-content').html(message);
	}
	$('body').addClass('stop-scrolling');
	$('#popup-window').height($(document).height());
	$('#popup-window').fadeIn(400);
}

function _initPopup() {
	$('.popup-header, .popup-content').on('click', function(evt) {
		evt.stopPropagation();
	});
	$('#popup-window, .popup-close').on('click', function() {
		_closePopup();	
	});
}

function attachHandlers() {
	/*$('#btn-gallery').on('click', function() { window.location.href='/photos' });
	$('#btn-about').on('click', function() { window.location.href='/about' });
	$('#btn-schedule').on('click', function() { window.location.href='/schedule' });*/
	
	$('#add-ad').on('click', function() { 
		/*
		${req.body.user_sex},
		${req.body.user_age_range},
		${req.body.user_activity},
		${req.body.user_badhabbits},
		${req.body.user_university},
		${req.body.user_pets},
		${req.body.user_car},
		${req.body.user_success},
		${req.body.enter_date},
		${req.body.rent_pay},
		*/
		var address = $('#address').val();
		var square = $('#square').val();
		var room_num = $('#room_num').val();
		var traffic = $('#traffic').val();

		var rent_pay = $('#rent_pay').val();
		var flat_total_pay = $('#flat_total_pay').val();
		var enter_date = $('#enter_date').val();

		var user_sex = $('#user_sex').val();
		var user_age_range = $('#user_age_range').val();
		var user_activity = $('#user_activity').val();
		var user_badhabbits = $('#user_badhabbits').val();
		var user_university = $('#user_university').val();
		var user_pets = $('#user_pets').val();
		var user_car = $('#user_car').val();
		var user_success = $('#user_success').val();
		
		$.ajax({
			method: 'POST',
			url: '/post',
			dataType: 'json',
			data: {
				address: address,
				square: square,
				room_num: room_num,
				traffic: traffic,
				rent_pay: rent_pay,
				flat_total_pay: flat_total_pay,
				enter_date: enter_date,
				user_sex: user_sex,
				user_age_range: user_age_range,
				user_activity: user_activity,
				user_badhabbits: user_badhabbits,
				user_university: user_university,
				user_pets: user_pets,
				user_car: user_car,
				user_success: user_success,
			},
			success: function(result) {
				if (result.status === 'ok') {
					_showPopup(result.message);
				} else {
					_showPopup(result.message);
				}
			},
			error: function() {
				_showPopup('Ошибка сетевого соединения. Сожалеем.');
			}
		});

	});

}

$(document).ready(function() {
	_initPopup();
	attachHandlers();
});

