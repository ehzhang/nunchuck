var rooms = {};

module.exports = function(io) {

  // Socket code
  io.on('connection', function(socket){
    console.log('A user connected');

    var type, _id;

    socket.on('disconnect', function(){
      if (type === 'host' && _id){
        delete rooms[_id]
      }
    });

    socket.on('nunchuck-create', function(id){
      socket.join(id);
      console.log("Created a room with ID: " + id);
      rooms[id] = true;
      type = 'host';
      _id = id;
      console.log(rooms);
    });

    socket.on('nunchuck-join', function(msg){
      if (type !== 'host' && rooms[msg.id]){
        socket.join(msg.id);
        console.log("User " + msg.username + " joined room " + msg.id);
        type = 'player';

        io.to(msg.id).emit('nunchuck-join',
          {
            username: msg.username,
            id: msg.id,
            success: true
          });
      } else {
        socket.emit('nunchuck-join',
          {
            username: msg.username,
            id: msg.id,
            success: false
          });
      }
    });

    socket.on('nunchuck-data', function(data){
      if (type === 'player'){
        io.to(data.roomId).emit('nunchuck-data', data)
      }
    })
  });
};