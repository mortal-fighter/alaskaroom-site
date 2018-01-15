'use strict';

/* HANDLERS UI CONTROLS */
function handlersProfileView() {

	$('#request-roommate').on('click', function() {
		var _this = this;
		$.ajax({
			url: '/requests/invite',
			type: 'POST',
			data: {
				user_id: $('#user_id').val() 
			},
			success: function(result) {
				switch (result.status) {
					case 'ok': 
						$(_this).after( $('<p class="roommate-status">Соседство: в ожидании ответа от пользователя ' + $('#user_first_name').val() + ' &#x029D6;</p>') );
						$(_this).remove();
						break;
					case 'not ok':
						alert('При попытке предложить соседство произошла ошибка');
						break; 
				}
			},
			error: function() {
				console.log('Ошибка интернет-соединения');
			}
		});
	});

	$('#request-complain').on('click', function(e) {
		e.preventDefault();
		
		$.ajax({
			method: 'GET',
			url: '/requests/ajax_get_form_complain',
			success: function(html) {
				complainForm(html);
			},
			error: function(error) {
				alert('Ошибка интернет-соединения');
			}
		});
	});

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

	$('.photos').magnificPopup({
		delegate: 'a',
		type: 'image',
		gallery: {
			enabled: true,
			tPrev: 'Предыдущее (Стрелка "Влево")',
			tNext: 'Следующее (Стрелка "Вправо")'
		},
		preload: [1,3]
	});
}

