'use strict';

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
						alert('success', 'Новое объявление с идентификатором ' + result.id + ' было успешно создано');
					} else {
						alert('error', 'Возникла ошибка при создании объявления');
					}
				},
				error: function() {
					alert('error', 'Ошибка соединения с сервером. Пожалуйста, оставайтесь на местах и повторите запрос позже!');
				}
			});
		}
	});
}

/* VALIDATION */
function validatePostCreate() {
	if ($('#type').val() === 'find-roommate') {
		var description = $('#description');
		if (description.val().length > 200) {
			description.focus();
			alert('Длина поля "Описание квартиры" превышает допустимый размер');
			return false;
		}
		if (description.val() === '' || description.val() === ' ') {
			description.focus();
			alert('Поле "Описание квартиры" не может быть пустым');
			return false;
		}

		var address = $('#address');
		if (address.val() === '' || address.val() === ' ') {
			address.focus();
			alert('Поле "Адрес" не может быть пустым');
			return false;
		}
		if (address.val().length > 200) {
			address.focus();
			alert('Длина поля "Адрес" превышает допустимый размер');
			return false;
		}

		var square = $('#square');
		if (square.val() === '' || square.val() === ' ') {
			square.focus();
			alert('Поле "Площадь" не может быть пустым');
			return false;
		}
		if (square.val().length > 50) {
			square.focus();
			alert('Длина поля "Площадь" превышает допустимый размер');
			return false;
		}

		var room_num = $('#room_num');
		if (room_num.val() === '' || room_num.val() === ' ') {
			room_num.focus();
			alert('Поле "Кол-во комнат" не может быть пустым');
			return false;
		}
		if (!room_num.val().match(/^\d+$/)) {
			room_num.focus();
			alert('Поле "Кол-во комнат" должно быть числом');
			return false;
		}
		
		var traffic = $('#traffic');
		if (traffic.val() && traffic.val().length > 300) {
			traffic.focus();
			alert('Длина поля "Общественный транспорт" превышает допустимый размер');
			return false;	
		} 
	}

	var rent_pay = $('#rent_pay');
	if (rent_pay.val() === '' || rent_pay.val() === ' ') {
		rent_pay.focus();
		alert('Поле "Плата румейта" не может быть пустым');
		return false;
	}
	if (!rent_pay.val().match(/^\d+$/)) {
		rent_pay.focus();
		alert('Поле "Плата румейта" должно быть числом');
		return false;
	}

	var flat_total_pay = $('#flat_total_pay');
	if (flat_total_pay.val() === '' || flat_total_pay.val() === ' ') {
		flat_total_pay.focus();
		alert('Поле "Общая аренда" не может быть пустым');
		return false;
	}
	if (!flat_total_pay.val().match(/^\d+$/)) {
		flat_total_pay.focus();
		alert('Поле "Общая аренда" должно быть числом');
		return false;
	}

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

