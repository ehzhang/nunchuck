function World() {
  this.objects = [];

  this.running = false;
}

World.prototype.init = function(width, height) {
  this.time = +new Date();
  this.elapsed = 0;
  this.resize(width, height);
  return this;
};

World.prototype.addObject = function(obj) {
  obj.world = this;
  this.objects.push(obj);
  obj.uiCreate(this);
  return obj;
};

World.prototype.removeObject = function(obj) {
  for (var i=0; i<this.objects.length; i++) {
    if (this.objects[i].playerId == obj.playerId) {
      this.objects.splice(i,1);
      obj.uiRemove(this);
    }
  }
};

World.prototype.resize = function(width, height) {
  this.width = width;
  this.height = height;
  this.xMin = -(this.xMax = this.width / 2);
  this.yMin = -(this.yMax = this.height / 2);
  // this.uiUpdate();
  return this;
};

World.prototype.run = function(run) {
  var started = false;
  if (!arguments.length) {
    run = true;
  }
  if (!this.running && run) {
    this.calculateElapsed();
    started = true;
  }
  this.running = run;
  return started;
};

World.prototype.animate = function() {
  if (this.running) {
    var t = Math.min(100, this.calculateElapsed());
    this.objects.forEach(function(obj) {
      obj.animate(t);
    });
  }
};

World.prototype.calculateElapsed = function() {
  var now = +new Date();
  this.elapsed = (now - this.time);
  this.time = now;
  return this.elapsed;
};

function Splat(xloc, yloc) {

  this.x = xloc;
  this.y = yloc;
  console.log(this.x);
  console.log(this.y);
};

Splat.prototype.uiCreate = function(world) {
  this.world = world;
  this.ui = (this.ui || Cut.image("splat:splat1").pin("handle", 0.5))
    .appendTo(world.ui);
  console.log(this.ui);
};

Splat.prototype.uiUpdate = function() {
  if (!this.ui)
    return;
  var x = this.x;
  var y = this.y;

  var pin = {
    rotation : 0,
    scaleY : 1
  };

  this.ui.xy(x, y).pin(pin);
}

Splat.prototype.animate = function(t) {
  this.uiUpdate();
};

function Drone(vMin, vMax, aMax,type) {
  this.x = Math.floor(Math.random() * 100);
  this.y = Math.floor(Math.random() * 100);
  this.vMin = vMin;
  this.vMax = vMax;
  this.aMax = aMax;
  this.vx = vMin;
  this.vy = 0;
  this.v = vMin;
  this.dir = 0;
  this.rotation = 0;
  this.opacity = 1;
  this.selected = 0;
  this.flying = true;
  this.type = type;
  this.temp = {};
}

Drone.prototype.fly = function(stop) {
  this.flying = stop !== false;
  return this;
};

