var express = require('express');
var got = require('got');
var app = express();

var port = 8210;
var KEY = '490b42fe341d6e49ecffb9439bac6dda';

app.get('/w', function (req, res) {
  var coord = req.query.coord;
  if (!coord) {
    res.sendStatus(500);
  }
  var url = 'https://api.forecast.io/forecast/' + KEY + '/' + coord + '?exclude=minutely,hourly,alerts,flags&units=si';
  got(url).then(response => {
    res.set('Content-Type', 'application/json');
    res.set('Access-Control-Allow-Origin', '*');
    res.send(response.body);
  });
});

app.get('/g', function (req, res) {
  var coord = req.query.coord;
  if (!coord) {
    res.sendStatus(500);
  }
  const url = `https://geocode-maps.yandex.ru/1.x/?geocode=${coord}&format=json&kind=locality&lang=en_US`;
  got(url).then(response => {
    res.set('Content-Type', 'application/json');
    res.set('Access-Control-Allow-Origin', '*');
    res.send(response.body);
  });
});

app.get('/s', function(req, res) {

    const query = req.query.q;
    if (!query) {
        res.sendStatus(500);
    }


});

app.listen(port, function () {
  console.log('Example app listening on port 3000!');
});
