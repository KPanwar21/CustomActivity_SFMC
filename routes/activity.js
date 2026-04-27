'use strict';
var util = require('util');

const Path = require('path');
const JWT  = require(Path.join(__dirname, '..', 'lib', 'jwtDecoder.js'));

// Twilio required once at the top — not inside execute() on every call
const twilio = require('twilio');

exports.logExecuteData = [];

function logData(req) {
    exports.logExecuteData.push({
        body:        req.body,
        headers:     req.headers,
        method:      req.method,
        url:         req.url,
        originalUrl: req.originalUrl
    });
    console.log('=== REQUEST LOG ===');
    console.log('URL:', req.url);
    console.log('Method:', req.method);
    console.log('Body:', util.inspect(req.body, { depth: 5 }));
    console.log('==================');
}

exports.save = function (req, res) {
    console.log('--- /save called ---');
    logData(req);
    res.status(200).json({ status: 'ok' });
};

exports.execute = function (req, res) {
    console.log('--- /execute called ---');

    if (!req.body || !req.body.inArguments || req.body.inArguments.length === 0) {
        console.error('ERROR: inArguments missing or empty');
        console.error('Received body:', util.inspect(req.body));
        return res.status(400).json({ status: 'error', message: 'inArguments missing' });
    }

    var requestBody = req.body.inArguments[0];

    const accountSid       = requestBody.accountSid;
    const authToken        = requestBody.authToken;
    const messagingService = requestBody.messagingService;
    const body             = requestBody.body;
    const rawTo            = requestBody.to;

    console.log('accountSid:',       accountSid       ? accountSid.substring(0, 8) + '...' : 'MISSING');
    console.log('messagingService:', messagingService || 'MISSING');
    console.log('to (raw from DE):', rawTo            || 'MISSING');
    console.log('body:',             body             || 'MISSING');

    if (!accountSid || !authToken || !messagingService || !body || !rawTo) {
        console.error('ERROR: One or more required fields missing');
        console.error('Full requestBody:', util.inspect(requestBody));
        return res.status(400).json({ status: 'error', message: 'Missing required fields' });
    }

    // E.164 format: Twilio requires + prefix. DE stores "918290101825", Twilio needs "+918290101825"
    const to = rawTo.startsWith('+') ? rawTo : '+' + rawTo;
    console.log('to (formatted):', to);

    // Respond to SFMC immediately — SFMC timeout is 2s, Twilio API can take longer
    res.status(200).json({ status: 'ok' });

    // Twilio call fires after response — result visible in Render logs
    const client = twilio(accountSid, authToken);

    client.messages
        .create({ body, messagingService, to })
        .then(message => {
            console.log('SUCCESS: SMS sent');
            console.log('Message SID:', message.sid);
            console.log('To:', message.to);
            console.log('Status:', message.status);
        })
        .catch(err => {
            // Error codes: 21211 = bad number format, 21608 = unverified on trial account
            // Full list: https://www.twilio.com/docs/api/errors
            console.error('TWILIO ERROR:', err.code, '-', err.message);
            console.error('More info:', err.moreInfo);
            console.error('To attempted:', to);
        });

    logData(req);
};

exports.publish = function (req, res) {
    console.log('--- /publish called ---');
    logData(req);
    res.status(200).json({ status: 'ok' });
};

exports.validate = function (req, res) {
    console.log('--- /validate called ---');
    logData(req);
    res.status(200).json({ status: 'ok' });
};

exports.stop = function (req, res) {
    console.log('--- /stop called ---');
    logData(req);
    res.status(200).json({ status: 'ok' });
};
