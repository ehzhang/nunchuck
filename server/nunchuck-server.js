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

      var response = {
        username: msg.username,
        id: msg.id,
        success: false,
        msg: "Unknown Error"
      };

      if (type !== 'host' && rooms[msg.id]){

        socket.join(msg.id);
        console.log("User " + msg.username + " joined room " + msg.id);
        type = 'player';

        response.success = true;
        response.msg = "Successfully joined room.";

        io.to(msg.id).emit('nunchuck-join', response);
        return
      }

      if (type === 'host'){
        response.msg = "Hosts cannot join rooms."
      }

      if (!rooms[msg.id]){
        response.msg = "That room doesn't exist!"
      }

      socket.emit('nunchuck-join', response);

    });

    socket.on('nunchuck-data', function(data){
      if (type === 'player'){
        io.to(data.roomId).emit('nunchuck-data', data)
      }
    })
  });
};