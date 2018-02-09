'use strict'

const path = require('path');
const jSmart = require('jsmart');
const fs = require('fs');
const _ = require('lodash');
const moment = require('moment');

const mongo = global[process.env.PUNKAVE_GLOBAL_NAMESPACE].mongo;

class web {

    constructor() {
        var projectRoot = path.resolve(__dirname + '/../..');
        this.publicPath = projectRoot + '/public/';
        this.viewsPath = projectRoot + '/src/views/';
    }

    routing(express) {
        // web stuff
        express.get('/js/*', this.staticFile.bind(this));
        express.get('/css/*', this.staticFile.bind(this));
        express.get('/', this.home.bind(this));

        // debug stuff
        express.get('/intake', this.intake.bind(this));
    }
    
    tpl(path,data) {
        var tpl = fs.readFileSync(path, {encoding: 'utf-8'});
        var compiledTpl = new jSmart(tpl);
        return compiledTpl.fetch(data);
    }

    async home(req,res) {
        console.log('Sending index page to client');
        var weather = mongo.getCollection('weather');
        var snaps = await function () {
            return new Promise((resolve,reject) => {
                weather.find({}).toArray((err,records) => {
                    if(err) {
                        return reject(records);
                    }
                    return resolve(records)
                });
            });
        }.call(this);

        _.each(snaps, (snap) => {
            snap.timestring = moment(snap.timestamp).toISOString();
            snap.timestring = snap.timestring.substring(0,snap.timestring.length-5); // removes .000Z from time string
        });

        res.end(this.tpl(this.viewsPath + '/index.tpl',{
            weathersnaps: snaps
        }));
    }

    staticFile(req, res) {
        console.log('Sending ' + this.publicPath+req.path + ' to client');
        res.sendFile(this.publicPath+req.path);
    }

    // for debugging
    intake(req,res) {
        global[process.env.PUNKAVE_GLOBAL_NAMESPACE].intake.run(true);
        res.sendFile(this.viewsPath + '/index.html');
    }
}

module.exports = new web();