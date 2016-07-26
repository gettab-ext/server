"use strict";
const got = require('got');
const _ = require('lodash');

const WEATHER_API_KEY = '490b42fe341d6e49ecffb9439bac6dda';

function getWeatherData(latitude, longitude) {
    const coord = `${latitude},${longitude}`;
    const url = `https://api.forecast.io/forecast/${WEATHER_API_KEY}/${coord}?exclude=minutely,hourly,alerts,flags&units=si`;

    return got(url, {json: true}).then(response => {
        const data = response.body;
        const forecastData = _.get(data, 'daily.data') || [];

        return {
            now: {
                feelsLike: _.get(data, 'currently.apparentTemperature'),
                iconCode: _.get(data, 'currently.icon'),
                windSpeed: _.get(data, 'currently.windSpeed'),
                humidity: _.get(data, 'currently.humidity'),
                precipProbability: _.get(data, 'currently.precipProbability')
            },
            forecast: _.map(forecastData, item => {
                return {
                    shortDescription: item.summary,
                    timeLocalStr: item.time,
                    temperatureLow: item.apparentTemperatureMin,
                    temperatureHigh: item.apparentTemperatureMax,
                    iconCode: item.icon
                };
            }),
        };
    });
}

module.exports = {
    getWeatherData: getWeatherData
};
