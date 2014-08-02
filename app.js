var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');

var app = express();

// Configure Express
var http = require('http').Server(app);
var io = require('socket.io')(http); // Add socket.io
app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Router
app.use('/', routes);

// 404 Middleware
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// --------------------------------

// Socket code
io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('color', function(color){
    console.log(color);
    io.emit('color-broadcast', color)
  });
});


// -------------------------------

// Start the Server listening on 3000
http.listen(3000, function(){
  console.log('listening on *:3000');
});

module.exports = app;