function handlersProfileEdit() {

	$('#user_birth_date').datepicker({
		dayNames: [ "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье" ],
		dayNamesShort: [ "Пон", "Вто", "Сре", "Чет", "Пят", "Суб", "Вос" ],
		dayNamesMin: [ "Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс" ],
		monthNames: [ "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь" ],
		monthNamesShort: [ "Янв", "Фев", "Мар", "Апр", "Май", "Инь", "Иль", "Авг", "Сен", "Окт", "Ноя", "Дек" ],
		dateFormat: "dd.mm.yy",
		changeYear: true,
		changeMonth: true,
		yearRange: "1980:2013"
	});

	$('#flat_enter_date').datepicker({
		dayNames: [ "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье" ],
		dayNamesShort: [ "Пон", "Вто", "Сре", "Чет", "Пят", "Суб", "Вос" ],
		dayNamesMin: [ "Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс" ],
		monthNames: [ "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь" ],
		monthNamesShort: [ "Янв", "Фев", "Мар", "Апр", "Май", "Инь", "Иль", "Авг", "Сен", "Окт", "Ноя", "Дек" ],
		dateFormat: "dd.mm.yy"
	});

	$("#user_phone").mask("+7(999)-999-99-99");

	$('#user_university').on('change', function() {
		//console.log('universities changed');
		//disableAllControls();
		loadFaculties(processInputSelect('user_university'));
	});

	$('#user_faculty').on('change', function() {
		//console.log('faculties changed');
		//disableAllControls();
		loadDepartments(processInputSelect('user_faculty'));
	});

	$('.room-photos > div > a').on('click', function(e) {
		e.preventDefault();
		var ident = $(this).parent().attr('id');
		deletePhoto(ident);
	});

	$('#btn-showflat').on('click', function(e) { 
		e.preventDefault();
		$('.room-info').fadeIn(200);
	});

	$('#user_avatar_1, #upload-icon').on('click', function() { $('#user_avatar_2').click(); });

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
						//doCrop(result);
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
			form.user.university = processInputSelect('user_university');
			form.user.faculty = processInputSelect('user_faculty');
			form.user.department = processInputSelect('user_department');
			form.user.studyyear = processInputSelect('user_studyyear');
			form.user.wish_pay = $('#user_wish_pay').val();
			form.priority = [];
			$('.priority').each(function() {
				form.priority.push(processInputSelect(this.id));
			});

			var validationFailed = false;

			if (hasFlat()) {
				console.log('has flat = true');
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
				
				form.utility = [];
				$('#utility > label > [type=checkbox]').each(function() {
					if ($(this).prop('checked')) {
						form.utility.push($(this).val());
					}
				});

			}

			if (!validationFailed) {
				console.log('flat validated successfully, flat = ', form.flat, ', utility =', form.utility);
				$.ajax({
					method: 'POST',
					url: '/profile/edit',
					dataType: 'json',
					data: form,
					success: function(result) {
						if (result.status === 'ok') {
							alert('Информация сохранена');
							window.location.href = '/profile/view/' + $('#user_id').val();
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
}

function loadFaculties(university_id) {
	console.log('loadFaculties');
	
	if (university_id !== '') {

		$.ajax({
			method: 'GET',
			url: '/profile/get_faculties/' + processInputSelect('user_university'),
			success: function(result) {
				if (result.status === 'ok') {
		
					var target = $('#user_faculty').html(''); // returns element itself
					
					for (var i = 0; i < result.faculties.length; i++) {
						target.append( $('<option value="'+result.faculties[i].id+'">'+result.faculties[i].name_full+'</option>') );
					}
					
					target.on('change', function() {
						console.log('faculties changed');
						//disableAllControls();
						loadDepartments(processInputSelect('user_faculty'));
					});
					loadDepartments(processInputSelect('user_faculty'));

					// Очищаем поле "Кафедра"
					$('#user_department').html('<option value="0">Не выбрана</option>');
					
				} else {
					//console.log('Ошибка');
					console.log('При загрузке факультетов для ВУЗА id="' + processInputSelect('user_university') + '" произошла ошибка');
				}
				enableAllControls();
			},
			error: function(error) {
				console.log('Ошибка сетевого соединения');
				enableAllControls();
			}
		});

	} else {

		$('#user_faculty').html('<option value="">Не выбран</option>');
		loadDepartments('');

	}
}

function loadDepartments(faculty_id) {
	console.log('loadDepartments');
	console.log('faculty_id=', faculty_id);	
	if (faculty_id !== '') {

		$.ajax({
			method: 'GET',
			url: '/profile/get_departments/' + processInputSelect('user_faculty'),
			success: function(result) {
				var target = $('#user_department').html('');
				for (var i = 0; i < result.departments.length; i++) {
					target.append( $('<option value="'+result.departments[i].id+'">'+result.departments[i].name_full+'</option>') );
				}
			},
			error: function(error) {
				console.log('Ошибка сетевого соединения');
				enableAllControls();
			}
		});

	} else {

		$('#user_department').html('<option value="">Не выбрана</option>');

	}

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

function doCrop(result) {
	$('#avatar-cropper').attr('src', result.user_avatar);

	var cropper = new Cropper($('#avatar-cropper').get(0), {
		aspectRatio: 1
	});
	
	/* 	A polyfill for Canvas.toBlob method
		https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob
	*/
	if (!HTMLCanvasElement.prototype.toBlob) {
		Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
			value: function (callback, type, quality) {
				var canvas = this;
				setTimeout(function() {
					var binStr = atob( canvas.toDataURL(type, quality).split(',')[1] ),
						len = binStr.length,
						arr = new Uint8Array(len);
					for (var i = 0; i < len; i++ ) {
						arr[i] = binStr.charCodeAt(i);
					}
					callback( new Blob( [arr], {type: type || 'image/png'} ) );
				});
			}
		});
	}

	$('#btn-crop').on('click', function() {
		cropper.getCroppedCanvas().toBlob(function (blob) {
			var formData = new FormData();

			console.log("blob=", blob);
			formData.append('upload', blob, 'upload');
			formData.append('user_id', $('#user_id').val());

			$.ajax('/profile/upload_avatar', {
					method: 'POST',
					data: formData,
					processData: false,
					contentType: false,
					success: function (result) {
						console.log(result);	
						if (result.status === 'ok') {
							$('#user_avatar_1').attr('src', result.user_avatar);
							closePopup();
						} else {
							alert('При загрузке аватара произошла ошибка');
						}
					},
					error: function () {
						alert('Ошибка интернет-соединения');
					}
			});
		});
	});

	showPopup();
}

function complainForm(html) {
	
	$('.popup-content.complain-form').html(html);
	
	$('#btn-send-complain').on('click', function(e) {
			
		e.preventDefault();
	
		if ($('#complain-comment').val().length > 500) {
			alert('Длина поля \'Комментарий\' не может превышать 500 символов');
			$('#complain-comment').focus();
			return;
		}

		$.ajax({
			method: 'POST',
			url: '/requests/complain/',
			data: {
				user_id: $('#user_id').val(),
				complain_id: processInputSelect('complain-reason'),
				complain_comment: $('#complain-comment').val()
			},
			success: function(result) {
				if (result.status === 'ok') {
					alert('Ваша жалоба принята. Нам очень важна Ваша активность. Спасибо!');
					closePopup();
				} else if (result.reason === 'NO_AVAILABLE_COMPLAINS') {
					alert('Вы отправили максимальное количество жалоб на этой неделе');
					closePopup();
				} else if (result.reason === 'COMPLAIN_IS_ALREADY_EXISTS') {
					alert('Вы уже отправляли жалобу на этого пользователя');
					closePopup();
				} else {
					alert('При подаче жалобы произошла ошибка. Наверное Вы пожаловались на сына/дочку мэра. Извините, за Вами уже выехали.');
					closePopup();
				}
			},
			error: function(error) {
				alert('Ошибка сетевого соединения');
				closePopup();
			}
		});
	});

	showPopup();
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

	var user_wish_pay = $('#user_wish_pay').val();
	if ( user_wish_pay === '' || user_wish_pay === ' ') {
		alert('Поле \'Сколько готов(а) платить за жилье\' не может быть пустым');
		$('#user_wish_pay').focus();
		return false;
	} 
	if (!user_wish_pay.match(/^\d+$/)) {
		alert('Поле \'Сколько готов(а) платить за жилье\' должно быть числом');
		$('#user_wish_pay').focus();
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

function hasFlat() {
	return ( $('#flat_address').val() !== '' ) ? true : false;
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
	//$('select, button, input, textarea, a').prop('disabled', false);
}

function disableAllControls() {
	//$('select, button, input, textarea, a').prop('disabled', true);
}

$(document).ready(function() {
	if (window.location.href.lastIndexOf('view') !== -1) {
		handlersProfileView();	
	} else if (window.location.href.lastIndexOf('edit') !== -1) {
		handlersProfileEdit();
	}
	
});

