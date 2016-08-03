"use strict";
const config = require('../etc/config');
const got = require('got');
const _ = require('lodash');
const fs = require('fs');
const logger = require('winston');
const Promise = require("bluebird");
const redis = require('redis');

Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);

const redisClient = redis.createClient(config.redisServer);

const FORECAST_IO_API_KEY = '490b42fe341d6e49ecffb9439bac6dda';

const forecastIOIconCodeMapping = {
    'clear-day': 'day-clear',
    'clear-night': 'night-clear',
    'rain': 'cloud-showers',
    'snow': 'cloud-snow',
    'sleet': 'cloud-snow',
    'wind': 'wind-strong',
    'fog': 'cloud-fog-1',
    'cloudy': 'cloud-1',
    'partly-cloudy-day': 'day-cloud'
};
const defaultIcon = 'day-cloud';

function getIconCode(iconCode) {
    return (forecastIOIconCodeMapping[iconCode] || defaultIcon);
}

function getCacheKey(latitude, longitude, locationName) {
    if (locationName) {
        return `weather_${locationName}`;
    } else {
        const latitudeRounded = Number(latitude).toFixed(1);
        const longitudeRounded = Number(longitude).toFixed(1);
        return `weather_${latitudeRounded}_${longitudeRounded}`
    }
}

const weatherMock = JSON.parse(fs.readFileSync('./mocks/weather.json'));

function parseForecastIOData(data) {
    const forecastData = _.get(data, 'daily.data') || [];

    return {
        now: {
            feelsLike: _.get(data, 'currently.apparentTemperature'),
            iconCode: getIconCode(_.get(data, 'currently.icon')),
            windSpeed: _.get(data, 'currently.windSpeed'),
            humidity: _.get(data, 'currently.humidity'),
            precipProbability: _.get(data, 'currently.precipProbability')
        },
        forecast: _.map(forecastData, item => {
            return {
                shortDescription: item.summary,
                timeLocalStr: `${item.time}000`,
                temperatureLow: item.apparentTemperatureMin,
                temperatureHigh: item.apparentTemperatureMax,
                iconCode: getIconCode(item.icon)
            };
        }),
    };
}

function getForecastIOData(latitude, longitude, locationName, mock) {
    const coord = `${latitude},${longitude}`;
    const url = `https://api.forecast.io/forecast/${FORECAST_IO_API_KEY}/${coord}?exclude=minutely,hourly,alerts,flags&units=si`;

    if (mock) {
        return Promise.resolve(parseForecastIOData(weatherMock));
    }

    return Promise.resolve(got(url, {json: true})).then(response => {
        return parseForecastIOData(response.body);
    });
}

function getWeatherData(latitude, longitude, mock) {
    const cacheKey = getCacheKey(latitude, longitude, mock);

    return redisClient.getAsync(cacheKey).then(cachedData => {
        if (!cachedData) {
            return getForecastIOData(latitude, longitude, mock)
                .tap(forecastData => {
                    redisClient.set(cacheKey, JSON.stringify(forecastData), 'EX', config.weatherCacheTTL);
                });
        } else {
            return JSON.parse(cachedData);
        }
    });

}

module.exports = {
    getWeatherData: getWeatherData
};
