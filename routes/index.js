'use strict';

// BUG FIXED: The original used req.session.token and res.render()
// but the app has no session middleware and no view engine configured.
// Calling req.session.token crashes with "Cannot read properties of undefined".
// Calling res.render() crashes with "No default engine was specified".
// These routes are only used for login/logout redirects — simplified to be safe.

exports.login = function(req, res) {
    console.log('login called');
    res.redirect('/');
};

exports.logout = function(req, res) {
    console.log('logout called');
    res.redirect('/');
};
