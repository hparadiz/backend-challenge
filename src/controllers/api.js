'use strict'

const util = require('util');
const moment = require('moment');
const _ = require('lodash');

const mongo = global[process.env.PUNKAVE_GLOBAL_NAMESPACE].mongo;

class api {
    routing(express) {
        // stations api
        express.get('/api/v1/stations', this.allStations.bind(this));
        express.get('/api/v1/stations/:kioskId', this.oneStation.bind(this));
    }

    async allStations(req,res) {
        if(req.query.at) {
            var indego = mongo.getCollection('indego');
            var weather = mongo.getCollection('weather');

            var at = moment.utc(req.query.at);
            
            /*
             *  This really should be a seperate function but since this is a tech demo
             *  I wanted to show how you can create an await-able anonymous function,
             *  and run it right away.
             */
            var firstWeatherData = await function () {
                return new Promise((resolve,reject) => {
                    weather.find({
                        timestamp: {
                            $gte: at.toDate()
                        }
                    }, { limit: 1 }).sort({timestamp: 1}).toArray((err,records) => {
                        if(err) {
                            return reject(records);
                        }
                        return resolve(records)
                    });
                });
            }();
            if(!firstWeatherData.length) {
                console.log('Nothing found after ' + at);
                return res.status(404).send('Not found');
            }

            var stations = await function () {
                return new Promise((resolve,reject) => {
                    indego.find({
                        timestamp:  firstWeatherData[0].timestamp
                    }).toArray((err,records) => {
                        if(err) {
                            return reject(records);
                        }
                        return resolve(records)
                    });
                });
            }();
            
            var atstring = moment.utc(firstWeatherData[0].timestamp).toISOString();
            atstring = atstring.substring(0,atstring.length-5);
            var output = { at: atstring };

            // remove mongo artifacts
            _.each(firstWeatherData, (record) => {
                delete record._id;
                delete record.timestamp;
            });

            _.each(stations, (record) => {
                delete record._id;
                delete record.timestamp;
            });

            output.weather = firstWeatherData;
            output.stations = stations;

            return res.json(output);
        }
        else {
            console.log('Missing get params.');
            return res.status(404).send('Not found');
        }
    }

    async getDataAtTime(kioskId,at) {
        var indego = mongo.getCollection('indego');
        var weather = mongo.getCollection('weather');

        //console.log('getting data at: '+at);

        var firstWeatherData = await function () {
            return new Promise((resolve,reject) => {
                weather.find({
                    timestamp: {
                        $gte: at.toDate()
                    }
                }, { limit: 1 }).sort({timestamp: 1}).toArray((err,records) => {
                    if(err) {
                        return reject(records);
                    }
                    return resolve(records)
                });
            });
        }();

        if(!firstWeatherData.length) {
            return false;
        }

        var stations = await function () {
            return new Promise((resolve,reject) => {
                var query = {
                    $and: [
                        {'timestamp':  firstWeatherData[0].timestamp},
                        {'properties.kioskId': kioskId}
                    ]
                };
                indego.find(query).toArray((err,records) => {
                    if(err) {
                        return reject(records);
                    }
                    return resolve(records)
                });
            });
        }();

        var atstring = moment.utc(firstWeatherData[0].timestamp).toISOString();
            atstring = atstring.substring(0,atstring.length-5);
        var output = { at: atstring };

        // remove mongo artifacts
        _.each(firstWeatherData, (record) => {
            delete record._id;
            delete record.timestamp;
        });

        _.each(stations, (record) => {
            delete record._id;
            delete record.timestamp;
        });

        output.weather = firstWeatherData;
        output.stations = stations;

        return output;
    }

    async oneStation(req,res) {
        if(req.query.at) {
            var at = moment.utc(req.query.at);

            var kioskId = parseInt(req.params.kioskId,10);

            if(!kioskId) {
                console.log('Missing kioskId.');
                return res.status(404).send('Not found');
            }

            var output = await this.getDataAtTime(kioskId,at);
            console.log(output);


            if(!output) {
                console.log('Nothing found after ' + at);
                return res.status(404).send('Not found');
            }

            return res.json(output);
        }
        if(!req.query.at) {
            return await this.oneStationRange(req,res);
        }
    }

    async oneStationRange(req,res) {
        var from = req.query.from,
            to = req.query.to,
            frequency = req.query.frequency;

        if(!from || !to) {
            console.log('Missing get params.');
            return res.status(404).send('Not found');
        }
        
        from = moment.utc(req.query.from);
        to = moment.utc(req.query.to);

        if(from.isAfter(to)) {
            console.log('From is after to.');
            return res.status(404).send('Not found');
        }

        // period
        if(!['daily','hourly'].includes(frequency)) {
            frequency = 'daily';
        }

        var kioskId = parseInt(req.params.kioskId,10);

        var loopTime = from.clone(), data, last;
        var output = [];
        
        while(loopTime.isBefore(to)) {
            
            if(frequency == 'daily') {
                // noon in philly = 17 in UTC
                loopTime.hour(17);
            }
            
            data = await this.getDataAtTime(kioskId,loopTime);
            if(frequency == 'hourly') {
                loopTime.add(1,'hour');
            }
            if(frequency == 'daily') {
                loopTime.add(1,'day');
            }
            
            if(data) {
                // this logic avoids the same data being returned
                last = _.last(output);
                if(last) {
                    if(data.at.toString() == last.at.toString()) {
                        continue;
                    }
                }
                output.push(data);
            }
        }
        return res.json(output);
    }
}

module.exports = new api();