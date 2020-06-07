'use strict';

const express = require('express');
const serverless = require('serverless-http');
const app = express();
const mongoose = require('mongoose');
require("dotenv").config();

const {
    db_username,
    db_password,
    db_cluster,
    db_database,
} = process.env;

const asyncHandle = async (promise) => {
    try {
        const data = await promise;
        return [data, undefined];
    } catch (error) {
        return [undefined, error];
    }
}

const CONNECTION_URL = `mongodb+srv://${db_username}:${decodeURI(db_password)}${db_cluster}/test?retryWrites=true&w=majority`;

let dbConnection;
const establishConnection = async (req, res, next) => {
    if (dbConnection == null) {
        let [connSucccess, connError] = await asyncHandle(mongoose.createConnection(CONNECTION_URL, {
            bufferCommands: false,
            bufferMaxEntries: 0,
            useCreateIndex: true,
            useUnifiedTopology: true,
            useNewUrlParser: true,
            dbName: db_database,
            useNewUrlParser: true,
            useFindAndModify: false
        }))
        if (connError) {
            console.log('mongo connection error:', connError);
            dbConnection = null;
            // For dev only to debug the connection.
            // If an error occurs its most likely that you have 
            // not permitted access to the IP.
            return next(connError);
        } else {
            dbConnection = connSucccess;
            console.log('mongo connection success:', dbConnection);
            next();
        }
    }
}

// Simple Test that can be run to ensure the database
// is connected and the end point can be resolved.
app.get('/user', establishConnection, async function (req, res) {
    res.json({ msg: 'user success' });
})

// Let's see if this works
module.exports.handler = serverless(app, {
    request: function (req, event, context) {
        context.callbackWaitsForEmptyEventLoop = true;
        req.event = event;
        req.context = context;
    }
});
