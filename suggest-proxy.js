const SUGGEST_LIMIT = 5;

const RE = {
    bingParser: /<div class="sa_tm">(.+?)<\/div>/g,
    tagRemove: /<.+?>/g
};

const suggestTimeout = 500;
const suggestEngineOrder = ['bing', 'yahoo', 'mystart'];

const suggestEngines = {
    yahoo(query) {
        const url = `https://search.yahoo.com/sugg/gossip/gossip-us-ura/?output=sd1&command=${query}&appid=fp`;

        return got(url, {
            json: true,
            timeout: suggestTimeout
        }).then(response => {
            if (!response || !response.body || !response.body.r) {
                return null;
            }
            return response.body.r.map(item => {
                return {
                    name: item.k
                };
            }).slice(0, SUGGEST_LIMIT);
        });
    },
    bing(query) {
        const url = `http://www.bing.com/AS/Suggestions?&qry=${query}&cvid=foo`;

        return got(url, {
            timeout: suggestTimeout
        }).then(response => {
            const rawItems = response.body.match(RE.bingParser);
            if (!rawItems) {
                return null;
            }
            return rawItems.map(rawItem => rawItem.replace(RE.tagRemove, '')).map(item => {
                return {
                    name: item
                };
            });
        }, e => {
            console.log('bing', e);
        });
    },
    mystart(query) {
        const url = `https://www.mystart.com/api/get_alternative_searchterms/?q=${encodeURIComponent(query)}&limit=${SUGGEST_LIMIT}`;

        return got(url, {
            json: true,
            timeout: suggestTimeout
        }).then(response => {
            const data = response.body;

            if (typeof data !== 'object' ||
                typeof data.searchresults !== 'object' ||
                typeof data.searchresults.AlsoTryData !== 'object'
            ) {
                return null;
            }
            return data.searchresults.AlsoTryData.map(item => {
                return {
                    name: item
                };
            });
        });
    }
};

const getSuggest = (req, res) => {
    const query = req.query.q;

    if (!query) {
        res.sendStatus(500);
    }

    let engineIndex = 0;

    const getNextSuggest = function() {
        const suggestProvider = suggestEngineOrder[engineIndex];

        suggestEngines[suggestProvider](query).then(items => {
            if (!items) {
                engineIndex++;
                getNextSuggest();
            } else {
                res.set('Content-Type', 'application/json');
                res.set('Access-Control-Allow-Origin', '*');
                res.send({
                    provider: suggestProvider,
                    result: items
                });
            }
        }).catch(err => {
            console.log(err);
            engineIndex++;
            getNextSuggest();
        });
    };

    getNextSuggest();
};

export default getSuggest;
