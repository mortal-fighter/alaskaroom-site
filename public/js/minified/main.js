function handlersHeader(){$("#btn-header-find-roomate").on("click",function(o){o.preventDefault(),window.location.href="/post/create/roommate"}),$("#btn-header-login").on("click",function(o){o.preventDefault(),showAuthPopup()})}function closePopup(){$("body").removeClass("stop-scrolling"),$("#popup-window").fadeOut(200),_resetPopupHeightPosition()}function showPopup(o,p){switch(p||(p="info"),o&&$("#popup-window .popup-content").html(o),$("body").addClass("stop-scrolling"),$("#popup-window").height($(document).height()),p){case"info":$("#popup-window .popup-header").css("background-color","#0a5c82");break;case"error":$("#popup-window .popup-header").css("background-color","#f34040");break;case"success":$("#popup-window .popup-header").css("background-color","#1cbd4d")}_setPopupHeightPosition(),$("#popup-window").fadeIn(200)}function initPopup(){$("#popup-window .popup-header, #popup-window .popup-content").on("click",function(o){o.stopPropagation()}),$("#popup-window, .popup-close").on("click",function(){closePopup()})}function _setPopupHeightPosition(){const o=$("body").height()-$("#popup-window .popup-container").height();if(o>150)$("#popup-window .popup-container").css("marginTop","100px").css("marginBottom","50px");else if(150>o&&o>0)$("#popup-window .popup-container").css("marginTop",o/2+"px").css("marginBottom",o/2+"px");else{const p=100,n=30,t=40;$("#popup-window .popup-container").css("marginTop","50px").css("marginBottom","50px"),$("#popup-window .popup-content").height($("body").height()-p-n-t)}}function _resetPopupHeightPosition(){$(".popup-container, .popup-content").removeAttr("style")}function initAuthPopup(){$("#btn-close-auth").on("click",function(o){o.preventDefault(),closeAuthPopup()}),$("#btn-enter-site").on("click",function(o){o.preventDefault(),window.location.href="/post"})}function showAuthPopup(){$(".auth-popup").fadeIn(200)}function closeAuthPopup(){$(".auth-popup").fadeOut(200)}$(document).ready(function(){initAuthPopup(),initPopup(),handlersHeader()});