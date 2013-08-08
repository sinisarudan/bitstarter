var express = require('express');
var fs = require('fs');

var app = express.createServer(express.logger());

app.get('/', function(request, response) {
  process_r(request, response, "index.html");
});

app.get('/css/main.css', function(request, response) {
  process_r(request,response,'css/main.css');
});

var process_r = function(request, response, file){
  console.log(request);
  var res = fs.readFileSync(file, 'utf8');

  response.send(res);
}

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Listening on " + port);
});
