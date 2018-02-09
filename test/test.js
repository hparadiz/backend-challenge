var assert = require('assert');
var http = require('http');
var moment = require('moment');

async function getJSONFromAPI(path) {
    return new Promise((resolve,reject) => {
        http.get({
            host: 'localhost',
            port: 8080,
            headers: {'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.18 Safari/537.36'},
            path: path
        }, (resp) => {
            var data='';
            resp.on('data', (chunk) => {
                data += chunk;
            });

            resp.on('end', () => {
                if(resp.statusCode == '404') {
                  reject('404');
                }
                else {
                  resolve(JSON.parse(data));
                }
            });
        }).on("error",(err) => {
            reject(err.message);
        });
    });
}

var lasthour = moment.utc().minute(0).seconds(0).subtract(1,'hour').toISOString();
lasthour = lasthour.substring(0,lasthour.length-5);

describe('Snapshot of all stations at a specified time', function() {
  describe('#'+lasthour, function() {
    it('should return value '+ lasthour +' for .at',async function() {
      var data = await getJSONFromAPI('/api/v1/stations?at='+lasthour)
      assert.equal(data.at, lasthour);
    });
  });
});

describe('Snapshot of all stations at a future time with no record', function() {
  describe('#2019-02-09T02:00:00', function() {
    it('should return a 404',async function() {
      var error
      var data = await getJSONFromAPI('/api/v1/stations?at=2019-02-09T02:00:00').catch((e) => {
        error = e;
      })
      assert.equal(error, '404');
    });
  });
});

describe('Snapshot of one station kioskId 3005 at a specified time', function() {
  describe('#'+lasthour, function() {
    it('should return value '+ lasthour +' for .at',async function() {
      var data = await getJSONFromAPI('/api/v1/stations/3005?at='+lasthour)
      assert.equal(data.at, lasthour);
    });

    it('should return value 3005 for .stations[0].properties.kioskId',async function() {
      var data = await getJSONFromAPI('/api/v1/stations/3005?at='+lasthour)
      assert.equal(data.stations[0].properties.kioskId, '3005');
    });
  });
});

describe('Snapshot of one station kioskId 3005 during a range of time (hourly)', async function() {
  var rangestart = moment.utc().minute(0).seconds(0).subtract(3,'hour').toISOString();
  rangestart = rangestart.substring(0,rangestart.length-5);
  var data = await getJSONFromAPI('/api/v1/stations/3005?from='+rangestart+'&to='+lasthour+'&frequency=hourly');
  describe('#'+rangestart+'-'+lasthour, function() {
    it('should return data for range provided', function() {
      assert.deepEqual(
        {
          0: typeof data[0].at,
          1: typeof data[0].weather,
          2: typeof data[0].stations
        },
        {
          0: 'string',
          1: 'object',
          2: 'object'
        });

    });
  });
});