"use strict";

var express = require('express');
var router = express.Router();
var got = require('got');
var _ = require('lodash');
var bodyParser = require('body-parser');

const WEATHER_API_KEY = '490b42fe341d6e49ecffb9439bac6dda';

var app = express();
app.use(bodyParser.json());

/**
 * Weather API proxy
 */
router.get('/api/w', function (req, res) {
    const coord = req.query.coord;
    if (!coord) {
        res.sendStatus(500);
    }
    const url = `https://api.forecast.io/forecast/${WEATHER_API_KEY}/${coord}?exclude=minutely,hourly,alerts,flags&units=si`;

    got(url).then(response => {
        res.set('Content-Type', 'application/json');
        res.set('Access-Control-Allow-Origin', '*');
        res.send(response.body);
    });
});

/**
 * Reverse Geocoding proxy
 */
router.get('/api/g', function (req, res) {
    const coord = req.query.coord;
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