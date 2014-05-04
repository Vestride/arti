var express = require('express'),
    app = express.createServer(),
    io = require('socket.io').listen(app),
    fs = require('fs'),
    utils = require('./utils.js');
    
app.listen(80);
require('./common.js');
require('./config.js')(app, express, io);
require('./controllers/routes.js')(app, fs);
require('./controllers/sockets.js')(io);