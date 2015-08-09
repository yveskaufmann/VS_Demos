var express = require('express'),
    exphbs  = require('express-handlebars'),
 	logger = require('morgan'),
 	path = require('path'),
 	console = require('console'),
 	bodyParser = require('body-parser'),
	httpLongPolling = require('./HTTPLongPolling'),
	WebSocketChat = require('./WebSocket');

var app = express();
var expressWs = require('express-ws')(app);


var hbs = exphbs.create({
	helpers: {
		if_eq: function (a, b, opts) {
			console.log(a + '  ' + b);
			if (a == b) {
				return opts.fn(this);
			} else {
				return opts.inverse(this);
			}
		}
	},
	defaultLayout: 'main'
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.use(logger('dev'));
app.use(express.static(path.join(__dirname, '../public')));
app.use(bodyParser.json());

var chatPages = {
	'wsChat': {
		'title': 'WebSocket-Chat',
		'url': '/wsChat'
	},
	'httpPollChat': {
		'title': 'HTTP Long Polling Chat',
		'url': '/pollChat'
	}
};

app.get(chatPages.wsChat.url, function(req, res) {
	chatPages.wsChat.active = true;
	chatPages.httpPollChat.active = false;
	res.render('chat',{
		title: chatPages.wsChat.title,
		pages: chatPages,
	});
});

app.get(chatPages.httpPollChat.url, function(req, res) {
	chatPages.wsChat.active = false;
	chatPages.httpPollChat.active = true;
	res.render('chat',{
		title: chatPages.httpPollChat.title,
		pages: chatPages
	});
});


app.get('/', function(req, res) {
	res.redirect(chatPages.wsChat.url);
});

app.post('/push', httpLongPolling.onPush);
app.get('/poll', httpLongPolling.onPoll);
app.ws('/chat', WebSocketChat.onConnect);

module.exports = app;
