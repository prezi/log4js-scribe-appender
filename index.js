var layouts = require('log4js/lib/layouts.js'),
    scribe = require('scribe'),
    os = require('os'),
    passThrough = layouts.messagePassThroughLayout;

/**
 * Scribe Appender for log4js. Sends logging events via Scribe using node-scribe.
 *
 * @param config object with Scribe configuration data
 * @param layout function that takes a log event and returns a string
 */
function scribeAppender(config, layout) {
    config = config || {};
    config.host = config.host || 'localhost';
    config.port = config.port || 1463;

    this.scribeCategory = config.scribeCategory || 'log4js-node';

    var client = new scribe.Scribe(config.host, config.port, {autoReconnect:true});
    var isReady = false;
    var STORED_MESSAGES_LIMIT = 1000; // number of messages we store until scribe is fully connected
    var storedMessages = [];

    client.open(function(err){

        if(err) {
            return console.log(err);
        }
        while (storedMessages.length) {
            var msg = storedMessages.shift();
            client.send(self.scribeCategory, msg);
        }
        isReady = true;
    });

    client.on('error', function(err){
        console.log("Couldn't connect to scribe: ", err.code);
    });

    if(!layout) layout = passThrough;

    var self = this;
    return function(loggingEvent) {
        var msg = layout(loggingEvent);
        if (isReady) {
            client.send(self.scribeCategory, msg);
        } else if (storedMessages.length < STORED_MESSAGES_LIMIT) {
            storedMessages.push(msg);
        }
    }
}

function configure(config) {
    var layout;
    if (config.layout) {
        layout = layouts.layout(config.layout.type, config.layout);
    }
    return scribeAppender(config, layout);
}

exports.name      = 'scribe';
exports.appender  = scribeAppender;
exports.configure = configure;
