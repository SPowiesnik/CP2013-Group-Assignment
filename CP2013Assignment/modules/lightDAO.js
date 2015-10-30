/**
 * Created by Shaquille on 30/09/2015.
 */
'use strict';
var Datastore = require('nedb');
var path = require('path');

var db = {
    lights: new Datastore({filename: path.join('./', 'data', 'lights.db'), autoload: true})
};

var lightModule = {
    get: function (callback) {
        db.lights.find({}).sort({light: 1}).exec(function (error, lightObject) {
            if (error || !lightObject) {
                return callback(new Error('light state not found'));
            }
            return callback(null, lightObject);
        });
    },
    getOne: function (light, callback) {
        db.lights.findOne({light: light}, function (error, state) {
            if (error || !state) {
                return callback(new Error('light state not found'));
            }
            console.log(state.state);
            console.log(light);

            callback(null, state);
        });
    },
    update: function (light, currentState) {
        //push a off/on based on img
        var state;
        if (currentState === "on") {
            state = "off";
        } else if (currentState === "off") {
            state = "on";
        }
        console.log("update light: ", light);
        db.lights.update(
            {light: light},
            {
                light: light,
                state: state
            }
        );
        console.log("update light called");
    }

};

module.exports = lightModule;