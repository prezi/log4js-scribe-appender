/* global require, describe, it */
(function () {
    "use strict";
    var assert = require("assert");
    var scribe = require("scribe");

    var log4jScribeAppender = require("./index");

    describe('withDefaults', function(){
        it('sets correct defaults for config = null', function() {
            var config = log4jScribeAppender.withDefaults(null);
            assert.equal(config.host, 'localhost');
            assert.equal(config.port, 1463);
            assert.equal(config.scribeCategory, 'log4js-node');
        });

        it('doesn\'t override passed in values', function() {
            var _config = { host: 'foo', port: 42, scribeCategory: 'bar' };
            var config = log4jScribeAppender.withDefaults(_config);
            assert.equal(config.host, _config.host);
            assert.equal(config.port, _config.port);
            assert.equal(config.scribeCategory, _config.scribeCategory);
        });
    });
}());

