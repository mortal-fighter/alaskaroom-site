"use strict";function handlersFilter(){$(".prime-filter, .lower-filter").on("change",function(){search()}),$("#user_university").on("change",function(){var e=processInputSelect("user_university");return"0"===e?void $("#user_faculty_container").hide():void $.ajax({method:"GET",url:"/filter/get_faculties_by_university_id/"+e,success:function(a){if("ok"===a.status){for(var n=$("#user_faculty").html(""),s=0;s<a.faculties.length;s++)n.append($('<option value="'+a.faculties[s].id+'">'+a.faculties[s].name+"</option>"));$("#user_faculty_container").show()}else console.log('При загрузке факультетов для ВУЗА id="'+e+'" произошла ошибка')},error:function(e){console.log("Ошибка сетевого соединения")}})}),$("#btn-find").on("click",function(e){e.preventDefault(),search()}),$("#load-more").on("click",function(e){e.preventDefault(),loadMore()})}function search(){var e={};e.type=type=processInputSelect("type"),e.priorities=[],$(".priority").each(function(){var a=processInputSelect($(this).attr("id"),!0);a&&e.priorities.push(a)}),e.user_sex=processInputSelect("user_sex"),e.user_age_range=processInputSelect("user_age_range"),e.university_id=processInputSelect("user_university"),e.faculty_id=processInputSelect("user_faculty"),lastForm=e,$.ajax({method:"POST",url:"/filter/ajax",dataType:"json",data:e,success:function(e){if("ok"===e.status){countRecords=e.records.length;var a=$("#listing-content");a.html(""),0===e.records.length?(a.html('<div class="no-records">Поиск не дал результатов</div>'),$("#load-more").hide()):(a.html(""),$("#load-more").show());for(var n=0;n<e.records.length;n++){var s=e.records[n],t=null;"find-flat"===type?(t=$('<div class="room-list"></div>'),t.append($('<img src="'+s.flat_first_photo+'" alt="Room"/>')),t.append($("<h5>"+s.flat_rent_pay+"</h5>").append($("<span> рублей</span>"))),t.append($("<h4></h4>").append($("<span>"+s.user_city+"</span>")).append($("<span>, "+s.flat_address+"</span>"))),t.append($("<p>Сосед: </p>").append($("<span>"+s.user_sex+", </span>")).append($("<span>"+s.user_age+", </span>")).append($("<span>"+s.university_name+"</span>")))):(t=$('<div class="user-list"></div>'),t.append($('<img src="'+s.user_avatar+'" alt="Room"/>')),t.append($("<h4>"+s.user_first_name+" "+s.user_last_name+"</h4>")),t.append($("<p>Ваш сосед: </p>").append($("<span>"+s.user_sex+", </span>")).append($("<span>"+s.user_age+", </span>")).append($("<span>"+s.university_name+"</span>")))),$('<a href="/profile/view/'+s.user_id+'"></a>').append(t).appendTo(a)}}else alert("При загрузке данных произошла ошибка")},error:function(){alert("Проверьте соединение с Интернетом")}})}function loadMore(){lastForm.offset=countRecords,$.ajax({method:"POST",url:"/filter/ajax",dataType:"json",data:lastForm,success:function(e){if("ok"===e.status){countRecords+=e.records.length;for(var a=$("#listing-content"),n=0;n<e.records.length;n++){var s=e.records[n],t=null;"find-flat"===type?(t=$('<div class="room-list"></div>'),t.append($('<img src="'+s.flat_first_photo+'" alt="Room"/>')),t.append($("<h5>"+s.flat_rent_pay+"</h5>").append($("<span> рублей</span>"))),t.append($("<h4></h4>").append($("<span>"+s.user_city+"</span>")).append($("<span>, "+s.flat_address+"</span>"))),t.append($("<p>Сосед: </p>").append($("<span>"+s.user_sex+", </span>")).append($("<span>"+s.user_age+", </span>")).append($("<span>"+s.university_name+"</span>")))):(t=$('<div class="user-list"></div>'),t.append($('<img src="'+s.user_avatar+'" alt="Room"/>')),t.append($("<h4>"+s.user_first_name+" "+s.user_last_name+"</h4>")),t.append($("<p>Ваш сосед: </p>").append($("<span>"+s.user_sex+", </span>")).append($("<span>"+s.user_age+", </span>")).append($("<span>"+s.university_name+"</span>")))),t.appendTo(a)}}else alert("При загрузке данных произошла ошибка")},error:function(){alert("Проверьте соединение с Интернетом")}})}function processInputSelect(e,a){var n,s=$("#"+e+">option");return n=a?null:s.eq(0).val(),s.each(function(e){return!$(this).prop("selected")||a&&0===e?void 0:(n=$(this).val(),!1)}),n}var countRecords=0,lastForm=null,type=null;$(document).ready(function(){handlersFilter()});