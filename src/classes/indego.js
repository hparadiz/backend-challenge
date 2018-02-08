'use strict'

const https = require('https');

class indego {
    async getSnapshot() {
        return new Promise((resolve,reject) => {
            https.get({
                host: 'www.rideindego.com',
                headers: {'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.18 Safari/537.36'},
                path: '/stations/json/'
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

module.exports = new indego();