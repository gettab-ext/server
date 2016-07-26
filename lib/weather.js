"use strict";
const got = require('got');

const WEATHER_API_KEY = '490b42fe341d6e49ecffb9439bac6dda';

function getWeatherData(latitude, longitude) {
    const coord = `${latitude},${longitude}`;
    const url = `https://api.forecast.io/forecast/${WEATHER_API_KEY}/${coord}?exclude=minutely,hourly,alerts,flags&units=si`;

    return got(url, {json: true}).then(response => {
        return response.body;
    });
}

module.exports = {
    getWeatherData: getWeatherData
};
