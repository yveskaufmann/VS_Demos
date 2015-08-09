/**
 * Created by fxdapokalypse on 17.06.15.
 */

var console = require('console');

/**
 * Connected clients
 *
 * @type {Object}
 */
var clients = {};

/**
 * Received messages
 *
 * @type {Array}
 */
var messages = [];

/**
 * Ongoing id for each connecting client.
 *
 * @type {number}
 */
var clientIds = 0;

module.exports = {
	/**
	 * Handles a incoming web socket connection.
	 *
	 * @param ws
	 * @param req
	 */
	onConnect: function(ws, req) {
		console.log('Incoming connection from: ' + req.connection.remoteAddress);

		var thisClientId = clientIds++;
		clients[thisClientId] = ws;
		ws.on('close', function () {
			console.log('Closing connection from: ' + req.connection.remoteAddress);
			delete clients[thisClientId];
		});

		ws.on('message', function (msg) {
			messages.push(msg);
			console.log(msg);

			for (var clientId in clients) {
				var client = clients[clientId];
				client.send('[' +  messages.join(',')  + ']');
			}
			messages = [];
		});
	}
};
