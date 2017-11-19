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

/* MESSAGE POPUP */
function closePopup() {
	$('body').removeClass('stop-scrolling');
	$('#popup-window').fadeOut(400);
	$('#popup-window .popup-header').css('background-color', '#fff'); // reset color
	_resetPopupHeightPosition();
}
function showPopup(type, message) {
	if (!type) {
		type = 'info';
	}

	if (message) {
		$('#popup-window .popup-content').html(message);
	}

	$('body').addClass('stop-scrolling');
	$('#popup-window').height($(document).height());
	
	switch (type) {
		case 'info':
			$('#popup-window .popup-header').css('background-color', '#0a5c82');
			break;
		case 'error':
			$('#popup-window .popup-header').css('background-color', 'lightcoral');
			break;
		case 'success':
			$('#popup-window .popup-header').css('background-color', 'lightgreen');
			break;
	}

	_setPopupHeightPosition();

	$('#popup-window').fadeIn(400);
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
	const delta = $('body').height() - $('#popup-window .popup-container').height();
	if (delta > 150) {
		// case 1: short window, set standard top and bottom margins
		$('#popup-window .popup-container').css('marginTop', '100px').css('marginBottom', '50px');
	} else if (delta < 150 && delta > 0) {
		// case 2: transitional case, vertical margins is set to delta / 2
		$('#popup-window .popup-container').css('marginTop', (delta / 2) + 'px').css('marginBottom', (delta / 2) + 'px');
	} else {
		// case 3: larger window, set little top and bottom margins and reduce .popup-content's size
		const margins = 100;
		const heightHeader = 30;
		const paddings = 40;
		$('#popup-window .popup-container').css('marginTop', '50px').css('marginBottom', '50px');
		$('#popup-window .popup-content').height($('body').height() - margins - heightHeader - paddings);
	}
}
function _resetPopupHeightPosition() {
	$('.popup-container, .popup-content').removeAttr('style');
}

/* AUTH POPUP */
function initAuthPopup() {
	$('#btn-close-auth').on('click', function(e) {
		e.preventDefault();
		closeAuthPopup();
	});
	$('#btn-enter-site').on('click', function(e) {
		e.preventDefault();
		window.location.href='/post';
	})
}
function showAuthPopup() {
	$('.auth-popup').fadeIn(200);
}
function closeAuthPopup() {
	$('.auth-popup').fadeOut(200);
}

$(document).ready(function() {
	initAuthPopup();
	initPopup();
	handlersHeader();
});