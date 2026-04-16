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
        console.log("initActivity received: " + JSON.stringify(data));

        if (data) {
            payload = data;
        }

        var hasInArguments = Boolean(
            payload['arguments'] &&
            payload['arguments'].execute &&
            payload['arguments'].execute.inArguments &&
            payload['arguments'].execute.inArguments.length > 0
        );

        var inArguments = hasInArguments ? payload['arguments'].execute.inArguments : [];

        console.log('inArguments on load: ' + JSON.stringify(inArguments));

        // Populate form fields with previously saved values
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

        // KEY FIX: Do NOT replace the entire inArguments array.
        // Instead, find each existing inArgument object and update only
        // the fields the user filled in. This preserves the "to" field
        // which config.json sets as {{Contact.Attribute.Twilio_SMS_DE.Phone}}
        // — SFMC resolves that template at execute time using the contact's data.
        // If we overwrite the whole array here, we destroy that template.

        var existingArgs = payload['arguments'].execute.inArguments;

        // Build a merged object: start from existing values, then apply user inputs
        var merged = {};

        // Step 1: flatten all existing inArgument objects into merged
        $.each(existingArgs, function(i, argObj) {
            $.each(argObj, function(key, val) {
                merged[key] = val;
            });
        });

        // Step 2: apply user-entered values on top (these override existing)
        merged['accountSid']       = accountSid;
        merged['authToken']        = authToken;
        merged['messagingService'] = messagingService;
        merged['body']             = body;
        // NOTE: we do NOT set merged['to'] here — we keep whatever
        // config.json provided (the {{Contact.Attribute...}} template)

        // Step 3: write back as a single inArgument object
        payload['arguments'].execute.inArguments = [ merged ];

        payload['metaData'].isConfigured = true;

        console.log("Saving payload — to value preserved as: " + merged['to']);
        console.log("Full payload: " + JSON.stringify(payload));

        connection.trigger('updateActivity', payload);
    }

});
