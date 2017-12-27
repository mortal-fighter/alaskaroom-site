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

function handlersHomepage() {
	$('#btn-invite').on('click', function() { 
		var userName = $('#user_name').val();
		var userEmail = $('#user_email').val();

		if (userName.match(/$\s*^/)) {
			alert('Поле \'Имя\' не может быть пустым.');
			$('#user_name').focus();
			return;
		}

		if (!userEmail.match(/^([a-z0-9_-]+\.)*[a-z0-9_-]+@[a-z0-9_-]+(\.[a-z0-9_-]+)*\.[a-z]{2,6}$/)) {
			alert('Поле \'e-mail\' заполнено неправильно.');
			$('#user_email').focus();
			return;	
		}

		$.ajax({
			method: 'POST',
			url: '/api/sendinvite',
			dataType: 'json',
			data: {
				userName: userName,
				userEmail: userEmail
			},
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
		});

	});

	$('#btn-enter-site, #enter-site-2').on('click', function() {
		window.location.href='/auth/login_soc';
	});

}

$(document).ready(function() {
	//_initPopup();
	handlersHomepage();
});

