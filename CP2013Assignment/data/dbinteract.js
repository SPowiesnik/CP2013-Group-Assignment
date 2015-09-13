/**
 * Created by Shaquille on 27/08/2015.
 */
'use strict';

var path = require('path');

var Datastore = require('nedb');

var db = {
    userinfo: new Datastore({ filename: path.join(__dirname, 'userinfo.db'), autoload: true}),
};

// used to insert data into database
function insertUser(username, password) {
    db.userinfo.insert({ username: username, password: password}, function(error, insertDocument){
        console.log('inserted user');
    });
}







