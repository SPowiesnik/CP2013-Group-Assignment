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

var lightModule = require('./data/lightModule');
var doorModule = require('./data/doorModule');

var db = {
    userinfo: new Datastore({filename: path.join(__dirname, 'data/userinfo.db'), autoload: true})
    , accessLog: new Datastore({filename: path.join(__dirname, 'data/accessLog.db'), autoload: true})
    //,lights: new Datastore({filename: path.join(__dirname, 'data/lights.db'), autoload: true})
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


function removeUser(username) {
    db.userinfo.remove({username: username});
}

function editUser(username, bedroomLight, officeLight, kitchenLight, livingroomLight,
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



function addZero(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}

function getTime() {
    var date = new Date();
    var h = addZero(date.getHours());
    var m = addZero(date.getMinutes());
    var s = addZero(date.getSeconds());
    return (h + ':' + m + ':' + s)
}

function getDate(){
    var date = new Date();
    var D = date.getDate()
    var M = (date.getMonth()+1)
    var Y = date.getFullYear()
    return (D +'/'+ M +'/'+ Y)
}

function addLog(N, LN, A, D, T) {
    var log = {
        name: N,
        lastname: LN,
        action: A,
        date: D,
        time: T
    };
    db.accessLog.insert(log, function (error, insertDocument) {
        console.log('Inserted Log');
    });
}


var temp = 25;
function temperature(min, max) {
    temp += Math.floor(Math.random() * (max - min + 1)) + min;
    console.log(temp);
}

setInterval(function () {
    temperature(-1, 1);
}, 60000);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////


app.get('/', function (req, res) {
    if (!req.isAuthenticated()) {
        res.redirect('login');
    } else {
        lightModule.get(function (error, lightObject) {
            if (error) {
                console.log("app.get /getLightState error");
            } else {

                doorModule.get(function (error, doorObject) {
                    if (error) {
                        console.log("app.get /getDoorState error");
                    } else {
                        res.render('index', {
                            user: req.user,
                            temperature: temp.toPrecision(2),
                            light1: lightObject[0].state,
                            light2: lightObject[1].state,
                            light3: lightObject[2].state,
                            light4: lightObject[3].state,
                            light5: lightObject[4].state,
                            light6: lightObject[5].state,
                            backDoor: doorObject[0].state,
                            frontDoor: doorObject[1].state
                        });
                    }
                });
            }
        });
    }


});

app.post('/getLightState', function (req, res) {
    lightModule.getOne(req.body.light, function (error, object) {
        if (error) {
            console.log("app.get /getLightState error");
        }
        lightModule.update(req.body.light, object.state, function (error) {
            if (error) {
                console.log("app.get /getLightState error");

            }
        });
    });
    res.redirect('/');
});


app.post('/getDoorState', function (req, res) {

    doorModule.getOne(req.body.door, function (error, object) {
        if (error) {
            console.log("app.get /getDoorState error");
        }
        console.log(object.state);
        var state;
        if (object.state === "unlocked") {
            state = "locked";
        } else if (object.state === "locked") {
            state = "unlocked";
        }
        addLog(req.user.firstname, req.user.lastname, state, getDate() , getTime());
        doorModule.update(req.body.door, object.state, function (error) {
            if (error) {
                console.log("app.get /getDoorState error");

            }
        });
    });

    res.redirect(req.headers['referer']);
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

///////////////////////////////////////////////DOORS////////////////////////////////////////////////////////////////////
app.get('/doors', verifyAuthenticated, function (req, res) {
    db.accessLog.find({}).sort({date: 1, time: -1}).exec(function (err, docs) {
        doorModule.get(function (error, doorObject) {
            if (error) {
                console.log("app.get /getDoorState error");
            } else {
                res.render('doors', {
                    user: req.user,
                    db: docs,
                    backDoor: doorObject[0].state,
                    frontDoor: doorObject[1].state
                });
            }
        });
    });
});

///////////////////////////////////////////////lights///////////////////////////////////////////////////////////////////
app.get('/lights', verifyAuthenticated, function (req, res) {
    res.render('lights', {
        user: req.user
    });
});

app.get('/editProfile', verifyAuthenticated, function (req, res) {
    db.userinfo.find({}, function (err, docs) {
        res.render('editProfile', {
            user: req.user,
            db: docs
        });
    });
});


app.post('/updatePrivileges', verifyAuthenticated, function (req, res) {
    if (req.body.bedroomLight === "on") {
        var bedroomLight = true;
    } else {
        bedroomLight = false;
    }
    if (req.body.officeLight === "on") {
        var officeLight = true;
    } else {
        officeLight = false;
    }
    if (req.body.kitchenLight === "on") {
        var kitchenLight = true;
    } else {
        kitchenLight = false;
    }
    if (req.body.livingLight === "on") {
        var livingLight = true;
    } else {
        livingLight = false;
    }
    if (req.body.bathroomLight === "on") {
        var bathroomLight = true;
    } else {
        bathroomLight = false;
    }
    if (req.body.lastname === "on") {
        var laundryLight = true;
    } else {
        laundryLight = false;
    }
    if (req.body.frontDoor === "on") {
        var frontDoor = true;
    } else {
        frontDoor = false;
    }
    if (req.body.backDoor === "on") {
        var backDoor = true;
    } else {
        backDoor = false;
    }
    if (req.body.temperature === "on") {
        var temperature = true;
    } else {
        temperature = false;
    }
    if (req.body.humidity === "on") {
        var humidity = true;
    } else {
        humidity = false;
    }
    if (req.body.emailNotifications === "on") {
        var emailNotifications = true;
    } else {
        emailNotifications = false;
    }
    if (req.body.adminPrivileges === "on") {
        var adminPrivileges = true;
    } else {
        adminPrivileges = false;
    }

    editUser(
        req.body.profileSelect,
        bedroomLight,
        officeLight,
        kitchenLight,
        livingLight,
        bathroomLight,
        laundryLight,
        frontDoor,
        backDoor,
        temperature,
        humidity,
        emailNotifications,
        adminPrivileges
    );
    res.redirect("/");
});

app.get('/removeProfile', verifyAuthenticated, function (req, res) {
    db.userinfo.find({}, function (err, docs) {
        res.render('removeProfile', {
            user: req.user,
            db: docs
        });
    });
});


app.post('/removeProfile', verifyAuthenticated, function (req, res) {
    removeUser(
        req.body.profileSelect
    );
    res.redirect("/");
});


app.get('/newProfile', verifyAuthenticated, function (req, res) {
    res.render('newProfile', {
        user: req.user
    });
});


app.post('/createProfile', verifyAuthenticated, function (req, res) {
    if (req.body.bedroomLight === "on") {
        var bedroomLight = true;
    } else {
        bedroomLight = false;
    }
    if (req.body.officeLight === "on") {
        var officeLight = true;
    } else {
        officeLight = false;
    }
    if (req.body.kitchenLight === "on") {
        var kitchenLight = true;
    } else {
        kitchenLight = false;
    }
    if (req.body.livingLight === "on") {
        var livingLight = true;
    } else {
        livingLight = false;
    }
    if (req.body.bathroomLight === "on") {
        var bathroomLight = true;
    } else {
        bathroomLight = false;
    }
    if (req.body.lastname === "on") {
        var laundryLight = true;
    } else {
        laundryLight = false;
    }
    if (req.body.frontDoor === "on") {
        var frontDoor = true;
    } else {
        frontDoor = false;
    }
    if (req.body.backDoor === "on") {
        var backDoor = true;
    } else {
        backDoor = false;
    }
    if (req.body.temperature === "on") {
        var temperature = true;
    } else {
        temperature = false;
    }
    if (req.body.humidity === "on") {
        var humidity = true;
    } else {
        humidity = false;
    }
    if (req.body.emailNotifications === "on") {
        var emailNotifications = true;
    } else {
        emailNotifications = false;
    }
    if (req.body.adminPrivileges === "on") {
        var adminPrivileges = true;
    } else {
        adminPrivileges = false;
    }
    db.userinfo.findOne({username: req.body.username}, function (error, user) {
        if (!user) {
            if (req.body.password !== req.body.confirmPassword || !req.body.firstName.trim() || !req.body.lastName.trim()
                || !req.body.username.trim() || !req.body.password.trim()) {
                res.send("please fill in all required fields");
            } else {
                insertUser(
                    req.body.firstName,
                    req.body.lastName,
                    req.body.email,
                    req.body.username,
                    req.body.password,
                    bedroomLight,
                    officeLight,
                    kitchenLight,
                    livingLight,
                    bathroomLight,
                    laundryLight,
                    frontDoor,
                    backDoor,
                    temperature,
                    humidity,
                    emailNotifications,
                    adminPrivileges
                );
                res.redirect("/");
            }
        } else {
            res.send("username is already taken");
        }
    });
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


