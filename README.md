# log4js-scribe-appender
[![Build Status](https://travis-ci.org/prezi/log4js-scribe-appender.svg)](https://travis-ci.org/prezi/log4js-scribe-appender)

This is a custom appender for [log4js](https://github.com/nomiddlename/log4js-node) capable of sending logs to a scribe server.

## Install

    npm install log4js-scribe-appender

## Usage

    log4js.configure({
        appenders: [
            {type: 'log4js-scribe-appender', scribeCategory: 'example-category'}
        ]
    });

## License
Apache License, Version 2.0.
