"use strict";

var express = require('express');
var got = require('got');
var _ = require('lodash');

var geolocation = require('../lib/geolocation');
var weather = require('../lib/weather');

var router = express.Router();

router.get('/weather', function(req, res) {
    const clientIP = req.headers['x-forwarded-for'] || req.ip;
    const mock = req.query.mock;

    geolocation.getLocation(clientIP).then(location => {
        weather.getWeatherData(location.latitude, location.longitude, location.city, mock).then(weatherData => {
            res.set('Access-Control-Allow-Origin', '*');
            res.send(_.merge({location: location}, weatherData));
        });
    });
});

module.exports = router;
