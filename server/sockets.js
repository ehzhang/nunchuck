

var sockets = {};

module.exports = function(io) {

  // Socket code
  io.on('connection', function(socket){
    console.log('a user connected');
    // Create an id, add it to the sockets store

    socket.on('join', function(id){

    });

    socket.on('color', function(color){
      console.log(color);
      io.emit('color-broadcast', color)
    });
  });

};