'use strict'

/* HANDLERS UI CONTROLS */
function handlersRequest() {
	/*$.ajax({
		method: 'GET',
		url: '/requests/get_count_incoming',
		success: function(result) {
			if (result.status === 'ok') {
				if (result.count > 0) {
					$('#count-incoming').html('+' + result.count);
				}
			} else {
				console.log('При запросе количества входящих новых заявок произошла ошибка');
			}
		},
		error: function() {
			alert('При запросе количества входящих новых заявок произошла ошибка');
		}
	});

	$.ajax({
		method: 'GET',
		url: '/requests/get_count_accepted',
		success: function(result) {
			if (result.status === 'ok') {
				if (result.count > 0) {
					$('#count-accepted').html('+' + result.count);
				}
			} else {
				console.log('При запросе количества одобренных заявок произошла ошибка');
			}
		},
		error: function() {
			alert('При запросе количества одобренных заявок произошла ошибка');
		}
	});*/

	$('.btn-request-accept').on('click', function(e) {
		e.preventDefault();

		var parent = $(this).parent();

		$.ajax({
			method: 'POST',
			url: '/requests/accept',
			dataType: 'json',
			data: {
				requestId: $(this).parent().attr('data-request-id')
			},
			success: function(result) {
				if (result.status === 'ok') {	
					parent.find('p').remove();
					parent.find('.in-pos, .in-neg, .in-com').remove();
					parent.append($('<p class="got-number">Вы можете связаться с румейтом по телефону: ' + result.phone + '</p>'));
					parent.append($('<a class="in-pos" style="border-style: dashed;">Вы одобрили</a>'));
				} else {
					alert('При одобрении заявки произошла ошибка');
				}
			},
			error: function() {
				alert('Проверьте соединение с Интернетом');
			}
		});

	});

	$('.btn-request-decline').on('click', function(e) {
		e.preventDefault();

		var parent = $(this).parent();

		$.ajax({
			method: 'POST',
			url: '/requests/decline',
			dataType: 'json',
			data: {
				requestId: $(this).parent().attr('data-request-id')
			},
			success: function(result) {
				if (result.status === 'ok') {	
					parent.find('p').remove();
					parent.find('.in-pos, .in-neg, .in-com').remove();
					parent.append($('<a class="in-neg" style="border-style: dashed;">Вы отклонили</a>'));
				} else {
					alert('При отклонении заявки произошла ошибка');
				}
			},
			error: function() {
				alert('Проверьте соединение с Интернетом');
			}
		});

	});

	$('.btn-complain').on('click', function(e) {
		e.preventDefault();
		$('.complain-form').attr('data-complain-to-user-id', $(this).parent().attr('data-user-id'));
		$('.complain-form > select > option').each(function(index) {
			if (index === 0) {
				$(this).prop('selected', true);
			} else {
				$(this).prop('selected', false);
			}
		});
		$('.complain-form > textarea').val('');
		
		$('#btn-send-complain').off('click');
		
		$('#btn-send-complain').on('click', function(e) {
			
			e.preventDefault();
		
			if ($('#complain-comment').val().length > 500) {
				alert('Длина поля \'Комментарий\' не может превышать 500 символов');
				$('#complain-comment').focus();
				return;
			}

			$.ajax({
				method: 'POST',
				url: '/requests/complain/',
				data: {
					user_id: $(this).parent().attr('data-complain-to-user-id'),
					complain_id: processInputSelect('complain-reason'),
					complain_comment: $('#complain-comment').val()
				},
				success: function(result) {
					if (result.status === 'ok') {
						alert('Ваша жалоба принята. Нам очень важна Ваша активность. Спасибо!');
						closePopup();
					} else if (result.reason === 'NO_AVAILABLE_COMPLAINS') {
						alert('Вы отправили максимальное количество жалоб на этой неделе');
						closePopup();
					} else if (result.reason === 'COMPLAIN_IS_ALREADY_EXISTS') {
						alert('Вы уже отправляли жалобу на этого пользователя');
						closePopup();
					} else {
						alert('При подаче жалобы произошла ошибка. Наверное Вы пожаловались на сына/дочку мэра. Извините, за Вами уже выехали.');
						closePopup();
					}
				},
				error: function(error) {
					alert('Ошибка сетевого соединения');
					closePopup();
				}
			})
		});

		showPopup();

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
	handlersRequest();
});