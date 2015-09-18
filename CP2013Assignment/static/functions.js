/**
 * Created by Shaquille on 15/09/2015.
 */
'use strict';

var Datastore = require('nedb');
var path = require('path');

var db = {
    lights: new Datastore({filename: ('./data/lights.db'), autoload: true})
};
function updateLightState() {
    db.lights.update(
        { light: "light1" },
        {
            light: "light1",
            state: "on"
        },
        { upsert: true }
    );
    console.log("update light called");
}

var lightModule = {
    get: function (callback){
        db.lights.find({}).sort({light:1}).exec( function (error, lightObject) {
            if (error || !lightObject){
                return callback(new Error('light state not found'));
            }


            callback(null, lightObject);
        });
    },
    getOne: function (light, callback){
        db.lights.findOne({light: light}, function (error, state) {
            if (error || !state){
                return callback(new Error('light state not found'));
            }
            console.log(state.state);
            console.log(light);

            callback(null, state);
        });
    },
    update: function (light, currentState){
        var state;
        if (currentState==="on"){
            state = "off";
        } else if (currentState==="off"){
            state = "on";
        }
        console.log("update light: ", light);
        db.lights.update(
            { light: light},
            {
                light: light,
                state: state
            }
        );
        console.log("update light called");
    }

};

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



module.exports = lightModule;

function toggleImg(state) {
    if (state === "off") {
        document.getElementById("light").src = "/lighton.png";
        console.log(state);
    } else if(state === "on") {
        document.getElementById("light").src = "/lightoff.png";
    }
    console.log(state);
    console.log("1");

    /*
     var state = "off";



     if (state === "off") {
     //document.getElementById("light").src = "/lightoff.png";
     } else {
     document.getElementById("light").src = "/lighton.png";
     }


     */
}