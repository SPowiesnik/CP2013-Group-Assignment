/**
 * Created by Shaquille on 27/08/2015.
 */
'use strict';

var path = require('path');

var Datastore = require('nedb');

var db = {
    userinfo: new Datastore({ filename: path.join(__dirname, 'userinfo.db'), autoload: true}),
    lights: new Datastore({ filename: path.join(__dirname, 'lights.db'), autoload: true}),
};

// used to insert data into database
function insertUser(username, password) {
    db.userinfo.insert({ username: username, password: password}, function(error, insertDocument){
        console.log('inserted user');
    });
}

function insertLight(light, state) {
    db.lights.insert({ light: light, state: state}, function(error, insertDocument){
        console.log('inserted light');
    });
}

function sss(light, callback) {
    db.lights.findOne({light: light}, function (error, state) {
        if (error || !state) {
            return callback(new Error('light state not found'));
        }
        console.log(state.state);
        console.log(light);
        callback(null, state);
    });
}


