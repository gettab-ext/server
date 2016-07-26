"use strict";
const got = require('got');

const GEOLOCATION_SERVER = 'localhost:6551';

/**
 * @param {String} ip
 * @return {Promise}
 */
function getLocation(ip) {
    const url = `${GEOLOCATION_SERVER}/json/${ip}`;

    return got(url, {
        json: true,
    }).then(response => {
        return {
            latitude: response.body.latitude,
            longitude: response.body.longitude,
            city: response.body.city
        };
    });
}

/**
 * Reverse Geocoding
 * @param coord
 * @return {Promise}
 */
function getCityName(coord) {
    const url = `https://geocode-maps.yandex.ru/1.x/?geocode=${coord}&format=json&kind=locality&lang=en_US`;

    return got(url).then(response => {
        return response.body;
    });
}

module.exports = {
    getLocation: getLocation,
    getCityName: getCityName
};
