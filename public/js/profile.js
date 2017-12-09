'use strict';

var hasFlat = false;

/* HANDLERS UI CONTROLS */
function handlersProfileView() {

	$('#btn-edit-user-info').on('click', function(e) { 
		e.preventDefault();
		window.location.href='/profile/edit/' + $('#user_id').val();
	});

	$('#btn-showflat').on('click', function(e) { 
		e.preventDefault();
		opencloseFlatInfo();
	});

	$('#btn-showhide-flat').on('click', function() {
		opencloseFlatInfo();
	});
}

function handlersProfileEdit() {

	$('#user_birth_date').datepicker({
		dayNames: [ "Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота" ],
		dayNamesShort: [ "Вос", "Пон", "Вто", "Сре", "Чет", "Пят", "Суб" ],
		dayNamesMin: [ "Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб" ],
		monthNames: [ "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь" ],
		monthNamesShort: [ "Янв", "Фев", "Мар", "Апр", "Май", "Инь", "Иль", "Авг", "Сен", "Окт", "Ноя", "Дек" ],
		dateFormat: "dd.mm.yy",
		changeYear: true,
		changeMonth: true,
		yearRange: "1980:2013"
	});

	$("#user_phone").mask("+7(999)-999-99-99");

	$('#btn-showflat').on('click', function(e) { 
		e.preventDefault();
		$('.room-info').fadeIn(200);
		$('#flat_enter_date').datepicker({
			dayNames: [ "Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота" ],
			dayNamesShort: [ "Вос", "Пон", "Вто", "Сре", "Чет", "Пят", "Суб" ],
			dayNamesMin: [ "Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб" ],
			monthNames: [ "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь" ],
			monthNamesShort: [ "Янв", "Фев", "Мар", "Апр", "Май", "Инь", "Иль", "Авг", "Сен", "Окт", "Ноя", "Дек" ],
			dateFormat: "dd.mm.yy"
		});
		hasFlat = true;
	});

	$('#btn-saveall').on('click', function(e) {
		e.preventDefault();
		
		if (validateUserInfo()) {
		
			var form = {user: {}};
			form.user.id = $('#user_id').val();
			form.user.about = $('#user_about').val();
			form.user.first_name = $('#user_first_name').val();
			form.user.last_name = $('#user_last_name').val();
			form.user.sex = processInputSelect('user_sex');
			form.user.birth_date = $('#user_birth_date').val();
			form.user.phone = $('#user_phone').val();
			form.user.email = $('#user_email').val();
			form.user.city = $('#user_city').val();
			form.user.university = $('#user_university').val();
			form.user.faculty = $('#user_faculty').val();
			form.user.speciality = $('#user_speciality').val();
			form.user.study_year = $('#user_study_year').val();
			//form.user.wish_pay = $('#user_study_year').val();
			form.priority = [];
			$('.option-set').each(function() {
				form.priority.push(processInputSelect(this.id));
			});

			var validationFailed = false;

			if (hasFlat) {
				if (!validateFlat()) {
					validationFailed = true;
					return;
				}

				form.flat = {};
				form.flat.id = $('#flat_id').val();
				form.flat.description = $('#flat_description').val();
				form.flat.address = $('#flat_address').val();
				form.flat.square = $('#flat_square').val();
				form.flat.room_num = $('#flat_room_num').val();
				form.flat.traffic = $('#flat_traffic').val();
				form.flat.total_pay = $('#flat_total_pay').val();
				form.flat.rent_pay = $('#flat_rent_pay').val();
				form.flat.enter_date = $('#flat_enter_date').val();
			}

			if (!validationFailed) {
				$.ajax({
					method: 'POST',
					url: '/profile/edit',
					dataType: 'json',
					data: form,
					success: function(result) {
						if (result.status === 'ok') {
							alert('Информация сохранена');
						} else {
							alert('При загрузке данных произошла ошибка');
						}
					},
					error: function() {
						alert('Проверьте соединение с Интернетом');
					}
				});
			}
		}
	});

	$('#user_avatar_1').on('click', function() { $('#user_avatar_2').click(); });

	$('#user_avatar_2').on('change', function() {
		
		if (!this.files[0]) {
			return;
		}

		if (this.files[0].size > 10485760 / 2) {
			alert('Размер загружаемой фотографии не должен превышать 5 мб');
			return;
		};

		var formData = new FormData();
		formData.append('upload', this.files[0], this.files[0].name);
		formData.append('user_id', $('#user_id').val());

		$.ajax({
			url: '/profile/upload_avatar',
			type: 'POST',
			data: formData,
			processData: false,
			contentType: false,
			success: function(result) {
				switch (result.status) {
					case 'ok': 
						$('#user_avatar_1').attr('src', result.user_avatar);
						break;
					case 'not ok':
						alert('Произошла ошибка при загрузке фотографии');
						break; 
				}
			},
			error: function() {
				console.log('Ошибка интернет-соединения');
			}
		});
	});

	$('#btn-photo-add').on('click', function() {
		$('#files').click();
	});

	$('#files').on('change', function() {
		var files = $('#files').get(0).files;

		if (files.length === 0) {
			return;
		}
		if (files.length > 1) {
			alert('Можно загружать не более 1 фото за раз');
			return;
		}

		var filesFiltered = [];
		var filesRejected = [];

		for (var i = 0; i < files.length; i++) {
			if (files[i].size <= 10485760 / 2 ) { // 10 / 2 = 5 mb
				filesFiltered.push(files[i]);
			} else {
				alert('Фото \'' + files[i].name + '\' превышает допустимый размер в 5 мб');
				filesRejected.push(files[i]);
			}
		}
		var formData = new FormData();
		for (var i = 0; i < filesFiltered.length; i++) {
			formData.append('uploads', filesFiltered[i], filesFiltered[i].name);
		}

		$.ajax({
			url: '/profile/upload_photos',
			type: 'POST',
			data: formData,
			processData: false,
			contentType: false,
			success: function(result) {
				switch (result.status) {
					case 'ok': 
						var elems = [];
						for (var i=0; i<result.newPhotos.length; i++) {
							elems.push(
								$('<div id="flat-photo-' + result.newPhotos[i].id + '"></div>')
									.append($('<img src="' + result.newPhotos[i].href + '" alt="' + result.newPhotos[i] + '" />'))
									.append(
										$('<a href="#">Удалить</a>')
										.on('click', function(e) {
											e.preventDefault();
											var ident = $(this).parent().attr('id');
											deletePhoto(ident);
										})
									)
							);
						}
						
						$('#btn-photo-add').parent().before(elems);

						break;
					case 'not ok':
						alert('Ошибка при загрузке фото');
						break; 
				}
			},
			error: function() {
				console.log('Ошибка интернет-соединения');
			}
		});
	});
}

