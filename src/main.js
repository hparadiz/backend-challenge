'use strict'

const _ = require('lodash');

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

        // loads controllers and runs the routing method in each class so they
        // can bind themselves to express right in the function
        
        // we're using an array to tell the code what to itterate through but
        // we could also do a directory listing on the controllers directory
        // and modulize the classes by checking for a routing() method
        var controllers = ['api','web'];
        _.each(controllers, (controller) => {
            this[controller] = require('./controllers/'+controller);
            if(typeof this[controller].routing == 'function') {
                this[controller].routing.call(this[controller],this.express);
            }
            else {
                delete this[controller];
            }
        })

        console.log('backend-challenge server running');

        // data intake
        this.intake = require('./classes/intake');
    }

    handleServerError(e) {
        console.log(e);
    }
}

module.exports = new main();