define([
    'postmonger'
], function(
    Postmonger
) {
    'use strict';

    var connection = new Postmonger.Session();
    var payload = {};

    $(window).ready(onRender);

    connection.on('initActivity', initialize);
    connection.on('requestedTokens', onGetTokens);
    connection.on('requestedEndpoints', onGetEndpoints);
    connection.on('clickedNext', save);

    function onRender() {
        connection.trigger('ready');
        connection.trigger('requestTokens');
        connection.trigger('requestEndpoints');
    }

    function initialize(data) {
        if (data) {
            payload = data;
        }

        // Ensure the nested object structure always exists so save() never crashes
        // even on a brand-new activity that has never been saved before
        payload['arguments']                      = payload['arguments']                      || {};
        payload['arguments'].execute              = payload['arguments'].execute              || {};
        payload['arguments'].execute.inArguments  = payload['arguments'].execute.inArguments  || [];
        payload['metaData']                       = payload['metaData']                       || {};

        var hasInArguments = payload['arguments'].execute.inArguments.length > 0;

        // If we have previously saved values, restore them into the form fields
        if (hasInArguments) {
            var inArguments = payload['arguments'].execute.inArguments;
            $.each(inArguments, function (index, inArgument) {
                $.each(inArgument, function (key, val) {
                    if (key === 'accountSid')       { $('#accountSID').val(val); }
                    if (key === 'authToken')         { $('#authToken').val(val); }
                    if (key === 'messagingService')  { $('#messagingService').val(val); }
                    if (key === 'body')              { $('#messageBody').val(val); }
                });
            });
        }

        connection.trigger('updateButton', {
            button:  'next',
            text:    'done',
            visible: true
        });
    }

    function onGetTokens(tokens) {
        // tokens available here if needed in future
    }

    function onGetEndpoints(endpoints) {
        // endpoints available here if needed in future
    }

    function save() {
        var accountSid       = $('#accountSID').val();
        var authToken        = $('#authToken').val();
        var messagingService = $('#messagingService').val();
        var body             = $('#messageBody').val();

        // Set inArguments with all fields needed by the server at execute time.
        //
        // BUG FIXED: The previous version used:
        //   "to": "{{Event." + eventDefinitionKey + ".Phone}}"
        // but `eventDefinitionKey` was NEVER declared anywhere in this file — it was
        // undefined. This caused the template string to become
        //   "{{Event.undefined.Phone}}"
        // which SFMC cannot resolve, so it sent an empty string to the server.
        //
        // The correct approach is to use Contact.Attribute syntax, which SFMC
        // resolves at execute time by looking up the contact's record in the
        // Data Extension named "Twilio_SMS_DE", column "Phone".
        payload['arguments'].execute.inArguments = [{
            "accountSid":       accountSid,
            "authToken":        authToken,
            "messagingService": messagingService,
            "body":             body,
            "to":               "{{Contact.Attribute.Twilio_SMS_DE.Phone}}",
            "email":            "{{Contact.Default.EmailAddress}}"
        }];

        // BUG FIXED: The previous version had incorrect indentation —
        // these two lines were OUTSIDE the save() function body (at module scope),
        // meaning they ran once at load time on an empty payload object,
        // not when the user clicked Done.
        payload['metaData'].isConfigured = true;
        connection.trigger('updateActivity', payload);
    }

});
