"use strict";function _closePopup(){$("body").removeClass("stop-scrolling"),$("#popup-window").fadeOut(400)}function _showPopup(o){o&&$("#popup-window .popup-content").html(o),$("body").addClass("stop-scrolling"),$("#popup-window").height($(document).height()),$("#popup-window").fadeIn(400)}function _initPopup(){$(".popup-header, .popup-content").on("click",function(o){o.stopPropagation()}),$("#popup-window, .popup-close").on("click",function(){_closePopup()})}function handlersHomepage(){$("#btn-invite").on("click",function(){var o=$("#user_name").val(),n=$("#user_email").val();return o.match(/$\s*^/)?(alert("Поле 'Имя' не может быть пустым."),void $("#user_name").focus()):n.match(/^([a-z0-9_-]+\.)*[a-z0-9_-]+@[a-z0-9_-]+(\.[a-z0-9_-]+)*\.[a-z]{2,6}$/)?void $.ajax({method:"POST",url:"/api/sendinvite",dataType:"json",data:{userName:o,userEmail:n},success:function(o){_showPopup("ok"===o.code?o.message:o.message)},error:function(){_showPopup("Ошибка сетевого соединения. Сожалеем.")}}):(alert("Поле 'e-mail' заполнено неправильно."),void $("#user_email").focus())}),$("#btn-enter-site, #enter-site-2").on("click",function(){window.location.href="/auth/login_soc"})}$(document).ready(function(){handlersHomepage()});