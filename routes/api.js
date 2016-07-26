"use strict";

var express = require('express');
var got = require('got');
var _ = require('lodash');

var geolocation = require('../lib/geolocation');
var weather = require('../lib/weather');

var router = express.Router();

router.get('/weather', function(req, res) {
    const clientIP = req.headers['x-forwarded-for'];

    geolocation.getLocation(clientIP).then(location => {
        weather.getWeatherData(location.latitude, location.longitude).then(weatherData => {
            res.send(_.merge({location: location}, weatherData));
        });
    });

});

module.exports = router;
