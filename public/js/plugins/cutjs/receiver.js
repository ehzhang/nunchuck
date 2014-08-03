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
  var possible_commands = ["leftArrow", "rightArrow", "upArrow", "downArrow", "A", "B", "LT", "RT", "start"];
  var pressed_buttons = obj.buttons;
  var orientation = obj.orientation;
  var user_id = obj.id;

  // change this
  var active_commands = {"leftArrow":37, "rightArrow":39, "upArrow":38, "downArrow":40};


//  console.log(pressed_buttons);
//  console.log("in move plane: " + down_keys);

  for (var i=0; i<possible_commands.length; i++) {
    command = possible_commands[i];
    if (pressed_buttons.indexOf(command) > -1) {
      player_data[user_id][active_commands[command]] = true;
//      console.log(down_keys);
    } else if (active_commands[command]) {
      player_data[user_id][active_commands[command]] = false;
    }
  }

  if (orientation["beta"] > 20.0) {
    player_data[user_id][active_commands["rightArrow"]] = true;
  } else if (orientation["beta"] < -20.0) {
    player_data[user_id][active_commands["leftArrow"]] = true;
  } else {
    player_data[user_id][active_commands["leftArrow"]] = false;
  }

  if (orientation["gamma"] > 0.0) {
    player_data[user_id][active_commands["upArrow"]] = true;
  } else if (orientation["gamma"] < -40.0) {
    player_data[user_id][active_commands["downArrow"]] = true;
  } else {
    player_data[user_id][active_commands["downArrow"]] = false;
  }
}

// {
//   username: "Katie",
//   id: "1234",
//   success: true
// }



