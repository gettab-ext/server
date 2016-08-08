const got = require('got');
const fs = require('fs');
const _ = require('lodash');

const URL = 'https://api.unsplash.com/photos/random' +
    '?client_id=600aa155440d1ce64a0385ee0e417fdfdf1c736f949f8465e641205883e1e070' +
    '&featured=1' +
    '&w=1920' +
    '&h=1080' +
    '&category=4';

const WP_FILE_NAME = 'wp.png';
const WP_INFO_FILE_NAME = 'wp-info.json';

got(URL, {
    json: true
}).then(response => {
    const data = response.body;
    const photoUrl = _.get(data, 'urls.custom');

    fs.writeFileSync(WP_INFO_FILE_NAME, JSON.stringify({
        name: _.get(data, 'location.city')
    }));

    got.stream(photoUrl).pipe(fs.createWriteStream(WP_FILE_NAME));

}).catch(e => {
    console.log(e);
});

