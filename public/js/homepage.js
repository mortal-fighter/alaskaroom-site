'use strict';

function handlersHomepage() {
	$('#btn-promo1').on('click', function() {
		window.location.href='/auth/login_soc/1';
	});

	$('#btn-promo2').on('click', function() {
		window.location.href='/campus500';
	});
}

$(document).ready(function() {
	handlersHomepage();
});

