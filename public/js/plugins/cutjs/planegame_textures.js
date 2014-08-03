Cut.addTexture({
  name : "base",
  imagePath : "assets/base.png",
  imageRatio : 4,
  ratio : 16,
  filter : function(cut) {
    cut.y = 1 - (cut.y + cut.height);
    return cut;
  },
  cutouts : [
    { name : "drone1", x : 0, y : 0, width : 1, height : 1 },
    { name : "drone2", x : 1, y : 0, width : 1, height : 1 },
    { name : "drone3", x : 2, y : 0, width : 1, height : 1 },
    { name : "drone4", x : 3, y : 0, width : 1, height : 1 },
    { name : "drone5", x : 4, y : 0, width : 1, height : 1 },
    { name : "bullet", x : 5, y : 0, width : 1, height : 1 }
  ]
});

// Cut.addTexture({
//   name : "splat",
//   imagePath : "assets/splat.png",
//   imageRatio : 4,
//   ratio : 16,
//   filter : function(cut) {
//     cut.y = 1 - (cut.y + cut.height);
//     return cut;
//   },
//   cutouts : [
//     { name : "drone1", x : 0, y : 0, width : 1, height : 1 },
//     { name : "drone2", x : 1, y : 0, width : 1, height : 1 },
//     { name : "drone3", x : 2, y : 0, width : 1, height : 1 },
//     { name : "drone4", x : 3, y : 0, width : 1, height : 1 },
//     { name : "bullet", x : 4, y : 0, width : 1, height : 1 }
//   ]
// });