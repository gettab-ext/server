const Promise = require("bluebird");
const got = require('got');
const _ = require('lodash');

const API_BASE_URL = 'https://query.yahooapis.com/v1/public/yql?q=';

function parseData(data) {
    data = _.get(data, 'query.results.channel');
    const forecastData = _.get(data, 'item.forecast') || [];

    return {
        now: {
            t: _.get(data, 'condition.temp'),
            i: _.get(data, 'condition.code'),
            w: _.get(data, 'wind.speed'),
            h: _.get(data, 'atmosphere.humidity'),
            p: null
        },
        forecast: _.map(forecastData, item => {
            return {
                d: item.text,
                t: (new Date(item.date)).getTime(),
                l: item.low,
                w: item.high,
                i: item.code
            };
        }),
    };
}

function getData(latitude, longitude, locationName) {
    const query = `select * from weather.forecast where woeid in (select woeid from geo.places(1) where text = 'chicago, il') & format = json`;
    const url = API_BASE_URL + query;
    return Promise.resolve(got(url, {
        json: true
    })).then(response => {
        return parseData(response.body);
    });
}

module.exports = {
    getData: getData
};
