/**
 * Created by Shaquille on 29/10/2015.
 */
var Datastore = require('nedb');
var path = require('path');

var db = {
    accessLog: new Datastore({filename: path.join('./', 'data', 'accessLog.db'), autoload: true})
};

var accessLogModule = {
    get: function (callback) {
        db.accessLog.find({}).sort({date: -1, time: -1}).exec(function (error, docs) {
            if (error){
                return callback(err);
            } else {
                return callback(null, docs);
            }
        });
    },
    //Access Log Insert
    addLog: function (firstname, lastname, action, door, date, time) {
        var log = {
            name: firstname,
            lastname: lastname,
            action: action,
            door: door,
            date: date,
            time: time
        };
        db.accessLog.insert(log, function (error, insertDocument) {
            console.log('Inserted Log');
        });
    },
    clearLogs: function(){
        db.accessLog.remove({}, {multi: true});
    }

};

module.exports = accessLogModule;