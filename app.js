'use strict';

require('dotenv').config();

var express      = require('express');
var bodyParser   = require('body-parser');
var errorhandler = require('errorhandler');
var http         = require('http');
var path         = require('path');
var cors         = require('cors');
var routes       = require('./routes');
var activity     = require('./routes/activity');

var app = express();

app.use(cors());
app.set('port', process.env.PORT || 3000);
app.use(bodyParser.json({ type: 'application/json' }));
app.use(express.static(path.join(__dirname, 'public')));

if ('development' == app.get('env')) {
    app.use(errorhandler());
}

// Basic routes
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.post('/login', routes.login);
app.post('/logout', routes.logout);

// Journey Builder Activity Routes
app.post('/journeybuilder/save',     activity.save);
app.post('/journeybuilder/validate', activity.validate);
app.post('/journeybuilder/publish',  activity.publish);
app.post('/journeybuilder/execute',  activity.execute);
app.post('/journeybuilder/stop',     activity.stop);  // FIX: was missing — SFMC calls this when journey is stopped

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});
