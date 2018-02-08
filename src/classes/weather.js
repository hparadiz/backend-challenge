'use strict'

const https = require('https');

class weather {
    constructor() {
        // Philadelphia
        this.defaultLocation = {
            latitude: 39.952584,
            longitude: -75.165222
        };
    }

    async getSnapshot(location) {
        if(!location) {
            location = this.defaultLocation;
        }

        return new Promise((resolve,reject) => {
            https.get({
                host: 'api.openweathermap.org',
                headers: {'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.18 Safari/537.36'},
                path: '/data/2.5/weather?lat='+ location.latitude + '&lon=' + location.longitude + '&appid='+process.env.PUNKAVE_OPENWEATHERMAP_API_KEY
            }, (resp) => {
                var data='';
                resp.on('data', (chunk) => {
                    data += chunk;
                });

                resp.on('end', () => {
                    resolve(JSON.parse(data));
                });
            }).on("error",(err) => {
                reject(err.message);
            });
        });
    }
}

module.exports = new weather();