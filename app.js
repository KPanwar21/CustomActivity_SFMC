'use strict';

// 1. Load Environment Variables (Twilio SID/Token from Render)
require('dotenv').config();

// Module Dependencies
var express      = require('express');
var bodyParser   = require('body-parser');
var errorhandler  = require('errorhandler');
var http         = require('http');
var path         = require('path');
var cors         = require('cors'); // Added for SFMC security
var routes       = require('./routes');
var activity     = require('./routes/activity');

var app = express();

// 2. Enable CORS - This allows Salesforce to communicate with your Render app
app.use(cors());

// 3. Configure Express
app.set('port', process.env.PORT || 3000);

// Use JSON parser for Journey Builder payloads
app.use(bodyParser.json({ type: 'application/json' }));

// 4. Serve Static Files (This is where your index.html and config.json live)
app.use(express.static(path.join(__dirname, 'public')));

if ('development' == app.get('env')) {
    app.use(errorhandler());
}

// 5. Basic Web Routes
// Note: We use sendFile because you are using a static index.html
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.post('/login', routes.login);
app.post('/logout', routes.logout);

// 6. Custom Journey Builder Activity Routes
// IMPORTANT: Ensure your config.json URLs match these exactly (no trailing slashes)
app.post('/journeybuilder/save', activity.save);
app.post('/journeybuilder/validate', activity.validate);
app.post('/journeybuilder/publish', activity.publish);
app.post('/journeybuilder/execute', activity.execute);

// 7. Start Server
http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});