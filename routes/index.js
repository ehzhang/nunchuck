var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.sendfile('views/index.html');
});

router.get('/fling', function(req, res){
  res.sendfile('views/fling.html');
})

module.exports = router;
