'use strict';

$(document).ready(function() {
	$('#get-roommate').on('click', function() {
		window.location.href = 'http://alaskaroom.ru/auth/login_soc/2';
	});

	$('#get-room').on('click', function() {
		window.location.href = 'http://alaskaroom.ru/auth/login_soc/1';
	});

	$('#get-kampus').on('click', function() {
		window.location.href = 'http://alaskaroom.ru/auth/login_soc/3';
	});
});