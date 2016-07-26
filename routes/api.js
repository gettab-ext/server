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
            res.send({
                location: {
                    latitude: location.latitude,
                    longitude: location.longitude,
                    city: location.city
                },
                now: {
                    feelsLike: '',
                    iconCode: '',
                    windSpeed: '',
                    precipProbability: ''
                },
                forecast: [{
                    shortDescription: '',
                    timeLocalStr: '',
                    temperatureLow: '',
                    temperatureHigh: ''
                }],
                weatherData: weatherData
            });
        });
    });

});

module.exports = router;
