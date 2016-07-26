"use strict";

var express = require('express');
var router = express.Router();

var got = require('got');
var _ = require('lodash');

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
    const coord = req.query.coord;
    if (!coord) {
        res.sendStatus(500);
    }

    console.log('req', req);

    res.send({
        location: {
            latitude: '',
            longitude: '',
            city: ''
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

module.exports = router;
