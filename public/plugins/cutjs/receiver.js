// {
//   username: "Katie" // string (to show in game)
//   id: "1234" // 4 digit number
//   buttons: ["A"] //string, empty if acceleration event
//   orientation: 
//   {
//     alpha : 0.0
//     beta : 0.0
//     gamma : 0.0
//   } //string, empty if button event
//   timestamp: "18375235899" // ms since epoch (timestamp)
// }

// POTENTIAL BUTTONS
// “leftArrow”
// ”rightArrow”
// ”upArrow”
// ”downArrow”
// “A”
// “B”
// “LT”
// “RT”
// “start”

// Sample call:
// movePlane({username: "katie", id: "1234", buttons: ["leftArrow"], orientation: {alpha: 0.0, beta: 0.0, gamma: 0.0}, timestamp: "1238794"});

movePlane = function(obj) {
  var possible_commands = ["LEFT", "RIGHT", "UP", "DOWN", "A", "B", "START"];
  var pressed_buttons = obj.buttons;
  var orientation = obj.orientation;
  var user_id = obj.id;

  // change this
  var active_commands = {"LEFT":37, "RIGHT":39, "UP":38, "DOWN":40};


  for (var i=0; i<possible_commands.length; i++) {
    command = possible_commands[i];
    if (pressed_buttons.indexOf(command) > -1) {
      player_data[user_id][active_commands[command]] = true;
    } else if (active_commands[command]) {
      player_data[user_id][active_commands[command]] = false;
    }
  }

  if (obj.buttons.indexOf('A') > -1){
    if (drones[user_id]){
      drones[user_id].shoot();
    }
  }

  if (obj.buttons.indexOf('START') > -1){
    if (!drones[user_id]){
      createPlane(user_id);
    }
  }

  if (orientation["beta"] > 20.0) {
    player_data[user_id][active_commands["RIGHT"]] = true;
  } else if (orientation["beta"] < -20.0) {
    player_data[user_id][active_commands["LEFT"]] = true;
  } else {
    player_data[user_id][active_commands["LEFT"]] = false;
  }

  if (orientation["gamma"] > 0.0) {
    player_data[user_id][active_commands["UP"]] = true;
  } else if (orientation["gamma"] < -40.0) {
    player_data[user_id][active_commands["DOWN"]] = true;
  } else {
    player_data[user_id][active_commands["DOWN"]] = false;
  }
}


