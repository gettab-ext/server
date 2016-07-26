"use strict";

var express = require('express');
var got = require('got');
var _ = require('lodash');

var geolocation = require('geolocation');
var weather = require('weather');

var router = express.Router();

/**
 * Weather API proxy
 */
router.get('/w', function (req, res) {

});

/**
 *
 */
router.get('/g', function (req, res) {
    const coord = req.query.coord;
    if (!coord) {
        res.sendStatus(500);
    }

});

router.get('/weather', function(req, res) {
    const clientIP = req.headers['x-forwarded-for'];

    geolocation.getLocation(clientIP).then(location => {

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
            }]
        });
    });

});

module.exports = router;
