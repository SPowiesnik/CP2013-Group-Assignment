/**
 * Created by Shaquille on 30/09/2015.
 */
'use strict';

var Datastore = require('nedb');
var path = require('path');

var db = {
    doors: new Datastore({filename: path.join(__dirname, 'doors.db'), autoload: true})
};

var doorModule = {
    get: function (callback){
        db.doors.find({}).sort({door:1}).exec( function (error, doorObject) {
            if (error || !doorObject){
                return callback(new Error('door state not found'));
            }
            callback(null, doorObject);
        });
    },
    getOne: function (door, callback){
        db.doors.findOne({door: door}, function (error, state) {
            if (error || !state){
                return callback(new Error('light state not found'));
            }
            console.log(state.state);
            console.log(door);

            callback(null, state);
        });
    },
    update: function (door, currentState){
        //push a off/on based on img
        var state;
        if (currentState==="unlocked"){
            state = "locked";
        } else if (currentState==="locked"){
            state = "unlocked";
        }
        console.log("update door: ", door);
        db.doors.update(
            { door: door},
            {
                door: door,
                state: state
            }
        );
        console.log("update door called");
    }

};

module.exports = doorModule;