Drone.prototype.animate = function(t) {
  if (!this.flying || !t) {
    return;
  }

  var m = 0, n = 0;

  if (this.accOrbit && this.accOrbit(this.temp, t)) {
    var p = this.x - this.temp.x;
    var q = this.y - this.temp.y;
    var inn = p * this.vx + q * this.vy;
    var out = p * this.vy - q * this.vx;
    var b = out * 2 / t;
    var v2 = this.v * this.v;
    var d = b * b - 4 * v2 * (v2 + inn * 2 / t);
    if (d >= 0) {
      d = Math.sqrt(d);
      var m1 = (b - d) / 2 / v2 * this.v / t;
      var m2 = (-b - d) / 2 / v2 * this.v / t;
      m = Math.abs(m1) <= Math.abs(m2) ? -m1 : m2;
    }

    // var x = this.temp.y - this.y;
    // var y = -(this.temp.x - this.x);
    // var out = x * this.vy - y * this.vx;
    // var inn = x * this.vx + y * this.vy;
    // if (out < 0) {
    // m = out / inn / t / (this.aMax / this.v);
    // }

  } else if (this.accAbsolute && this.accAbsolute(this.temp, t, this.playerId)) {
    var x = this.temp.x;
    var y = this.temp.y;
    var d = M.length(x, y);
    m = (x * this.vy - y * this.vx) / this.v / d * this.aMax;

  } else if (this.accRelative && this.accRelative(this.temp, t, this.playerId)) {
    n = this.temp.main * 0.001;
    m = this.temp.side * this.aMax;
  }

  if (m || n) {
    m = M.limit(m, -this.aMax, this.aMax);
    m = m / this.v;

    this.vx += +this.vx * n * t;
    this.vy += +this.vy * n * t;

    this.vx += +this.vy * m * t;
    this.vy += -this.vx * m * t;

    var v = M.length(this.vx, this.vy);
    this.v = M.limit(v, this.vMin, this.vMax);
    v = this.v / v;
    this.vx *= v;
    this.vy *= v;

    var dir = Math.atan2(this.vy, this.vx);
    this.rotation = (this.rotation * (200 - t) + M.rotate(this.dir - dir,
        -Math.PI, Math.PI)) / 200;
    this.dir = dir;

  } else {
    this.rotation = (this.rotation * (200 - t)) / 200;
  }

  this.x = M.rotate(this.x + this.vx * t, this.world.xMin, this.world.xMax);
  this.y = M.rotate(this.y + this.vy * t, this.world.yMin, this.world.yMax);
  player_data[this.playerId]["locationX"] = this.x;
  player_data[this.playerId]["locationY"] = this.y;

  if (this.playerId[this.playerId.length - 1] == "a" && (
      this.x + this.vx * t > this.world.xMax ||
      this.x + this.vx * t < this.world.xMin ||
      this.y + this.vy * t > this.world.yMax ||
      this.y + this.vy * t < this.world.yMin)) {

    if (drones[this.playerId]){
      var bullet = drones[this.playerId];
      delete drones[this.playerId];
      bullet.destruct();
    }
  }

  this.uiUpdate();

  var CRASH_SEPARATION_INDEX = 10

  var keys = Object.keys(drones);
  for(var i=0; i<keys.length; i++) {
    if (keys[i] != this.playerId && (this.playerId[this.playerId.length-1] != "a" || keys[i][keys[i].length-1] != "a")) {
      var other_x = player_data[keys[i]]["locationX"];
      var other_y = player_data[keys[i]]["locationY"];

      if (Math.abs(this.x-other_x) < CRASH_SEPARATION_INDEX && Math.abs(this.y-other_y) < CRASH_SEPARATION_INDEX) {
        console.log("dead: ", other_x, this.x);
        console.log("deady: ", other_y, this.y);
        var dead1 = drones[this.playerId];
        var dead2 = drones[keys[i]];
        delete drones[this.playerId];
        delete drones[keys[i]];

        if (dead1){
          dead1.destruct();
        }
        if (dead2){
          dead2.destruct();
        }

      }
    }
  }
};

