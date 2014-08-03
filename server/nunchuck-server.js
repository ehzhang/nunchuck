// Socket acts as a key-value store for routing
module.exports = function(io) {

  // Socket code
  io.on('connection', function(socket){
    console.log('A user connected');

    socket.on('nunchuck-create', function(id){
      console.log("create", id);
      socket.join(id);
    });

    socket.on('nunchuck-join', function(msg){

      socket.join(msg.id);
      console.log('join', msg.id);

      io.to(msg.id).emit('nunchuck-join',
        {
          username: msg.username,
          id: msg.id,
          success: true
        });

    });

  });

};