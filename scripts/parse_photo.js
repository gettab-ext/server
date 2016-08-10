var fs = require('fs');
var file = fs.readFileSync('../misc/photo.txt', 'utf8');
var _ = require('lodash');

var items = file.split('ID:')
    .filter(i => !!i)
    .map(s => s.split(/[\n\r]+/).filter(i => i))
    .map(i => {
        return {
            filename: `${i[0].trim()}.jpg`,
            thumb_filename: `thumbs/${i[0].trim()}.jpg`,
            name: i[1],
            desc: i[2]
        };
    });

fs.writeFileSync('../misc/photo.json', JSON.stringify(items, null, 2));
