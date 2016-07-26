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
        const latitude = response.body.latitude;
        const longitude = response.body.longitude;

        if (response.body.city) {
            return {
                latitude: latitude,
                longitude: longitude,
                city: response.body.city
            };
        } else {
            return getCityName(latitude, longitude).then(cityName => {
                return  {
                    latitude: latitude,
                    longitude: longitude,
                    city: cityName
                };
            });
        }

    });
}

/**
 * Reverse Geocoding
 * @return {Promise}
 */
function getCityName(latitude, longitude) {
    const coord = `${latitude},${longitude}`;
    const url = `https://geocode-maps.yandex.ru/1.x/?geocode=${coord}&format=json&kind=locality&lang=en_US`;

    return got(url).then(response => {
        return response.body;
    });
}

module.exports = {
    getLocation: getLocation,
    getCityName: getCityName
};