function deletePhoto(photoId) {
	var ident = photoId.match(/^flat-photo-(\d+)$/)[1];
	$.ajax({
		url: '/profile/delete_photo/',
		type: 'DELETE',
		data: {
			'photo_id': ident
		},
		success: function(result) {
			switch (result.status) {
				case 'ok': 
					$('#flat-photo-'+ident).remove();
					break;
				case 'not ok':
					alert('Ошибка при удалении фото');
					break; 
			}
		},
		error: function() {
			console.log('Ошибка интернет-соединения');
		}
	});
}

/* VALIDATION */

function validateUserInfo() {
	var user_first_name = $('#user_first_name').val();
	if ( user_first_name === '' || user_first_name === ' ') {
		alert('Поле \'Ваше имя\' не может быть пустым');
		$('#user_first_name').focus();
		return false;
	} 
	if (user_first_name.length > 100) {
		alert('Поле \'Ваше имя\' не может быть длиннее 100 символов');
		$('#user_first_name').focus();
		return false;
	}

	var user_last_name = $('#user_last_name').val();
	if ( user_last_name === '' || user_last_name === ' ') {
		alert('Поле \'Ваша фамилия\' не может быть пустым');
		$('#user_last_name').focus();
		return false;
	} 
	if (user_last_name.length > 100) {
		alert('Поле \'Ваша фамилия\' не может быть длиннее 100 символов');
		$('#user_last_name').focus();
		return false;
	}

	var user_birth_date = $('#user_birth_date').val();
	if ( user_birth_date === '' || user_birth_date === ' ') {
		alert('Поле \'Дата рождения\' не может быть пустым');
		$('#user_birth_date').focus();
		return false;
	} 

	var user_phone = $('#user_phone').val();
	if ( user_phone === '' || user_phone === ' ' ) {
		alert('Поле \'Номер мобильного\' не может быть пустым');
		$('#user_phone').focus();
		return false;
	}
	if ( !user_phone.match(/^((8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{7,10}$/) ) {
		alert('Поле \'Номер мобильного\' заполнено неправильно');
		$('#user_phone').focus();
		return false;
	} 
	if (user_phone.length > 50) {
		alert('Поле \'Номер мобильного\' не может быть длиннее 50 символов');
		$('#user_phone').focus();
		return false;
	}	

	//todo: посмотреть актуальные размеры полей в базе и поправить если надо скрипт

	var user_email = $('#user_email').val();
	if ( user_email === '' || user_email === ' ') {
		alert('Поле \'Ваш email\' не может быть пустым');
		$('#user_email').focus();
		return false;
	} 
	if (user_email.length > 100) {
		alert('Поле \'Ваш email\' не может быть длиннее 100 символов');
		$('#user_email').focus();
		return false;
	}	
	if ( !user_email.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/) ) {
		alert('Поле \'Ваш email\' заполнено неправильно');
		$('#user_email').focus();
		return false;
	}

	var user_city = $('#user_city').val();
	if ( user_city === '' || user_city === ' ') {
		alert('Поле \'Страна Вашего ВУЗа\' не может быть пустым');
		$('#user_city').focus();
		return false;
	} 
	if (user_city.length > 100) {
		alert('Поле \'Страна Вашего ВУЗа\' не может быть длиннее 100 символов');
		$('#user_city').focus();
		return false;
	}

	var user_university = $('#user_university').val();
	if ( user_university === '' || user_university === ' ') {
		alert('Поле \'Название ВУЗа\' не может быть пустым');
		$('#user_university').focus();
		return false;
	} 
	if (user_university.length > 200) {
		alert('Поле \'Название ВУЗа\' не может быть длиннее 200 символов');
		$('#user_university').focus();
		return false;
	}

	var user_faculty = $('#user_faculty').val();
	if ( user_faculty === '' || user_faculty === ' ') {
		alert('Поле \'Факультет\' не может быть пустым');
		$('#user_faculty').focus();
		return false;
	} 
	if (user_faculty.length > 200) {
		alert('Поле \'Факультет\' не может быть длиннее 200 символов');
		$('#user_faculty').focus();
		return false;
	}

	var user_speciality = $('#user_speciality').val();
	if ( user_speciality === '' || user_speciality === ' ') {
		alert('Поле \'Специальность\' не может быть пустым');
		$('#user_speciality').focus();
		return false;
	} 
	if (user_speciality.length > 150) {
		alert('Поле \'Специальность\' не может быть длиннее 150 символов');
		$('#user_speciality').focus();
		return false;
	}

	var user_study_year = $('#user_study_year').val();
	if ( user_study_year === '' || user_study_year === ' ' ) {
		alert('Поле \'Курс\' не может быть пустым');		
		$('#user_study_year').focus();
		return false;
	}
	if (user_study_year.length > 50) {
		alert('Поле \'Курс\' не может быть длиннее 50 символов');
		$('#user_study_year').focus();
		return false;
	}

	return true;
}

function validateFlat() {
	var flat_description = $('#flat_description').val();
	if ( flat_description !== '' && flat_description !== ' ') {
		if (flat_description.length > 200) {
			alert('Поле \'Описание квартиры\' не может быть длиннее 200 символов');
			$('#flat_description').focus();
			return false;
		}
	} 
	
	var flat_address = $('#flat_address').val();
	if ( flat_address === '' || flat_address === ' ') {
		alert('Поле \'Адресс\' не может быть пустым');
		$('#flat_address').focus();
		return false;
	} 
	if (flat_address.length > 200) {
		alert('Поле \'Адресс\' не может быть длиннее 200 символов');
		$('#flat_address').focus();
		return false;
	}

	var flat_square = $('#flat_square').val();
	if ( flat_square === '' || flat_square === ' ') {
		alert('Поле \'Площадь\' не может быть пустым');
		$('#flat_square').focus();
		return false;
	} 
	if (flat_square.length > 50) {
		alert('Поле \'Площадь\' не может быть длиннее 50 символов');
		$('#flat_square').focus();
		return false;
	}

	var flat_room_num = $('#flat_room_num').val();
	if ( flat_room_num === '' || flat_room_num === ' ') {
		alert('Поле \'Количество комнат\' не может быть пустым');
		$('#flat_room_num').focus();
		return false;
	} 
	if (!flat_room_num.match(/^\d+$/)) {
		alert('Поле \'Количество комнат\' должно быть числом');
		$('#flat_room_num').focus();
		return false;
	}

	var flat_traffic = $('#flat_traffic').val();
	if ( flat_traffic === '' || flat_traffic === ' ') {
		alert('Поле \'Общественный транспорт\' не может быть пустым');
		$('#flat_traffic').focus();
		return false;
	} 
	if (flat_traffic.length > 300) {
		alert('Поле \'Общественный транспорт\' не может быть длиннее 300 символов');
		$('#flat_traffic').focus();
		return false;
	}

	var flat_total_pay = $('#flat_total_pay').val();
	if ( flat_total_pay === '' || flat_total_pay === ' ') {
		alert('Поле \'Общая аренда\' не может быть пустым');
		$('#flat_total_pay').focus();
		return false;
	} 
	if (!flat_total_pay.match(/^\d+$/)) {
		alert('Поле \'Общая аренда\' должно быть числом');
		$('#flat_total_pay').focus();
		return false;
	}

	var flat_rent_pay = $('#flat_rent_pay').val();
	if ( flat_rent_pay === '' || flat_rent_pay === ' ') {
		alert('Поле \'Плата румейта\' не может быть пустым');
		$('#flat_rent_pay').focus();
		return false;
	} 
	if (!flat_rent_pay.match(/^\d+$/)) {
		alert('Поле \'Плата румейта\' должно быть числом');
		$('#flat_rent_pay').focus();
		return false;
	}

	var flat_enter_date = $('#flat_enter_date').val();
	if (!flat_enter_date.match(/^\d{2}.\d{2}.\d{4}$/)) {
		alert('Поле \'Дата въезда\' заполнено неправильно');
		$('#flat_enter_date').focus();
		return false;
	}

	return true;
}


/* OTHER */
function processInputSelect(id) {
	var elems = $('#'+id+'>option')
	var result = elems.eq(0).val(); // default return first val
	
	elems.each(function() {
		if ($(this).prop('selected')) {
			result = $(this).val();
			return false; // break the loop
		}
	});
	return result;
}

// can't enable controls after insertion, because photos on client were not updated... ehhhh
function enableAllControls() {
	$('#btn-find-roommate').fadeIn(200);
	$('#btn-find-flat').fadeIn(200);
	$('.room-pic:last').fadeIn(200); // show add photo
	$('#btn-add-post').prop('disabled', false);
}

function disableAllControls() {
	$('#btn-find-roommate').fadeOut(200);
	$('#btn-find-flat').fadeOut(200);
	$('.room-pic:last').fadeOut(200); // hide add photo
	$('#btn-add-post').prop('disabled', true);
}

$(document).ready(function() {
	if (window.location.href.lastIndexOf('view') !== -1) {
		handlersProfileView();	
	} else if (window.location.href.lastIndexOf('edit') !== -1) {
		handlersProfileEdit();
	}
	
});

