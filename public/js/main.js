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
	handlersHeader();
});