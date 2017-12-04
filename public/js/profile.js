'use strict';

/* HANDLERS UI CONTROLS */
function handlersProfileView() {

	$('#btn-edit-user-info').on('click', function(e) { 
		e.preventDefault();
		window.location.href='/profile/edit_user/' + $('#user_id').val();
	});

	$('#btn-showflat').on('click', function(e) { 
		e.preventDefault();
		opencloseFlatInfo();
	});

	$('#btn-showhide-flat').on('click', function() {
		opencloseFlatInfo();
	});
}

/* VALIDATION */

/* OTHER */

$(document).ready(function() {
	handlersProfileView();
});

