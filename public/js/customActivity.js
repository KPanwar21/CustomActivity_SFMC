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

        // Ensure the object structure exists so save() doesn't crash
        payload['arguments'] = payload['arguments'] || {};
        payload['arguments'].execute = payload['arguments'].execute || {};
        payload['arguments'].execute.inArguments = payload['arguments'].execute.inArguments || [];

        var hasInArguments = Boolean(payload['arguments'].execute.inArguments.length > 0);

        if (hasInArguments) {
            var inArguments = payload['arguments'].execute.inArguments;
            $.each(inArguments, function (index, inArgument) {
                $.each(inArgument, function (key, val) {
                    if (key === 'accountSid')       { $('#accountSID').val(val); }
                    if (key === 'authToken')        { $('#authToken').val(val); }
                    if (key === 'messagingService') { $('#messagingService').val(val); }
                    if (key === 'body')             { $('#messageBody').val(val); }
                });
            });
        }

        connection.trigger('updateButton', {
            button: 'next',
            text: 'done',
            visible: true
        });
    }

    function onGetTokens(tokens) {}
    function onGetEndpoints(endpoints) {}

    function save() {
        var accountSid       = $('#accountSID').val();
        var authToken        = $('#authToken').val();
        var messagingService = $('#messagingService').val();
        var body             = $('#messageBody').val();

        // Data Mapping: This sends the instructions to SFMC
        payload['arguments'].execute.inArguments = [{
        "accountSid": accountSid,
        "authToken": authToken,
        "messagingService": messagingService,
        "body": body,
        // FIX: Use the Event Context syntax which is more reliable for Entry Source data
        "to": "{{Event." + eventDefinitionKey + ".Phone}}", 
        "email": "{{Event." + eventDefinitionKey + ".EmailAddress}}"
    }];

    payload['metaData'].isConfigured = true;
    connection.trigger('updateActivity', payload);
    }
});
