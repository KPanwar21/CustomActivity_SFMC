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
        console.log('initActivity received: ' + JSON.stringify(data));

        if (data) {
            payload = data;
        }

        // Check if we have previously saved inArguments to pre-fill the form
        var hasInArguments = Boolean(
            payload['arguments'] &&
            payload['arguments'].execute &&
            payload['arguments'].execute.inArguments &&
            payload['arguments'].execute.inArguments.length > 0
        );

        if (hasInArguments) {
            var inArguments = payload['arguments'].execute.inArguments;
            console.log('Restoring saved values: ' + JSON.stringify(inArguments));

            $.each(inArguments, function (index, inArgument) {
                $.each(inArgument, function (key, val) {
                    if (key === 'accountSid')      { $('#accountSID').val(val); }
                    if (key === 'authToken')        { $('#authToken').val(val); }
                    if (key === 'messagingService') { $('#messagingService').val(val); }
                    if (key === 'body')             { $('#messageBody').val(val); }
                });
            });
        }

        connection.trigger('updateButton', {
            button: 'next',
            text:    'done',
            visible: true
        });
    }

    function onGetTokens(tokens) {
        console.log('Tokens: ' + JSON.stringify(tokens));
    }

    function onGetEndpoints(endpoints) {
        console.log('Endpoints: ' + JSON.stringify(endpoints));
    }

    function save() {
        var accountSid       = $('#accountSID').val();
        var authToken        = $('#authToken').val();
        var messagingService = $('#messagingService').val();
        var body             = $('#messageBody').val();

        console.log('Saving — accountSid: ' + accountSid);
        console.log('Saving — messagingService: ' + messagingService);
        console.log('Saving — body: ' + body);

        // Set the full inArguments explicitly.
        // The "to" field uses the SFMC attribute template string.
        // SFMC resolves {{Contact.Attribute.X.Y}} at execute time
        // by substituting the real contact's field value.
        // This must be set here as a string — SFMC stores it and resolves it later.
        payload['arguments'].execute.inArguments = [
            {
                "accountSid":       accountSid,
                "authToken":        authToken,
                "messagingService": messagingService,
                "body":             body,
                "to":               "{{Contact.Attribute.Twilio_SMS_DE.Phone}}",
                "email":            "{{Contact.Default.EmailAddress}}"
            }
        ];

        payload['metaData'].isConfigured = true;

        console.log('Full payload being saved: ' + JSON.stringify(payload));

        connection.trigger('updateActivity', payload);
    }

});
