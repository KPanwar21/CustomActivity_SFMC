define([
    'postmonger'
], function(
    Postmonger
) {
    'use strict';

    var connection = new Postmonger.Session();
    var payload = {};
    var steps = [
        { "label": "Create SMS Message", "key": "step1" }
    ];
    var currentStep = steps[0].key;

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
        console.log("Initializing activity data: " + JSON.stringify(data));

        if (data) {
            payload = data;
        }

        var hasInArguments = Boolean(
            payload['arguments'] &&
            payload['arguments'].execute &&
            payload['arguments'].execute.inArguments &&
            payload['arguments'].execute.inArguments.length > 0
        );

        var inArguments = hasInArguments ? payload['arguments'].execute.inArguments : {};

        console.log('inArguments on load: ' + JSON.stringify(inArguments));

        // Populate the form fields with previously saved values
        $.each(inArguments, function (index, inArgument) {
            $.each(inArgument, function (key, val) {
                if (key === 'accountSid')       { $('#accountSID').val(val); }
                if (key === 'authToken')         { $('#authToken').val(val); }
                if (key === 'messagingService')  { $('#messagingService').val(val); }
                if (key === 'body')              { $('#messageBody').val(val); }
            });
        });

        connection.trigger('updateButton', {
            button: 'next',
            text: 'done',
            visible: true
        });
    }

    function onGetTokens(tokens) {
        console.log("Tokens: " + JSON.stringify(tokens));
    }

    function onGetEndpoints(endpoints) {
        console.log("Endpoints: " + JSON.stringify(endpoints));
    }

    function save() {
        var accountSid       = $('#accountSID').val();
        var authToken        = $('#authToken').val();
        var messagingService = $('#messagingService').val();
        var body             = $('#messageBody').val();

        payload['arguments'].execute.inArguments = [{
            "accountSid":       accountSid,
            "authToken":        authToken,
            "messagingService": messagingService,
            "body":             body,

            // FIX: Updated to match your actual Data Extension name and Phone column
            // Format: {{Contact.Attribute.YOUR_DE_NAME.YOUR_COLUMN_NAME}}
            // Your DE name: Twilio_SMS_DE
            // Your phone column: Phone
            "to": "{{Contact.Attribute.Twilio_SMS_DE.Phone}}"
        }];

        payload['metaData'].isConfigured = true;

        console.log("Saving payload: " + JSON.stringify(payload));
        connection.trigger('updateActivity', payload);
    }

});
