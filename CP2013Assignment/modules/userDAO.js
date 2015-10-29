/**
 * Created by Shaquille on 29/10/2015.
 */
var Datastore = require('nedb');
var path = require('path');

var db = {
    userinfo: new Datastore({filename: path.join('./', 'data', 'userinfo.db'), autoload: true})
};

var userModule = {
    get: function (callback){
        db.userinfo.find({}, function (error, users){
            if (error) {
                return callback(err);
            } else{
                return callback(null, users);
            }

        });
    },
    getOne: function (username, callback) {
        db.userinfo.findOne({'username': username}, function (error, user) {
            if (error) {
                return callback(err);
            }

            if (!user) {
                return callback(null, false);
            }

            return callback(null, user);
        });
    },
    verifyLogin: function (username, password, callback) {
        db.userinfo.findOne({'username': username}, function (error, user) {
            if (error) {
                return callback(err);
            }

            if (!user) {
                return callback(null, false);
            }

            if (user.password != password) {
                return callback(null, false);
            }
            return callback(null, user);
        });
    },
    insertUser: function (firstname, lastname, email, username, password, bedroomLight, officeLight, kitchenLight, livingroomLight,
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
    },
    removeUser: function (username) {
        db.userinfo.remove({username: username});
    },
    editUser: function (username, bedroomLight, officeLight, kitchenLight, livingroomLight,
                                bathroomLight, laundryLight, frontDoor, backDoor, temperature, humidity, emailNotifications, adminPrivileges) {

        db.userinfo.update({'username': username}, {
                $set: {
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
                }
            }
        );

    }
};

module.exports = userModule;