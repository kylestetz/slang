const mongoose = require('mongoose');
const MongoConfig = require('./mongo/mongo.config.js');

mongoose.Promise = global.Promise;

const uri = `mongodb://${MongoConfig.HOST}:${MongoConfig.PORT}/${MongoConfig.NAME}`;
const db = mongoose.createConnection(uri);

module.exports = db;
