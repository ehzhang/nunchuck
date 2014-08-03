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
    this.username = "";
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
      var err;
      nunchuck.roomId = data.id;
      if (nunchuck.type === 'player'){
        nunchuck.send();
      }
      if (!data.success){
        err = {
          msg: data.msg
        }
      }
      callback(data, err);
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

  Nunchuck.prototype.send = function() {

    if (window.DeviceOrientationEvent) {
      var options = {
            alphaThreshold: 5,
            betaThreshold: 5,
            gammaThreshold: 5,
            radians: false
          },
          prevData = {
            alpha: 0,
            beta: 0,
            gamma: 0
          };

      window.addEventListener('deviceorientation', function (eventData) {

        var data = {
          alpha: options.radians ? eventData.alpha * Math.PI / 180.0 : eventData.alpha,
          beta: options.radians ? eventData.beta * Math.PI / 180.0 : eventData.beta,
          gamma: options.radians ? eventData.gamma * Math.PI / 180.0 : eventData.gamma
        };

        if(Math.abs(data.alpha - prevData.alpha) >= options.alphaThreshold ||
            Math.abs(data.beta - prevData.beta) >= options.betaThreshold ||
            Math.abs(data.gamma - prevData.gamma) >= options.gammaThreshold
            ) {

          _instance.socket.emit('nunchuck-data',
            {
              username: _instance.username,
              roomId: _instance.roomId,
              buttons: [],
              orientation: data,
              timestamp: Date.now()
            });
          prevData = data;
        }
      })
    }
  };

  Nunchuck.prototype.receive = function(callback){
    this.socket.on('nunchuck-data', function(data){
      callback(data);
    })
  };


  window.nunchuck = nunchuck;

}(window, document));
