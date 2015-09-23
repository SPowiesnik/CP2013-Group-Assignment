/**
 * Created by Shaquille on 25/08/2015.
 */
'use strict';
//imported modules
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');

var passport = require('passport');
var passportLocal = require('passport-local');

//var mysql = require('mysql');
var http = require('http');
var path = require('path');
var favicon = require('serve-favicon');

var Datastore = require('nedb');

var lightModule = require('./static/functions');

var db = {
    userinfo: new Datastore({filename: path.join(__dirname, 'data/userinfo.db'), autoload: true}),
    //lights: new Datastore({filename: path.join(__dirname, 'data/lights.db'), autoload: true})
};

var app = express();

var server = http.createServer(app);

app.set('view engine', 'ejs');

app.use(favicon(path.join(__dirname, 'images', 'favicon.ico')));

//configuration of middleware
app.use(bodyParser.text());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(expressSession({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false
}));

app.use(express.static(path.join(__dirname, 'styles')));
app.use(express.static(path.join(__dirname, 'images')));
app.use(express.static(path.join(__dirname, 'static')));

//configuration of passport
app.use(passport.initialize());
app.use(passport.session());

//verify username and password
passport.use(new passportLocal.Strategy(function (username, password, done) {
    //searches for username in database
    db.userinfo.findOne({'username': username}, function (error, user) {
        if (error) {
            return done(err);
        }

        if (!user) {
            return done(null, false);
        }

        if (user.password != password) {
            return done(null, false);
        }
        return done(null, user);
    });
}));

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

function verifyAuthenticated(req, res, next) {
    //check if user is authenticated
    if (req.isAuthenticated()) {
        //allows the request
        next();
    } else {
        //sends forbidden 403 page
        res.sendStatus(403);
    }
}

function getLightState(light, callback) {
    db.lights.findOne({light: light}, function (error, state) {
        if (error || !state) {
            return callback(new Error('light state not found'));
        }
        console.log(state.state);
        console.log(light);
        callback(null, state);
    });

}

app.get('/', function (req, res) {
    if (!req.isAuthenticated()) {
        res.redirect('login');
    } else {
        lightModule.get( function (error, object) {
            if (error) {
                console.log("app.get /getLightState error");
            }
            console.log("getLightStateExecuted");

            res.render('index', {
                isAuthenticated: req.isAuthenticated(),
                user: req.user,
                temperature: 30,
                light1: object[0].state,
                light2: object[1].state,
                light3: object[2].state,
                light4: object[3].state,
                light5: object[4].state,
                light6: object[5].state
            });
        });
    }

});

app.post('/getLightState', function (req, res) {
    lightModule.getOne(req.body.light, function (error, object) {
        if (error) {
            console.log("app.get /getLightState error");
        }
        lightModule.update(req.body.light, object.state, function (error, object) {
            if (error) {
                console.log("app.get /getLightState error");
            }
        });
    });
    res.redirect(req.header('Referer'));
});

//provides login page
app.get('/login', function (req, res) {
    res.render('login');
});

//authenticate username and password
app.post('/login', passport.authenticate('local'), function (req, res) {
    res.redirect('/');
});

//logout feature
app.get('/logout', function (req, res) {
    //request the server to log out
    req.logout();
    //redirect back to index/home
    res.redirect('/');
});

app.get('/doors', verifyAuthenticated, function (req, res) {
    res.render('doors');
});

app.get('/lights', verifyAuthenticated, function (req, res) {
    res.render('lights');
});

app.get('/editProfile', verifyAuthenticated, function (req, res) {
    res.render('editProfile');
});

app.post('/updatePrivileges', verifyAuthenticated, function(req, res){
   //add logic here



});

app.get('/newProfile', verifyAuthenticated, function (req, res) {
    res.render('newProfile');
});


app.post('/createProfile', verifyAuthenticated, function(req, res){
    //add logic here



});

var port = process.env.PORT || 3000;

server.listen(port, function () {
    console.log('http://127.0.0.1:' + port + '/');
    console.log('ready..');
});


/* Some sql configuration and examples in case we use sql
 var connection = mysql.createConnection(
 {
 host : 'localhost',
 user : 'Jason',
 password : 'automation',
 database : 'homeautomation'
 }
 );

 connection.connect();

 var queryStr = 'SELECT * FROM tempdata';

 connection.query(queryStr, function(error, rows) {
 if (error) throw error;

 for (var i in rows) {
 temp = rows[i].temperature;
 console.log('Temperature: ', temp)
 }
 });

 var queryStr1 = 'SELECT * FROM usersinfo';

 connection.query(queryStr1, function(error, rows) {
 if (error) throw error;

 for (var i in rows) {
 var username = rows[i].username;
 var password = rows[i].password;
 console.log('Username: ', username, '\nPassword: ', password)
 }
 });


 connection.on('close', function(error) {
 if (error) {
 connection = mysql.createConnection(connection.config);
 } else {
 console.log('Connection closed normally. ');
 }
 });

 connection.end();


 */


