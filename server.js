'use strict';

var express = require('express');
var mongoose = require('mongoose');
var config = require('./config/conf');

// Connect to database
mongoose.connect(config.mongo.uri, config.mongo.options);

// Populate DB with sample data

// Setup server
var app = express();
var server = require('http').createServer(app);
require('./config/express')(app);
require('./routes')(app);
server.on('connection', function (socket) {
    socket.on('close', function () {
        var id = socket.CurrentIntId
        clearInterval(id);
    });
});
// Start server
server.listen(config.port, function () {
    console.log('Express server listening on %d', config.port);
});

// Expose app
exports = module.exports = app;
