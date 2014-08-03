(function(window, document){
  'use strict';

  var _instance;

  var nunchuck = {
    get: function() {
      return _instance;
    },
    init: function(type, socket){
      return _instance || new Nunchuck({
        type: type,
        socket: socket
      })
    }
  };

  /**
   * Nunchuck Constructor
   */
  function Nunchuck(options){
    _instance = this;
    this.id = Math.floor(Math.random()*9000) + 1000;
    this.roomId = this.id;
    this.type = options.type;
    this.socket = options.socket;

    if (this.type == 'host'){
      this.socket.emit('nunchuck-create', this.id);
      console.log(this.id);
    }
  }

  Nunchuck.prototype.onJoin = function(callback){
    nunchuck = this;
    this.socket.on('nunchuck-join', function(data){
      nunchuck.roomId = data.id;
      callback(data);
    });
  };

  Nunchuck.prototype.join = function(username, id){
    if (this.type == 'player'){
      this.socket.emit('nunchuck-join', {
        id: id,
        username: username
      });
      this.username = username;
    }
  };

  window.nunchuck = nunchuck;

}(window, document));
