/**
 * Created by Shaquille on 27/08/2015.
 */
'use strict';

var path = require('path');

var Datastore = require('nedb');

var db = {
    userinfo: new Datastore({filename: path.join(__dirname, 'userinfo.db'), autoload: true}),
    lights: new Datastore({filename: path.join(__dirname, 'lights.db'), autoload: true})
};

// used to insert data into database
function insertUser(firstname, lastname, email, username, password, bedroomLight, officeLight, kitchenLight, livingroomLight,
                    bathroomLight, laundryLight, frontDoor, backDoor, temperature, humidity, emailNotifications, adminPrivileges) {
    db.userinfo.insert({
        firstname: firstname,
        lastname: lastname,
        email: email,
        username: username,
        password: password,
        bedroomLight: bedroomLight,
        officeLight: officeLight,
        kitchenLight: kitchenLight,
        livingroomLight: livingroomLight,
        bathroomLight: bathroomLight,
        laundryLight: laundryLight,
        frontDoor: frontDoor,
        backDoor: backDoor,
        temperature: temperature,
        humidity: humidity,
        emailNotifications: emailNotifications,
        adminPrivileges: adminPrivileges
    }, function (error, insertDocument) {
        console.log('inserted user');
    });
}

function insertLight(light, state) {
    db.lights.insert({light: light, state: state}, function (error, insertDocument) {
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

//db.userinfo.remove({});
//insertUser("Jason", "Holdsworth", "jasonholdsworth@hotmail.com", "Jason", "cats", true, true, true, true, true, true, true, true, true, true, true, true);
//insertUser("Tom", "Jerry", "tomjerry@hotmail.com", "Tom", "jerry", false, false, true, true, true, false, true, false, true, true, false, false);
