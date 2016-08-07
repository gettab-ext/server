const _ = require('lodash');
const Promise = require("bluebird");
const fs = require('fs');
const got = require('got');

const weatherMock = JSON.parse(fs.readFileSync('./mocks/weather.json'));

const FORECAST_IO_API_KEY = '490b42fe341d6e49ecffb9439bac6dda';

const forecastIOIconCodeMapping = {
    'clear-day': '32',
    'clear-night': '33',
    'rain': '10',
    'snow': '18',
    'sleet': '18',
    'wind': '23',
    'fog': '19',
    'cloudy': '44',
    'partly-cloudy-day': '44'
};
const defaultIcon = 'day-cloud';

function getIconCode(iconCode) {
    return (forecastIOIconCodeMapping[iconCode] || defaultIcon);
}

function parseForecastIOData(data) {
    const forecastData = _.get(data, 'daily.data') || [];

    return {
        now: {
            t: _.get(data, 'currently.apparentTemperature'),
            i: getIconCode(_.get(data, 'currently.icon')),
            w: _.get(data, 'currently.windSpeed'),
            h: _.get(data, 'currently.humidity'),
            p: _.get(data, 'currently.precipProbability')
        },
        forecast: _.map(forecastData, item => {
            return {
                d: item.summary,
                t: `${item.time}000`,
                l: item.apparentTemperatureMin,
                h: item.apparentTemperatureMax,
                i: getIconCode(item.icon)
            };
        }),
    };
}

function getData(latitude, longitude, locationName, mock) {
    const coord = `${latitude},${longitude}`;
    const url = `https://api.forecast.io/forecast/${FORECAST_IO_API_KEY}/${coord}?exclude=minutely,hourly,alerts,flags&units=si`;

    if (mock) {
        return Promise.resolve(parseForecastIOData(weatherMock));
    }

    return Promise.resolve(got(url, {json: true})).then(response => {
        return parseForecastIOData(response.body);
    });
}

module.exports = {
    getData: getData
};
