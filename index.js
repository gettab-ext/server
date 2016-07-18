"use strict";

var express = require('express');
var got = require('got');
var _ = require('lodash');
var bodyParser = require('body-parser');

const PORT = 8210;
const WEATHER_API_KEY = '490b42fe341d6e49ecffb9439bac6dda';
const SUGGEST_LIMIT = 5;

const RE = {
    bingParser: /<div class="sa_tm">(.+?)<\/div>/g,
    tagRemove: /<.+?>/g
};

const suggestTimeout = 500;

const suggestEngines = {
    yahoo(query) {
        const url = `https://search.yahoo.com/sugg/gossip/gossip-us-ura/?output=sd1&command=${query}&appid=fp`;

        return got(url, {
            json: true,
            timeout: suggestTimeout
        }).then(response => {
            if (!response || !response.body || !response.body.r) {
                return null;
            }
            return response.body.r.map(item => {
                return {
                    name: item.k
                };
            }).slice(0, SUGGEST_LIMIT);
        });
    },
    bing(query) {
        const url = `http://www.bing.com/AS/Suggestions?&qry=${query}&cvid=foo`;

        return got(url, {
            timeout: suggestTimeout
        }).then(response => {
            const rawItems = response.body.match(RE.bingParser);
            if (!rawItems) {
                return null;
            }
            return rawItems.map(rawItem => rawItem.replace(RE.tagRemove, '')).map(item => {
                return {
                    name: item
                };
            });
        }, e => {
            console.log('bing', e);
        });
    },
    mystart(query) {
        const url = `https://www.mystart.com/api/get_alternative_searchterms/?q=${encodeURIComponent(query)}&limit=${SUGGEST_LIMIT}`;

        return got(url, {
            json: true,
            timeout: suggestTimeout
        }).then(response => {
            const data = response.body;

            if (typeof data !== 'object' ||
                typeof data.searchresults !== 'object' ||
                typeof data.searchresults.AlsoTryData !== 'object'
            ) {
                return null;
            }
            return data.searchresults.AlsoTryData.map(item => {
                return {
                    name: item
                };
            });
        });
    }
};

const suggestEngineOrder = ['bing', 'yahoo', 'mystart'];

var app = express();
app.use(bodyParser.json());

/**
 * Weather API proxy
 */
app.get('/w', function (req, res) {
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

/**
 * Suggest proxy
 */
app.get('/s', function (req, res) {
    const query = req.query.q;

    if (!query) {
        res.sendStatus(500);
    }

    let engineIndex = 0;

    const getNextSuggest = function() {
        const suggestProvider = suggestEngineOrder[engineIndex];

        suggestEngines[suggestProvider](query).then(items => {
            console.log('items', items);
            if (!items) {
                engineIndex++;
                getNextSuggest();
            } else {
                res.set('Content-Type', 'application/json');
                res.set('Access-Control-Allow-Origin', '*');
                res.send({
                    provider: suggestProvider,
                    result: items
                });
            }
        }).catch(err => {
            console.log(err);
            engineIndex++;
            getNextSuggest();
        });
    };

    getNextSuggest();
});

app.listen(PORT, function () {
    console.log('Example app listening on PORT 3000!');
});
