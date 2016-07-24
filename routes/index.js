var express = require('express');
var router = express.Router();

const DEFAULT_WP_URL = 'http://gettab1.site/wp/wp.png';
const EXTENSION_URL = 'https://chrome.google.com/webstore/';

const DEFAULT_DESC = "GetTab Chrome Extension";

/* GET home page. */
router.get('/', function(req, res, next) {
    const wp = req.query.wp || DEFAULT_WP_URL;
    const desc = req.query.desc || DEFAULT_DESC;

    res.render('extension', {
        description: desc,
        wpUrl: wp,
        extensionUrl: EXTENSION_URL,
        layout: false
    });
});

module.exports = router;
