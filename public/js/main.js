/**
 * Created by fxdapokalypse on 15.06.15.
 */

function Chat() {
	this.$nano = $('.nano');
	this.$chat = $('.chat .nano-content');
	this.$chatLineTemplate = $('.chat .nano-content .chat-line:first-child');
	this.$form = this.$chat.parents('.panel').next('form');

	if (window.location.hash) {
		this.user = window.window.location.hash.slice(1);
	} else {
		this.user = 'User' + (1 + Math.floor(Math.random() * 19) );
	}
	this.$chat.parents('.panel').find('.chat-current-user').html(this.user);
	this.$nano.nanoScroller();
	this.$form.submit(function( event ) {
		var message = $('#message').val();
		if (message.trim() != "") {
			this.sendMessage(message);
		}
		event.preventDefault();
	}.bind(this));
}

Chat.prototype.addMessage = function(user, message) {
	this.$chatLineTemplate
		.clone()
		.find('.chat-user').text(user + ':')
		.parent()
		.find('.chat-msg').text(message)
		.parent().appendTo(this.$chat);
	this.$nano.nanoScroller({'scroll' : 'bottom'});
};

Chat.prototype.sendMessage = function(message) {

	$.ajax({
		url: '/push',
		type : 'POST',
		contentType : 'application/json',
		data: JSON.stringify({
			'user': this.user,
			'msg': message
		})
	}).done(function() {
		$('#message').val('');
	}.bind(this));

};

Chat.prototype.receiveMessages = function() {
	$.ajax({
		type: 'GET',
		url: '/poll',
		dataType: 'json',
	}).done(function(data) {
		if (jQuery.isArray(data)) {
			data.forEach(function(entry) {
				this.addMessage(entry.user, entry.msg);
			}, this);
		}
	}.bind(this)).always(function() {
		this.receiveMessages();
	}.bind(this));
};

/******************************************************************************
 * Web-Socket Chat.
 ******************************************************************************/

function WSChat() {
	Chat.call(this);
	this.ws = new WebSocket('ws://localhost:3000/chat');
	this.ws.onmessage = function(event) {
		var msgs = JSON.parse(event.data);
		msgs.forEach(function(msg) {
			this.addMessage(msg.user, msg.msg);
		}, this);
	}.bind(this);
}

WSChat.prototype = Object.create(Chat.prototype);
WSChat.prototype.constructor = WSChat;

WSChat.prototype.sendMessage = function(message) {
	var messageObject = JSON.stringify({
		'user': this.user,
		'msg': message
	});
	this.ws.send(messageObject);
	$('#message').val('');
};

WSChat.prototype.receiveMessages = function() {
};