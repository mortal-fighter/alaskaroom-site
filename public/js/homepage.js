'use strict';

var isMobile = (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) ? true : false;
var view = ( window.location.href.match(/\?view=(\S+)/) ) ? window.location.href.match(/\?view=(\S+)/)[1] : null ;
if (isMobile && view !== 'desktop') {
	$('body').children().remove();
	$('body').append('<p>Идет перенаправление на мобильную версию сайта...</p>');
	window.location.href = 'http://lite.alaskaroom.ru';
}


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