Cut(function(root, canvas) {

  Cut.Mouse(root, canvas);

  var world = new World();
  var _down_mouse = {
    x : 0,
    y : 0
  };

  world.ui = root.viewbox(300, 300).listen("viewport", function(width, height) {
    world.resize(this.pin("width"), this.pin("height"));
  }).pin("handle", -0.5).spy(true);

  root.tick(function() {
    world.animate();
  });

  world.init(0, 0);

  // Control
  var speed = 100 / 1000;
  var acc = speed * 2 / 1000;
  drones = {};

  var accelerateRelative = function(o, t, playerId) {
    o.main = player_data[playerId][38] ? +1 : player_data[playerId][40] ? -1 : 0;
    o.side = player_data[playerId][37] ? +1 : player_data[playerId][39] ? -1 : 0;
    return o.side || o.main;
  };

  var accelerateAbsolute = function(o, t, playerId) {
    o.x = player_data[playerId][65] ? -1 : player_data[playerId][68] ? +1 : 0;
    o.y = player_data[playerId][87] ? -1 : player_data[playerId][83] ? +1 : 0;

    if (o.x || o.y) {
      return true;
    }

    if (b0 !== null && g0 !== null) {
      o.x = M.rotate(g - g0, -180, 180) / 180;
      o.y = M.rotate(b - b0, -180, 180) / 180;
      var min = 0.05;
      return o.x > min || o.x < -min || o.y > min || o.y < -min;
    }

    return false;
  };

  var accelerateOrbit = function(o, t) {
    if (!_down_mouse.valid) {
      return false;
    }
    o.x = _down_mouse.x;
    o.y = _down_mouse.y;
    return true;
  };

  var destructSelf = function() {
    // console.log("asdfasdf", this.x, this.y);
    var x_ind = this.x;
    var y_ind = this.y;
//    console.log("earlierx: ",x_ind);
//    console.log("earliery: ",y_ind);
    if (navigator && navigator.vibrate){
      navigator.vibrate(1000);
    }
    world.removeObject(this);
    if (this.playerId[this.playerId.length-1]!='a') {
      world.addObject(new Splat(x_ind, y_ind));
    }
  };

  // var createBullet = function() {
  //   var x_ind = this.x;
  //   var y_ind = this.y;
  //   var x_vel = this.vx*1.5;
  //   var y_vel = this.vy*1.5;
  //   var bullet_new = world.addObject(new Bullet(x_ind, y_ind, x_vel, y_vel));
  //   bullets[parseInt(Math.random()*1000000)] = bullet_new;
  // }

  createPlane = function(playerId) {
    if (!drones[playerId]){
      var drone_new = world.addObject(new Drone(speed, speed * (Math.random()+1), acc, 'plane'));
      drone_new.playerId = playerId;
      player_data[drone_new.playerId] = {};
      drone_new.accRelative = accelerateRelative;
      drone_new.accAbsolute = accelerateAbsolute;
      drone_new.accOrbit = accelerateOrbit;
      drone_new.destruct = destructSelf;
      // drone_new.fire = createBullet;
      drones[drone_new.playerId] = drone_new;
      return drone_new;
    }
  };

  createBullet = function(playerId, x, y, dir, vx, vy) {
    var drone_new = world.addObject(new Drone(speed*1.5, speed*3, acc, 'bullet'));
    drone_new.x = x;
    drone_new.y = y;
    drone_new.dir = dir;
    drone_new.playerId = playerId;
    player_data[drone_new.playerId] = {};
    drone_new.accRelative = accelerateRelative;
    drone_new.accAbsolute = accelerateAbsolute;
    drone_new.accOrbit = accelerateOrbit;
    drone_new.destruct = destructSelf;
    drones[drone_new.playerId] = drone_new;
    drone_new.vx = vx*2;
    drone_new.vy = vy*2;
    return drone_new;
  };

  // Keyboard

  document.onkeydown = function(e) {
    world.run(true);
//    console.log('keydown');
//    console.log(e);
    root.touch();
    // if (e.keyCode == 32) {
    //   // xx = drones[this.playerId].x
    //   // y = drones[this.playerId].y
    //   var bulletId = Math.floor(Math.random()*9000000 + 1000000);
    //   createBullet(bulletId, this.x, this.y);
    // }

//    player_data[drone.playerId][e.keyCode] = true;
  };
  document.onkeyup = function(e) {
    e = e || window.event;
//    player_data[drone.playerId][e.keyCode] = false;
  };

  // Mouse
  world.ui.listen(Cut.Mouse.START, function(ev, point) {
    world.run(true);
    root.touch();
    if (b !== null && g !== null) {
      a0 = a;
      b0 = b;
      g0 = g;
    } else {
      _down_mouse.x = point.x;
      _down_mouse.y = point.y;
      _down_mouse.valid = true;
    }
    return true;

  }).listen(Cut.Mouse.END, function(ev, point) {
    a0 = b0 = g0 = null;
    _down_mouse.valid = false;
    return true;

  }).listen(Cut.Mouse.MOVE, function(ev, point) {
    if (_down_mouse.valid) {
      _down_mouse.x = point.x;
      _down_mouse.y = point.y;
    }
    return true;

  });

  // Tilting

  var a0 = null, b0 = null, g0 = null, a = null, b = null, g = null, o = null, update = 0;

  // $status.bind("mousedown touchstart", function(e) {
  // a0 = a;
  // b0 = b;
  // g0 = g;
  // return false;
  // });

  // window.addEventListener("deviceorientation", function(event) {
  // var now = +new Date;
  // if (update < now - 300) {
  // update = now;
  // a = event.alpha;
  // b = event.beta;
  // g = event.gamma;
  // o = window.orientation;
  // if (_.isNumber(a) && _.isNumber(a) && _.isNumber(g)) {
  // $status.text(Math.round(a) + ", " + Math.round(b) + ", "
  // + Math.round(g) + " (" + (o || 0) + ")");
  // }
  // }
  // }, true);

  // function resize(event) {
  // var h = $(window).height();
  // var w = $(window).width();
  // var o = window.orientation;
  // DEBUG && console.log(o, w, h);
  // if (o) {
  // var transform = "translate(" + (-h / 2) + "px," + (-w / 2)
  // + "px) rotate(" + -o + "deg) translate(" + (-h / 2 * o / 90)
  // + "px," + (w / 2 * o / 90) + "px) ";
  // $world.css({
  // transform : transform
  // });
  // world.resize(h, w);
  // } else {
  // $world.css({
  // transform : "",
  // });
  // world.resize(w, h);
  // }
  // return false;
  // }
  // $(window).bind('orientationchange', resize);

});

