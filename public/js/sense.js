(function(window, document){
  'use strict';

  var _instance,
      config;

  var SHAKE_ACCELERATION = 15,
      FLICK_ACCELERATION = 15;

  var sense = {
    get: function() {
      return _instance;
    },
    init: function(options){
      return _instance || new Sense(options)
    }
  };

  /**
   * Constructor
   */
  function Sense(options){
    _instance = this;
    config = options ||
      {
        debug: false,
        alert: false
      };

    if (config.debug) {
      initDebuggingWindow();
    }

  }

  /**
   * Given arguments and default options, return an object containing options and the callback
   * @param args: Array of arguments
   * @param defaultOptions: Object containing default options
   * @returns {{options: *, callback: *}}
   */
  var getArgs = function (args, defaultOptions) {
    var callback;

    if (args.length === 1){
      // We only have the callback, so use default options
      callback = args[0];
      return {
        options: defaultOptions,
        callback: function(data){
          updateDebugger(data);
          showAlert();
          callback(data);
        }
        };
    }

    if (args.length === 2){
      // We have both the callback and an arguments hash
      callback = args[1];
      return {
        options: args[0],
        callback: function(data){
          updateDebugger(data);
          showAlert();
          callback(data);
        }
      }
    }
  };

  /**
   * Show a debugger with data on the
   * @param data
   */
  var initDebuggingWindow = function(){
    if (config.debug){
      var el = document.createElement('div');
      el.innerHTML = "" +
          "<div id='sense-debugger' style='position:fixed; right:0; bottom:0; color: white; background: black; padding: 20px; font-size: 2em'>" +
          "</div>";
      window.onload = function(){
        document.body.appendChild(el);
      }
    }
  };

  /**
   * Update the debugger div
   * @param data: JSON
   */
  var updateDebugger = function(data){
    if (config.debug){
      document.getElementById('sense-debugger')
          .innerText = JSON.stringify(data, undefined, 2);
    }
  };

  var showAlert = function(){
    if (config.alert){
      var el = document.createElement('div');
      el.innerHTML = "" +
          "<div id='sense-alert' " +
          "style='position:fixed; top: 0; left:0; width:100%; height: 100%; " +
          "color: white; background:#99CC00; z-index:9999;'>" +
          "<h1> Sensed! </h1>" +
          "</div>";
      document.body.appendChild(el);
      setTimeout(function(){
        document.body.removeChild(el);
      }, 2500)
    }
  };

  /**
   * Orientation ([options], callback)
   * - Options:
   *    alphaThreshold (number)
   *    betaThreshold (number)
   *    gammaThreshold (number)
   *    radians (boolean)
   *
   * - Data:
   *    alpha (num)
   *    beta (num)
   *    gamma (num)
   */
  Sense.prototype.orientation = function() {
    if (window.DeviceOrientationEvent) {
      var defaults = {
            alphaThreshold: 0,
            betaThreshold: 0,
            gammaThreshold: 0,
            radians: false
          },
          args = getArgs(arguments, defaults),
          callback = args.callback,
          options = args.options,
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
          callback(data);
          prevData = data;
        }
      })

    }
  };

  /*
    Tilt function!
   */
  Sense.prototype.tilt = function() {
    if (window.DeviceOrientationEvent) {
      var callback,
          options = {
            threshold: 5,
            direction: "both",
            gestureDuration: 500
          },
          args = getArgs(arguments, options),
          lastSample,
          intervalExpired = true;

      callback = args.callback;
      options = args.options;

      setInterval(function(){intervalExpired = true}, options.gestureDuration)

      window.addEventListener('deviceorientation', function(eventData){
        // Here, you take the eventData and the options that you have and
        // process the data, and then feed it to the callback
        if(intervalExpired) {
          lastSample = eventData.gamma;
          intervalExpired = false;
        }
        var delta = lastSample - eventData.gamma;

        if(delta > options.threshold) {
          lastSample = eventData.gamma;
          var data = {
            direction: "LEFT",
            magnitude: Math.round(delta)

          };
          callback(data);
        }

        if(delta < -options.threshold) {
          lastSample = eventData.gamma;
          var data = {
            direction: "RIGHT",
            magnitude: Math.round(-delta)
          };
          callback(data);
        }

      })
    }
  };

  /**
   * Flick ([options], callback)
   * - Options:
   *    interval (int)
   *    sensitivity
   *
   * - Data:
   *    direction String 'left', 'right'
   *    magnitude (float)
   */
  Sense.prototype.flick = function() {
    if (window.DeviceMotionEvent) {
      var defaults = {
            interval: 150,
            sensitivity: 1
          },
          args = getArgs(arguments, defaults),
          callback = args.callback,
          options = args.options;

      var flicking = false;

      window.addEventListener('devicemotion', function (eventData) {

        var acceleration = eventData.acceleration;

        if (Math.abs(acceleration.x) > options.sensitivity * FLICK_ACCELERATION) {
          if (!flicking){
            flicking = true;
            callback({
              direction: acceleration.x > 0 ? 'left' : 'right',
              magnitude: Math.abs(acceleration.x)
            });
            setTimeout(function(){
              flicking = false;
            }, options.interval);
          }
        }
      })
    }
  };

  Sense.prototype.fling = function() {
    if (window.DeviceMotionEvent) {
      var THROW_ACCELERATION = 10;
      var defaults = {
            interval: 150,
            sensitivity: 1
          },
          args = getArgs(arguments, defaults),
          callback = args.callback,
          options = args.options;

      var throwing = false;

      window.addEventListener('devicemotion', function (eventData) {

        var acceleration = eventData.acceleration;

        if (acceleration.z > options.sensitivity * THROW_ACCELERATION) {
          if (!throwing){
            throwing = true;
            callback({
              magnitude: Math.abs(acceleration.z)
            });
            setTimeout(function(){
              throwing = false;
            }, options.interval);
          }
        }
      })
    }
  };

  Sense.prototype.flip = function() {
    var gammas = [];
    if (window.DeviceOrientationEvent) {
      var callback,
          options = {
            gestureDuration: 250
          },
          args = getArgs(arguments, options),
          intervalExpired = false;

      callback = args.callback;
      options = args.options;

      setInterval(function(){intervalExpired = true}, options.gestureDuration);

      window.addEventListener('deviceorientation', function(eventData){
        var final_gamma = 0;
        var found = false;
        if(intervalExpired) {
          gammas[gammas.length] = eventData.gamma;
          for (var i=1; i < 5; i++) {
            if (Math.abs(gammas[gammas.length-1] - gammas[gammas.length-1-i]) > 160) {
              found = true;
              final_gamma = gammas[gammas.length - 1];
              gammas = [];
              break;
            }
          }
          intervalExpired = false;
        }

        if (found) {
          var data = {
            magnitude: Math.round(final_gamma)
          };
          callback(data);
        }
      })
    }
  };


  /*
   Tilt scrolling!
   */
  Sense.prototype.addTiltScroll = function(optns) {
    if (window.DeviceOrientationEvent) {
      var options = optns == null ? {
          maxHorizontalAngle: 80,
          maxHorizontalOffset: 100,
          maxHorizontalSpeed: 15,
          maxVerticalAngle: 40,
          maxVerticalOffset: 100,
          maxVerticalSpeed: 15
        } : optns,
        lastNormHAngle = 0,
        lastNormVAngle = 0;

      var horizontalFrameOffset = -options.maxHorizontalAngle/2,
        verticalFrameOffset = -options.maxVerticalAngle/2;

      window.addEventListener('deviceorientation', function(eventData){
        var hAngle = eventData.gamma,
          vAngle = -eventData.beta;

        if(hAngle < horizontalFrameOffset){
          horizontalFrameOffset = hAngle;
        }

        if(hAngle > horizontalFrameOffset + options.maxHorizontalAngle){
          horizontalFrameOffset = hAngle - options.maxHorizontalAngle;
        }

        if(vAngle < verticalFrameOffset){
          verticalFrameOffset = vAngle;
        }

        if(vAngle > verticalFrameOffset + options.maxVerticalAngle){
          verticalFrameOffset = vAngle - options.maxVerticalAngle;
        }

        var normalHAngle = (hAngle - horizontalFrameOffset) * 2 /options.maxHorizontalAngle - 1.0,
          normalVAngle = (vAngle - verticalFrameOffset) * 2 /options.maxVerticalAngle - 1.0,
          positionHDelta = (normalHAngle - lastNormHAngle) * options.maxHorizontalOffset,
          positionVDelta = (normalVAngle - lastNormVAngle) * options.maxVerticalOffset;

        if(lastNormHAngle != 0)

        lastNormHAngle = normalHAngle;
        lastNormVAngle = normalVAngle;

        var data = {
          scrollByX: clippingMap(normalHAngle) * options.maxHorizontalSpeed + positionHDelta,
          scrollByY: clippingMap(normalVAngle) * options.maxVerticalSpeed + positionVDelta
        };

        function clippingMap(num) {
          var quadraticWidth = .6,
            transition = 1.0 - quadraticWidth;
          if (Math.abs(num) < transition) return 0;
          if (num > 0) return Math.pow((num - transition) / quadraticWidth, 2);
          return -Math.pow((num + transition) / quadraticWidth, 2)
        }
        window.scrollBy(data.scrollByX, data.scrollByY);
      })
    }
  };

  window.sense = sense;

}(window, document));
