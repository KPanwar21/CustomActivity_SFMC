'use strict';
var util = require('util');

// Deps
const Path = require('path');
const JWT = require(Path.join(__dirname, '..', 'lib', 'jwtDecoder.js'));
var http = require('https');

exports.logExecuteData = [];

function logData(req) {
    exports.logExecuteData.push({
        body: req.body,
        headers: req.headers,
        trailers: req.trailers,
        method: req.method,
        url: req.url,
        params: req.params,
        query: req.query,
        route: req.route,
        cookies: req.cookies,
        ip: req.ip,
        path: req.path, 
        host: req.host,
        fresh: req.fresh,
        stale: req.stale,
        protocol: req.protocol,
        secure: req.secure,
        originalUrl: req.originalUrl
    });
    console.log("body: " + util.inspect(req.body));
    console.log("headers: " + req.headers);
    console.log("trailers: " + req.trailers);
    console.log("method: " + req.method);
    console.log("url: " + req.url);
    console.log("params: " + util.inspect(req.params));
    console.log("query: " + util.inspect(req.query));
    console.log("route: " + req.route);
    console.log("cookies: " + req.cookies);
    console.log("ip: " + req.ip);
    console.log("path: " + req.path);
    console.log("host: " + req.host);
    console.log("fresh: " + req.fresh);
    console.log("stale: " + req.stale);
    console.log("protocol: " + req.protocol);
    console.log("secure: " + req.secure);
    console.log("originalUrl: " + req.originalUrl);
}

/*
 * POST Handler for /save/ route of Activity.
 */
exports.save = function (req, res) {
    console.log("5 -- For Save");	
    console.log("4");	
    console.log("3");	
    console.log("2");	
    console.log("1");	
    console.log(req.body);
    logData(req);
    // BUG 2 FIX: was res.send(200, 'Save') — Express 4 syntax is res.status().json()
    res.status(200).json({ status: 'ok' });
};

/*
 * POST Handler for /execute/ route of Activity.
 */
exports.execute = function (req, res) {
    console.log("5 -- For Execute");	
    console.log("4");	
    console.log("3");	
    console.log("2");	
    console.log("1");	
    
    var requestBody = req.body.inArguments[0];

    const accountSid = requestBody.accountSid;
    const authToken = requestBody.authToken;
    const to = requestBody.to;
    // BUG 1 FIX: was "const from = requestBody.messagingService"
    // Variable was named "from" but used as "messagingService" below — was undefined
    const messagingService = requestBody.messagingService;
    const body = requestBody.body;

    const client = require('twilio')(accountSid, authToken); 
     
    client.messages 
          .create({ 
             body: body,
             messagingService: messagingService,  // now correctly defined
             to: to
           }) 
          .then(message => console.log(message.sid))
          .catch(err => console.error('Twilio error:', err));

    logData(req);
    // BUG 2 FIX: was res.send(200, 'Publish')
    res.status(200).json({ status: 'ok' });
};


/*
 * POST Handler for /publish/ route of Activity.
 */
exports.publish = function (req, res) {
    console.log("5 -- For Publish");	
    console.log("4");	
    console.log("3");	
    console.log("2");	
    console.log("1");	
    // BUG 3 FIX: logData and res.send were both commented out
    // SFMC was waiting for a response and timing out — journey would never activate
    logData(req);
    res.status(200).json({ status: 'ok' });
};

/*
 * POST Handler for /validate/ route of Activity.
 */
exports.validate = function (req, res) {
    console.log("5 -- For Validate");	
    console.log("4");	
    console.log("3");	
    console.log("2");	
    console.log("1");	
    logData(req);
    // BUG 2 FIX: was res.send(200, 'Validate')
    res.status(200).json({ status: 'ok' });
};

/*
 * POST Handler for /stop/ route of Activity.
 */
exports.stop = function (req, res) {
    console.log("5 -- For Stop");	
    logData(req);
    res.status(200).json({ status: 'ok' });
};
