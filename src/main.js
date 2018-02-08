'use strict'

const path = require('path');

class main {
    // ES6 classes do not allow config variables defined in the class so you
    // must define them in a constructor or another method the constructor runs
    constructor() {
        // registers this main class as a singleton in global so we can access other singletons
        global[process.env.PUNKAVE_GLOBAL_NAMESPACE] = this;

        this.express = require('express')();
        this.server = require('http').Server(this.express);

        this.server.on('error',this.handleServerError);
        
        this.server.listen(process.env.PUNKAVE_PORT);

        // do this before setting up the web server
        this.mongo = require('./classes/drivers/mongo')
        this.mongo.connect();

        // class for handling the web api
        this.api = require('./controllers/api');

        this.establishRouting();

        this.publicPath = path.resolve(__dirname + '/../public');

        console.log('backend-challenge server running');
        
        

        // data intake
        this.intake = require('./classes/intake');
    }

    establishRouting() {
        // web stuff
        this.express.get('/js/*', this.handleStatic.bind(this));
        this.express.get('/css/*', this.handleStatic.bind(this));
        this.express.get('/', this.handleIndex.bind(this));

        // debug stuff
        this.express.get('/intake', this.handleRunIntake.bind(this));

        this.api.routing(this.express);
    }

    handleRunIntake(req,res) {
        // for debugging
        this.intake.run(true);
        res.sendFile(__dirname + '/views/index.html');
    }

    handleIndex(req,res) {
        console.log('Sending index page to client');
        res.sendFile(__dirname + '/views/index.html');
    }

    handleStatic(req, res) {
        console.log('Sending ' + this.publicPath+req.path + ' to client');
        res.sendFile(this.publicPath+req.path);
    }

    handleServerError(e) {
        console.log(e);
    }
}

module.exports = new main();