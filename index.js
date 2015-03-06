/* global require, console, exports */
(function() {
    "use strict";
    
    var layouts = require('log4js/lib/layouts.js'),
        scribeModule = require('scribe'),
        os = require('os'),
        passThrough = layouts.messagePassThroughLayout;

    /**
     * Scribe Appender for log4js. Sends logging events via Scribe using node-scribe.
     *
     * @param category the Scribe category to log to
     * @param layout function that takes a log event and returns a string
     * @param client Scribe client instance
     */
    function scribeAppender(category, layout, client) {
        var isReady = false;
        var STORED_MESSAGES_LIMIT = 1000; // number of messages we store until scribe is fully connected
        var storedMessages = [];

        client.open(function(err){

            if(err) {
                return console.log(err);
            }
            while (storedMessages.length) {
                var msg = storedMessages.shift();
                client.send(category, msg);
            }
            isReady = true;
        });

        client.on('error', function(err){
            console.log("Couldn't connect to scribe: ", err.code);
        });

        if(!layout) {
            layout = passThrough;
        }

        return function(loggingEvent) {
            var msg = layout(loggingEvent);
            if (isReady) {
                client.send(category, msg);
            } else if (storedMessages.length < STORED_MESSAGES_LIMIT) {
                storedMessages.push(msg);
            }
        };
    }

    function withDefaults(_config) {
        var config = _config || {};
        config.host = config.host || 'localhost';
        config.port = config.port || 1463;
        config.scribeCategory = config.scribeCategory || 'log4js-node';
        return config;
    }

    function makeLayout(config) {
        if (config.layout) {
            return layouts.layout(config.layout.type, config.layout);
        }
        return null;
    }

    function configure(_config, _scribe) {
        var scribe = _scribe || scribeModule;
        var config = withDefaults(_config);
        var client = new scribe.Scribe(config.host, config.port, {autoReconnect:true});
        var layout = makeLayout(config);
        return scribeAppender(config.scribeCategory, layout, client);
    }

    exports.name      = 'scribe';
    exports.appender  = scribeAppender;
    exports.configure = configure;
    exports.withDefaults = withDefaults;
}());

