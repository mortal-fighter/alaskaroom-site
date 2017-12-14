'use strict'

/* HANDLERS UI CONTROLS */
function handlersRequest() {
	$('.btn-request-accept').on('click', function(e) {
		e.preventDefault();

		var parent = $(this).parent();

		$.ajax({
			method: 'POST',
			url: '/request/accept',
			dataType: 'json',
			data: {
				requestId: $(this).parent().attr('data-request-id')
			},
			success: function(result) {
				if (result.status === 'ok') {	
					parent.find('p').remove();
					parent.find('.in-pos, .in-neg, .in-com').remove();
					parent.append($('<p class="got-number">Вы можете связаться с румейтом по телефону: ' + result.phone + '</p>'));
					parent.append($('<a class="in-pos">Одобрено</a>'));
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
			url: '/request/decline',
			dataType: 'json',
			data: {
				requestId: $(this).parent().attr('data-request-id')
			},
			success: function(result) {
				if (result.status === 'ok') {	
					parent.find('p').remove();
					parent.find('.in-pos, .in-neg, .in-com').remove();
					parent.append($('<a class="in-neg">Отклонено</a>'));
				} else {
					alert('При отклонении заявки произошла ошибка');
				}
			},
			error: function() {
				alert('Проверьте соединение с Интернетом');
			}
		});

	});
}

/* VALIDATION */

/* OTHER */

$(document).ready(function() {
	handlersRequest();
});