function handlersHeader() {
	$('#btn-header-find-roomate').on('click', function(e) {
		e.preventDefault();
		window.location.href='/post/create/roommate';
	});
	$('#btn-header-login').on('click', function(e) {
		e.preventDefault();
		showAuthPopup();
	});
}

/* message */
function newMessage(message) {
	var newElem = $('<div class="top-message"></div>')
		.append('<div class="content">' + message + '</div>')
		.append( $('<a class="close">x</a>').on('click', function(e) {
			e.preventDefault();
			$(this).parent().fadeOut(200);
		}) )
		.prependTo($('.wrp'))
		.fadeIn(200);

}
function showAllMessages() {
	$('.top-message > .close').on('click', function(e) {
		e.preventDefault();
		$(this).parent().fadeOut(200);
	});
	$('.top-message').fadeIn(200);
}

/* POPUP */
function closePopup() {
	$('body').removeClass('stop-scrolling');
	$('#popup-window').fadeOut(200);
	_resetPopupHeightPosition();
}
function showPopup(message, type) {
	if (!type) {
		type = 'info';
	}

	if (message) {
		$('#popup-window .popup-content').html(message);
	} else {
		//$('#popup-window .popup-content').html('');
	}

	$('body').addClass('stop-scrolling');
	$('#popup-window').height($(document).height());
	
	switch (type) {
		case 'info':
			$('#popup-window .popup-header').css('background-color', '#0a5c82');
			break;
		case 'error':
			$('#popup-window .popup-header').css('background-color', '#f34040');
			break;
		case 'success':
			$('#popup-window .popup-header').css('background-color', '#1cbd4d');
			break;
	}

	_setPopupHeightPosition();

	$('#popup-window').fadeIn(200);
}
function initPopup() {
	$('#popup-window .popup-header, #popup-window .popup-content').on('click', function(evt) {
		evt.stopPropagation();
	});
	$('#popup-window, .popup-close').on('click', function() {
		closePopup();	
	});
}
function _setPopupHeightPosition() {
	// set appropriate height and position to popup
	var delta = $('body').height() - $('#popup-window .popup-container').height();
	if (delta > 150) {
		// case 1: short window, set standard top and bottom margins
		$('#popup-window .popup-container').css('marginTop', '100px').css('marginBottom', '50px');
	} else if (delta < 150 && delta > 0) {
		// case 2: transitional case, vertical margins is set to delta / 2
		$('#popup-window .popup-container').css('marginTop', (delta / 2) + 'px').css('marginBottom', (delta / 2) + 'px');
	} else {
		// case 3: larger window, set little top and bottom margins and reduce .popup-content's size
		var margins = 100;
		var heightHeader = 30;
		var paddings = 40;
		$('#popup-window .popup-container').css('marginTop', '50px').css('marginBottom', '50px');
		$('#popup-window .popup-content').height($('body').height() - margins - heightHeader - paddings);
	}
}
function _resetPopupHeightPosition() {
	$('.popup-container, .popup-content').removeAttr('style');
}

function indicatorNewRequests() {
	function inner() {
		//console.log('window.location.href=', window.location.href);
		if (window.location.href.match(/alaskaroom\.ru\/?$/) || window.location.href.match(/localhost\/?$/) ) {
			if (interval1) clearInterval(interval1);
			return;
		} 
		
		$.ajax({
			method: 'post',
			url: '/requests/has_new_requests',
			success: function(result) {
				if (result.status === 'ok') {
					if (result.countIncoming > 0 || result.countAccepted > 0) {
						$('#indicatorNewRequests').show();
					} else {
						$('#indicatorNewRequests').hide();
					}
				} else {
					console.log('indicatorNewRequests: Не удалось получить данные о новых заявках');
				}
			},
			error: function(error) {
				console.log('indicatorNewRequests: Ошибка сетевого соединения');
			}
		});
	}

	inner();
	var interval1 = setInterval(function() {
		inner();
	}, 1000 * 60);
}

$(document).ready(function() {
	initPopup();
	handlersHeader();
	indicatorNewRequests();

	if (window.location.href.match(/^(http|https):\/\/(localhost|127\.0\.0\.1)/)) {
		$('a.logo').text( $('a.logo').text() + ' (local)' );
	}
});