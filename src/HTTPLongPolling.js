/**
 * Incoming messages.
 */
var messages = [];

/**
 * Waiting requests.
 */
var deferredRequests = [];

/**
 * process and answer waiting requests.
 */
var processDeferredRequests =  function() {
	deferredRequests.forEach(function(deferredReq) {
		var res = deferredReq.res;
		res.send(messages);
	});

	deferredRequests = [];
	messages = [];
};

HTTPLongPolling = {

	/**
	 * Handle incoming messages.
	 *
	 * @param req
	 * @param res
	 */
	onPush: function(req, res) {
		messages.push(req.body);
		processDeferredRequests();
		res.append('cache-control', 'no-cache');
		res.sendStatus(200);
	},

	/**
	 * Hold the connection until there are new  messages.
	 *
	 * @param req
	 * @param res
	 */
	onPoll: function(req, res) {
		res.append('content-type', 'application/json');
		res.append('cache-control', 'no-cache');
		deferredRequests.push({
			'req' : req,
			'res' : res
		});

		if (messages.length > 0) {
			processDeferredRequests();
		}
	}
};

module.exports = HTTPLongPolling;

