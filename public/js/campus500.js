'use strict';

var countRecords = 0;
var lastForm = null;

function campus500handlers() {
	$('#load-more').on('click', function(e) {
		e.preventDefault();
		loadMore();
	});

	search();
}

function search() {
	var form = {};
	form.campus = processInputSelect('campus-option');

	lastForm = form;

	$.ajax({
		method: 'POST',
		url: '/campus500/search',
		dataType: 'json',
		data: form,
		success: function(result) {
			
			if (result.status === 'ok') {
				
				countRecords = result.records.length;

				var listing = $('#listing-content');
				listing.html('');
				
				if (result.records.length === 0) {
					listing.html('<div class="no-records">Поиск не дал результатов</div>');	
					$('#load-more').hide();
				} else if (result.records.length < result.recordsCountTotal ) {
					$('#load-more').show();
				} else {
					$('#load-more').hide();
				}

				for (var i = 0; i < result.records.length; i++) {
					var record = result.records[i];
					var newItem = null;
					
					newItem = $('<div class="user-list"></div>');
					newItem.append($('<img src="'+ record.user_avatar +'" alt="User"/>'));
					
					var helpBox = $('<div class="help-box"></div>');
					result.records.services.forEach(function(service) {
						helpBox.append('<img src="' + service.icon + '", alt="' + service.name + '"');
					});
					newItem.append(helpBox);	

					$('<a href="/profile/view/'+record.user_id+'"></a>')
						.append(newItem)
						.appendTo(listing);
				}
			} else {
				alert('При загрузке данных произошла ошибка');
			}
		},
		error: function() {
			alert('Проверьте соединение с Интернетом');
		}
	});
}

function loadMore() {

}

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
	campus500handlers();
});