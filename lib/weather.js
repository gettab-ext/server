"use strict";
const got = require('got');
const _ = require('lodash');

const WEATHER_API_KEY = '490b42fe341d6e49ecffb9439bac6dda';

const iconCodeMapping = {
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
    return (iconCodeMapping[iconCode] || defaultIcon);
}

function getWeatherData(latitude, longitude) {
    const coord = `${latitude},${longitude}`;
    const url = `https://api.forecast.io/forecast/${WEATHER_API_KEY}/${coord}?exclude=minutely,hourly,alerts,flags&units=si`;

    return got(url, {json: true}).then(response => {
        const data = response.body;
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
    });
}

module.exports = {
    getWeatherData: getWeatherData
};
