"use strict";function handlersFaculty(){$("a.load-nav").on("click",eventData,function(e){$("a.load-nav").removeClass("current"),$(this).addClass("current"),e.data.type=$(this).attr("type"),load()}),$("#load-more").on("click",function(e){e.preventDefault(),loadMore()}),load()}function load(){var e={type:eventData.type};lastForm=e,$.ajax({method:"POST",url:"/faculty/ajax_get_people_by_type",dataType:"json",data:e,success:function(e){if("ok"===e.status){countRecords=e.records.length;var a=$("#content");a.html(""),0===e.records.length?(a.html('<div class="no-records">Никого не найдено</div>'),$("#load-more").hide()):e.records.length<e.recordsCountTotal?(a.html(""),$("#load-more").show()):(a.html(""),$("#load-more").hide());for(var t=0;t<e.records.length;t++){var r=e.records[t],o=null;o=$('<div class="user-small"></div>'),o.append($('<img src="'+r.user_avatar+'" alt="Room"/>')),o.append($("<h4>"+r.user_first_name+" "+r.user_last_name+"</h4>")),o.append($("<p>"+r.user_sex.substr(0,1).toUpperCase()+", "+r.user_age+", "+r.university_name+"</p>")),$('<a href="/profile/view/'+r.user_id+'"></a>').append(o).appendTo(a)}}else alert("При загрузке данных произошла ошибка")},error:function(){alert("Проверьте соединение с Интернетом")}})}function loadMore(){lastForm.offset=countRecords,$.ajax({method:"POST",url:"/faculty/ajax_get_people_by_type",dataType:"json",data:lastForm,success:function(e){if("ok"===e.status){countRecords+=e.records.length,countRecords===e.recordsCountTotal&&$("#load-more").hide();for(var a=$("#content"),t=0;t<e.records.length;t++){var r=e.records[t],o=null;o=$('<div class="user-small"></div>'),o.append($('<img src="'+r.user_avatar+'" alt="Room"/>')),o.append($("<h4>"+r.user_first_name+" "+r.user_last_name+"</h4>")),o.append($("<p>"+r.user_sex.substr(0,1).toUpperCase()+", "+r.user_age+", "+r.university_name+"</p>")),$('<a href="/profile/view/'+r.user_id+'"></a>').append(o).appendTo(a)}}else alert("При загрузке данных произошла ошибка")},error:function(){alert("Проверьте соединение с Интернетом")}})}var eventData={type:"university"},countRecords=0,lastForm={type:eventData.type};$(document).ready(function(){handlersFaculty()});