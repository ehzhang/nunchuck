# nunchuck.js

A platform for mobile web-based control of browser applications.

Overview
--------

We provide a platform that easily allows developers to integrate mobile browser controls into desktop browser-based javascript games with very few (<15) lines of code.

Made with <3 at YCHacks 2014! 

Pull requests and feature suggestions are welcome.

Demo
------

#### Plane Game

You can play our multiplayer fighter plane demo by navigating to http://nunchuckjs.com/planegame in any desktop browser.

Use your phone as a controller by navigating to http://nunchuckjs.com on a mobile browser, then selecting "CONNECT." Then, choose a username and enter the room ID on the screen of the desktop browser. You will see a plane spawn in the screen that responds to your phone's movements.

Tilt left or right to steer. Tilt forward to accelerate or backwards to decelerate. Press A to fire bullets. Don't run into other planes or bullets, or your plane will crash! Press start to respawn.

#### Mario Kart

You can play our multiplayer MarioKart demo by navigating to http://nunchuckjs.com/snes in any desktop browser.

Use your phone as a controller by navigating to http://nunchuckjs.com on a mobile browser, then selecting "GAMEPAD." You will then be able to use the arrowkeys to select a character. Tilt your phone down or press "B" to select.

Tilt left or right to steer, and tilt forwards and backwards to accelerate and decelerate, respectively. Press A to use items.


Quickstart
----------

Download nunchuck.js and refer to it in any html file to get started!

```javascript
// Socket code in app.js
require('./server/nunchuck-server')(io);
```

```html
// Web browser view
<script src="path/to/nunchuck.js"></script>
<script>
	var socket = io();
	var n = nunchuck.init('host', socket);
    n.onJoin(function(data){
        // do something with data from sender

        n.receive(function(data){
        	// do something with data from sender
        })
    });
</script>
```

Documentation
-------------

### Buttons

nunchuck.js responds to both acceleration and button push events. You can customize the buttons in the mobile browser view. Assign each button a class "nunchuck-button." Also assign each button a unique ID (e.g. "LEFT", "RIGHT", etc.) that will be sent to the receiver (the desktop browser) when that button is pressed.

Sample Usage:
```html
<div class="d-pad">
    <button class="nunchuck-button horizontal" id="LEFT"></button>
    <button class="nunchuck-button vertical" id="DOWN"></button>
    <button class="nunchuck-button vertical" id="UP"></button>
    <button class="nunchuck-button horizontal" id="RIGHT"></button>
</div>
<div class="left commands">
    <button class="nunchuck-button" id="START">START</button>
    <button class="nunchuck-button" id="SELECT">SELECT</button>
</div>
<div class="right commands">
	<button class="nunchuck-button" id="B">B</button>
	<button class="nunchuck-button" id="A">A</button>
</div>
```

### nunchuck.onJoin(callback)

Fired when a phone connects to a channel corresponding to this particular web browser view.

The phone sends a JSON object with the following spec:
```javascript
{
  username: "ksiegel",
  id: "1234",
  success: true,
  msg: ""
}
```

Data              | Description                               
----------------- | -----------------------------------------------------
username          | (string) inputted username of player 
id                | (integer) generated ID of player 
success           | (boolean) whether or not the controller successfully joined a room
msg               | (string) error message if success was false

Sample Usage:
```javascript
n.receive(function(data){
	var user_id = data.id;
})
```


### nunchuck.receive(callback)

Fired on a phone acceleration, button press, or button release event.

The phone sends a JSON object with the following spec:
```javascript
{
  username: "ksiegel",
  id: "1234",
  buttons: ["A"],
  orientation: 
  {
    alpha : 0.0, // float - x axis orientation
    beta : 0.0, // float - y axis orientation
    gamma : 0.0, // float - z axis orientation
  },
  timestamp: "1407091145"
}
```

Data              | Description                               
----------------- | ---------------------------------------------------
username          | (string) inputted username of player 
id                | (integer) generated ID of player 
buttons           | (array) array of button IDs of buttons currently pressed by player
orientation.alpha | (float) degree/radian value for direction the device is
orientation.beta  | (float) degree/radian value for device's front-back tilt
orientation.gamma | (float) degree/radian value for device's left-right tilt  
timestamp         | (long) seconds since epoch

Sample Usage:
```javascript
var socket = io();
var n = nunchuck.init('host', socket);
n.onJoin(function(data){
	var username = data.username;
});
```


To start the demo site locally:

```sh
$ npm install
$ npm start
```

