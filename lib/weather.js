"use strict";
const got = require('got');

const WEATHER_API_KEY = '490b42fe341d6e49ecffb9439bac6dda';

function getWeatherData(coord) {
    const url = `https://api.forecast.io/forecast/${WEATHER_API_KEY}/${coord}?exclude=minutely,hourly,alerts,flags&units=si`;

    return got(url).then(response => {
        return {

        }
    });
}

module.exports = {
    getWeatherData: getWeatherData
};
