'use strict'

const moment = require('moment');
const Promise = require("bluebird");
const _ = require('lodash');

const indego = require('./indego');
const weather = require('./weather');

const mongo = global[process.env.PUNKAVE_GLOBAL_NAMESPACE].mongo;

class intake {
    constructor() {
        this.interval = 60 * 60 * 1000; // minutes * seconds * milliseconds

        var nextHour = moment().endOf('hour'); // next hour at nn:00:00:000
        var milliseconds = moment.duration(nextHour.diff(moment())).asMilliseconds(); // seconds till 
        
        // At next hour this will bind our hourly run of the run method (loop 0 + n)
        setTimeout(() => {
            this.loopID = setInterval(this.run.bind(this),this.interval);
        },milliseconds);
        
        // This will cause this.run to execute at the next hour (loop 0)
        setTimeout(this.run.bind(this),milliseconds);
    }

    async run(now) {
        console.log('intake running');

        // pin this run to this exact timestamp in utc
        if(now) {
            var thisHour = moment.utc();
        }
        else {
            var thisHour = moment().startOf('hour').utc();
        }
    
        var weatherSnapshot = await weather.getSnapshot();
        var indegoSnapshot = await indego.getSnapshot();

        await this.storeWeatherSnapshot(weatherSnapshot,thisHour);
        await this.storeIndegoSnapshot(indegoSnapshot,thisHour);
    }

    
    async storeIndegoSnapshot(data,timestamp) {
        var indego = mongo.getCollection('indego');
        
        // make sure we didn't do this pull already
        var existing = await function () {
            return new Promise((resolve,reject) => {
                indego.find({timestamp:timestamp.toDate()}).toArray((err,records) => {
                    if(err) {
                        return reject(records);
                    }
                    return resolve(records)
                });
            });
        }.call(this);
        
        if(existing.length) {
            console.log('Indego data for ' + timestamp + ' already exists.');
            return;
        }
        
        _.each(data.features, (feature) => {
            feature.timestamp = timestamp.toDate();
        });

        indego.insertMany(data.features, (result, ops, connection) => {
            console.log('Stored indego stations for '+timestamp);
            console.log(result, ops);
        });
    }

    async storeWeatherSnapshot(data,timestamp) {
        var weather = mongo.getCollection('weather');

        // make sure we didn't do this pull already
        var existing = await function () {
            return new Promise((resolve,reject) => {
                weather.find({timestamp:timestamp.toDate()}).toArray((err,records) => {
                    if(err) {
                        return reject(records);
                    }
                    return resolve(records)
                });
            });
        }.call(this);
        
        if(existing.length) {
            console.log('Weather data for ' + timestamp + ' already exists.');
            return;
        }
        
        data.timestamp = timestamp.toDate();

        weather.insert(data, (result, ops, connection) => {
            console.log('Stored weather for '+timestamp);
            console.log(result, ops);
        });
    }
}

module.exports = new intake();