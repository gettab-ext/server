const got = require('got');
const url = "https://www.yandex.com/images/";
const cheerio = require('cheerio');

const EMPTY = {
    name: '',
    desc: ''
};

got(url, {
    headers: {
        'Accept-Language': 'en-US',
        'X-Forwarded-For': '146.185.139.117'
    }
}).then(response => {

    try {
        const $ = cheerio.load(response.body);

        console.log({
            name: $(".b-501px__name").text(),
            desc: $(".b-501px__description").text()
        });

    } catch (e) {
        console.log(EMPTY);
    }


}).catch(() => {
    console.log(EMPTY);
});