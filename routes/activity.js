'use strict';
var util = require('util');

// Deps
const Path = require('path');
const JWT = require(Path.join(__dirname, '..', 'lib', 'jwtDecoder.js'));

// FIX: require twilio once at the top, not inside the execute function on every call
const twilio = require('twilio');

exports.logExecuteData = [];

function logData(req) {
    exports.logExecuteData.push({
        body: req.body,
        headers: req.headers,
        method: req.method,
        url: req.url,
        originalUrl: req.originalUrl
    });

    // Clean structured logging — easier to read in Render logs
    console.log('=== REQUEST LOG ===');
    console.log('URL:', req.url);
    console.log('Method:', req.method);
    console.log('Body:', util.inspect(req.body, { depth: 5 }));
    console.log('==================');
}

/*
 * POST Handler for /journeybuilder/save/
 */
exports.save = function (req, res) {
    console.log('--- /save called ---');
    logData(req);
    res.status(200).json({ status: 'ok' });
};

/*
 * POST Handler for /journeybuilder/execute/
 */
exports.execute = function (req, res) {
    console.log('--- /execute called ---');

    // FIX: Validate that inArguments exists before destructuring
    // Without this, if SFMC sends an unexpected payload the whole server crashes
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

    // FIX: Log what we actually received — critical for debugging
    console.log('accountSid:', accountSid ? accountSid.substring(0, 8) + '...' : 'MISSING');
    console.log('messagingService:', messagingService || 'MISSING');
    console.log('to (raw from DE):', rawTo || 'MISSING');
    console.log('body:', body || 'MISSING');

    // FIX: Validate all required fields are present before calling Twilio
    if (!accountSid || !authToken || !messagingService || !body || !rawTo) {
        console.error('ERROR: One or more required fields missing in inArguments[0]');
        console.error('Full requestBody:', util.inspect(requestBody));
        return res.status(400).json({ status: 'error', message: 'Missing required fields' });
    }

    // FIX: E.164 format — Twilio requires numbers to start with +
    // Your DE stores "918290101825" but Twilio needs "+918290101825"
    const to = rawTo.startsWith('+') ? rawTo : '+' + rawTo;
    console.log('to (formatted for Twilio):', to);

    // FIX: Respond to SFMC FIRST, then make the Twilio call
    // SFMC has a 2-second timeout — if Twilio takes longer, SFMC marks it as failed
    // The SMS still sends fine after the response is sent
    res.status(200).json({ status: 'ok' });

    // Twilio call happens after SFMC response — result is logged to Render
    const client = twilio(accountSid, authToken);

    client.messages
        .create({
            body: body,
            messagingService: messagingService,
            to: to
        })
        .then(message => {
            // These logs appear in your Render dashboard → Logs tab
            console.log('SUCCESS: SMS sent');
            console.log('Message SID:', message.sid);
            console.log('To:', message.to);
            console.log('Status:', message.status);
        })
        .catch(err => {
            // FIX: Full Twilio error logging with error code
            // Look up the code at: https://www.twilio.com/docs/api/errors
            // Common codes:
            //   21211 = invalid 'To' phone number format
            //   21608 = trial account cannot send to unverified numbers
            //   21606 = number not enabled for SMS in this region
            console.error('TWILIO ERROR: SMS failed to send');
            console.error('Error Code:', err.code);
            console.error('Error Message:', err.message);
            console.error('More Info:', err.moreInfo);
            console.error('To number attempted:', to);
        });

    logData(req);
};

/*
 * POST Handler for /journeybuilder/publish/
 */
exports.publish = function (req, res) {
    console.log('--- /publish called ---');
    logData(req);
    res.status(200).json({ status: 'ok' });
};

/*
 * POST Handler for /journeybuilder/validate/
 */
exports.validate = function (req, res) {
    console.log('--- /validate called ---');
    logData(req);
    res.status(200).json({ status: 'ok' });
};

/*
 * POST Handler for /journeybuilder/stop/
 */
exports.stop = function (req, res) {
    console.log('--- /stop called ---');
    logData(req);
    res.status(200).json({ status: 'ok' });
};
