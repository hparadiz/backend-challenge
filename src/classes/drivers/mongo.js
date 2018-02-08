'use strict'

const MongoClient = require('mongodb').MongoClient;

class mongo {
    async connect() {
        return new Promise((resolve,reject) => {
            MongoClient.connect(process.env.PUNKAVE_MONGODB_CONNECTION_URL, this.registerClient.bind(this));
        });
    }

    registerClient(err, client) {
        if(!err) {
            console.log("Connected successfully to mongo server at "+process.env.PUNKAVE_MONGODB_CONNECTION_URL);
            this.client = client;
            Promise.resolve();
        }
        else {
            Promise.reject(err);
        }
    }

    getDatabase() {
        return this.client.db(process.env.PUNKAVE_MONGODB_DATABASE);
    }

    getCollection(name) {
        var db = this.getDatabase();
        return db.collection(name);
    }
}

module.exports = new mongo();