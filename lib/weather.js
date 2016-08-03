"use strict";
const config = require('../etc/config');
const _ = require('lodash');
const logger = require('winston');
const Promise = require("bluebird");
const redis = require('redis');
const forecastio = require('./forecastio');
const cache = require('./cache');

function getCacheKey(latitude, longitude, locationName) {
    if (locationName) {
        return `weather_${locationName}`;
    } else {
        const latitudeRounded = Number(latitude).toFixed(1);
        const longitudeRounded = Number(longitude).toFixed(1);
        return `weather_${latitudeRounded}_${longitudeRounded}`
    }
}

function getWeatherData(latitude, longitude, locationName, mock) {
    const cacheKey = getCacheKey(latitude, longitude, mock);

    return cache.getAsync(cacheKey).then(cachedData => {
        if (!cachedData) {
            return forecastio.getData(latitude, longitude, mock)
                .tap(forecastData => {
                    cache.set(cacheKey, JSON.stringify(forecastData), 'EX', config.weatherCacheTTL);
                });
        } else {
            return JSON.parse(cachedData);
        }
    });
}

module.exports = {
    getWeatherData: getWeatherData
};
