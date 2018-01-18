function handlersHeader(){$('#btn-header-find-roomate').on('click',function(e){e.preventDefault();window.location.href='/post/create/roommate'});$('#btn-header-login').on('click',function(e){e.preventDefault();showAuthPopup()})}
function newMessage(message){var newElem=$('<div class="top-message"></div>').append('<div class="content">'+message+'</div>').append($('<a class="close">x</a>').on('click',function(e){e.preventDefault();$(this).parent().fadeOut(200)})).prependTo($('.wrp')).fadeIn(200)}
function showAllMessages(){$('.top-message > .close').on('click',function(e){e.preventDefault();$(this).parent().fadeOut(200)});$('.top-message').fadeIn(200)}
function closePopup(){$('body').removeClass('stop-scrolling');$('#popup-window').fadeOut(200);_resetPopupHeightPosition()}
function showPopup(message,type){if(!type){type='info'}
if(message){$('#popup-window .popup-content').html(message)}else{}
$('body').addClass('stop-scrolling');$('#popup-window').height($(document).height());switch(type){case 'info':$('#popup-window .popup-header').css('background-color','#0a5c82');break;case 'error':$('#popup-window .popup-header').css('background-color','#f34040');break;case 'success':$('#popup-window .popup-header').css('background-color','#1cbd4d');break}
_setPopupHeightPosition();$('#popup-window').fadeIn(200)}
function initPopup(){$('#popup-window .popup-header, #popup-window .popup-content').on('click',function(evt){evt.stopPropagation()});$('#popup-window, .popup-close').on('click',function(){closePopup()})}
function _setPopupHeightPosition(){const delta=$('body').height()-$('#popup-window .popup-container').height();if(delta>150){$('#popup-window .popup-container').css('marginTop','100px').css('marginBottom','50px')}else if(delta<150&&delta>0){$('#popup-window .popup-container').css('marginTop',(delta/2)+'px').css('marginBottom',(delta/2)+'px')}else{const margins=100;const heightHeader=30;const paddings=40;$('#popup-window .popup-container').css('marginTop','50px').css('marginBottom','50px');$('#popup-window .popup-content').height($('body').height()-margins-heightHeader-paddings)}}
function _resetPopupHeightPosition(){$('.popup-container, .popup-content').removeAttr('style')}
function initAuthPopup(){$('#btn-close-auth').on('click',function(e){e.preventDefault();closeAuthPopup()});$('#btn-enter-site').on('click',function(e){e.preventDefault();window.location.href='/post'})}
function showAuthPopup(){$('.auth-popup').fadeIn(200)}
function closeAuthPopup(){$('.auth-popup').fadeOut(200)}
$(document).ready(function(){initAuthPopup();initPopup();handlersHeader()})