Drone.prototype.uiCreate = function(world) {
  this.world = world;
  if (this.type === 'plane') {
    if (Object.keys(player_data).length%5==0) {
      this.ui = (this.ui || Cut.image("base:drone1").pin("handle", 0.5))
        .appendTo(world.ui);
    } else if (Object.keys(player_data).length%5==1) {
      this.ui = (this.ui || Cut.image("base:drone2").pin("handle", 0.5))
        .appendTo(world.ui);
    } else if (Object.keys(player_data).length%5==2) {
      this.ui = (this.ui || Cut.image("base:drone3").pin("handle", 0.5))
        .appendTo(world.ui);
    } else if (Object.keys(player_data).length%5==3) {
      this.ui = (this.ui || Cut.image("base:drone4").pin("handle", 0.5))
        .appendTo(world.ui);
    } else {
      this.ui = (this.ui || Cut.image("base:drone5").pin("handle", 0.5))
        .appendTo(world.ui);
    }
  } else if (this.type === 'bullet') {
    this.ui = (this.ui || Cut.image("base:bullet").pin("handle", 0.5))
        .appendTo(world.ui);
  }

  this.uiUpdate();
};

Drone.prototype.uiUpdate = function() {
  if (!this.ui)
    return;
  var x = this.x;
  var y = this.y;

  var pin = {
    rotation : this.dir,
    scaleY : 1 - Math.abs(this.rotation) / Math.PI * 400
  };

  this.ui.xy(x, y).pin(pin);
};

Drone.prototype.uiRemove = function() {
  if (this.ui) {
    this.ui.remove();
    this.ui = null;
  }
};

Drone.prototype.shoot = function () {
  var bulletId = Math.floor(Math.random()*9000000 + 1000000);
  bulletId += 'a';
  createBullet(bulletId, this.vx * 200 + this.x, this.vy * 200 + this.y, this.dir, this.vx, this.vy);
};

var M = Cut.Math;

M.limit = function(value, min, max) {
  if (value > max) {
    return max;
  } else if (value < min) {
    return min;
  } else {
    return value;
  }
};

Cut.prototype.xy = function(x, y) {
  this.pin({
    offsetX : x,
    offsetY : y
  });
  return this;
};

Cut.prototype.x = function(x) {
  if (!arguments.length) {
    return this.pin("offsetX");
  }
  this.pin("offsetX", x);
  return this;
};

Cut.prototype.y = function(y) {
  if (!arguments.length) {
    return this.pin("offsetY");
  }
  this.pin("offsetY", y);
  return this;
};
