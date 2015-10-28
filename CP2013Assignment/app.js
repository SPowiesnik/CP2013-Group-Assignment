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

var http = require('http');
var path = require('path');
var favicon = require('serve-favicon');

var nodemailer = require('nodemailer');

var Datastore = require('nedb');

var lightModule = require('./data/lightModule');
var doorModule = require('./data/doorModule');

var db = {
    userinfo: new Datastore({filename: path.join(__dirname, 'data/userinfo.db'), autoload: true})
    , accessLog: new Datastore({filename: path.join(__dirname, 'data/accessLog.db'), autoload: true})
};

var app = express();

var server = http.createServer(app);

// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport({
    service: 'hotmail',
    auth: {
        user: '',
        pass: ''
    }
});

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


// Log Date/Time Functions
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

function getDate() {
    var date = new Date();
    var D = date.getDate();
    var M = (date.getMonth() + 1);
    var Y = date.getFullYear();
    return (D + '/' + M + '/' + Y)
}

//Access Log Insert
function addLog(firstname, lastname, action, door, date, time) {
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
}

//Temperature Dummy Data
var temp = 25;
function temperature(min, max) {
    temp += Math.floor(Math.random() * (max - min + 1)) + min;
    console.log('Temperature :' + temp);
}

setInterval(function () {
    temperature(-2, 2);
}, 60000);

//Humidity Percentage Dummy Data
var humid = 65;
function humidity(min, max) {
    humid += Math.floor(Math.random() * (max - min + 1)) + min;
    console.log('humidity: ' + humid);
}

setInterval(function () {
    humidity(-1, 1);
}, 60000);

//Lights Power Consumption Dummy Data
var light1;
var light2;
var light3;
var light4;
var light5;
var light6;
var total = 0;
var currentTotal;
function lightPower(min, max) {
    light1 = Math.floor(Math.random() * (max - min + 1)) + min;
    light2 = Math.floor(Math.random() * (max - min + 1)) + min;
    light3 = Math.floor(Math.random() * (max - min + 1)) + min;
    light4 = Math.floor(Math.random() * (max - min + 1)) + min;
    light5 = Math.floor(Math.random() * (max - min + 1)) + min;
    light6 = Math.floor(Math.random() * (max - min + 1)) + min;
    currentTotal = light1 + light2 + light3 + light4 + light5 + light6;
    total = total + currentTotal;
}

setInterval(function () {

    humidity(-1, 1);
}, 60000);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

setInterval(function () {
    lightPower(10, 15);
}, 600);

////////////////////////////////////////////Page Data Start/////////////////////////////////////////////////////////////

app.get('/', function (req, res) {
    if (!req.isAuthenticated()) {
        res.redirect('login');
    } else {
        lightModule.get(function (error, lightObject) {
            if (error) {
                console.log("app.get /getLightState error");
            } else {

                doorModule.get(function (error, doorObject) {
                    console.log(doorObject[0]);
                    if (error) {
                        console.log("app.get /getDoorState error");
                    } else {
                        res.render('index', {
                            user: req.user,
                            humidity: humid,
                            temperature: temp.toPrecision(2),
                            light1: lightObject[0].state,
                            light2: lightObject[1].state,
                            light3: lightObject[2].state,
                            light4: lightObject[3].state,
                            light5: lightObject[4].state,
                            light6: lightObject[5].state,
                            backDoor: doorObject[0],
                            frontDoor: doorObject[1]
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

function sendEmail(from, to, subject, text, html) {
    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: from, // sender address
        to: to, // list of receivers
        subject: subject, // Subject line
        text: text, // plaintext body
        html: html // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);
    });
}

app.post('/updateDoorState', function (req, res) {
    doorModule.getOne(req.body.door, function (error, door) {
        if (error) {
            console.log("error");
        } else {
            if (door.armed === true) {
                db.userinfo.find({}, function (error, users) {
                    console.log(users[0].email);
                    var receivers = [];
                    for (var i = 0, length = users.length; i < length; i++) {
                        if (users[i].emailNotifications === true) {
                            receivers.push(users[i].email);
                        }
                    }
                    console.log(receivers);
                    sendEmail('Jason Holdsworth <shaquille_powiesnik@hotmail.com>', // sender address
                        receivers, // list of receivers
                        'ARMED DOOR: ATTEMPTED ENTRY', // Subject line
                        req.user.firstname + ' ' + req.user.lastname + ' attempted to access the ' + req.body.door, // plaintext body
                        '<a href="views/doors.ejs">Hello world </a>'); // html body
                });
            } else {
                console.log(door.state);
                var state;
                if (door.state === "unlocked") {
                    state = "locked";
                } else if (door.state === "locked") {
                    state = "unlocked";
                }
                addLog(req.user.firstname, req.user.lastname, state, req.body.door, getDate(), getTime());
                doorModule.update(req.body.door, state, door.armed, function (error) {
                    if (error) {
                        console.log("app.get /getDoorState error");
                    }
                });
            }
        }
    });
    res.redirect(req.headers['referer']);
});

app.post('/armDoor', function (req, res) {
    var door;
    if (req.body.armButton === "armFrontDoor") {
        door = "frontDoor";
    } else {
        door = "backDoor";
    }
    doorModule.getOne(door, function (error, object) {

        app.post('/getDoorState', function (req, res) {
            doorModule.getOne(req.body.door, function (error, object) {

                if (error) {
                    console.log("app.get /getDoorState error");
                }
                console.log(object.state);
                var state;
                if (object.armed === true) {
                    state = false;
                } else {
                    state = true;
                }
                doorModule.update(door, object.state, state, function (error) {
                    if (error) {
                        console.log("app.get /getDoorState error");
                    }
                });
            });
            res.redirect(req.headers['referer']);
        });
    });
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

////////////////////////////////////////////Door Page///////////////////////////////////////////////////////////////////
app.get('/doors', verifyAuthenticated, function (req, res) {
    db.accessLog.find({}).sort({date: 1, time: -1}).exec(function (err, docs) {
        doorModule.get(function (error, doorObject) {
            if (error) {
                console.log("app.get /getDoorState error");
            } else {
                res.render('doors', {
                    user: req.user,
                    db: docs,
                    backDoor: doorObject[0],
                    frontDoor: doorObject[1]
                });
            }
        });
    });
});

///////////////////////////////////////////Access Log Page//////////////////////////////////////////////////////////////
app.get('/accessLogPage', verifyAuthenticated, function (req, res) {
    db.accessLog.find({}).sort({date: 1, time: -1}).exec(function (err, docs) {
        res.render('accessLogPage', {
            user: req.user,
            db: docs
        });
    });
});

//Database Clearance
app.post('/emptyLog', verifyAuthenticated, function (req, res) {
    console.log('cleared Log');
    db.accessLog.remove({}, {multi: true});
    res.redirect("accessLogPage");
});

///////////////////////////////////////////lights Page//////////////////////////////////////////////////////////////////
app.get('/lights', verifyAuthenticated, function (req, res) {
    res.render('lights', {
        user: req.user,
        light1: light1,
        light2: light2,
        light3: light3,
        light4: light4,
        light5: light5,
        light6: light6,
        currentTotal: currentTotal,
        total: total
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
    res.redirect("editProfile");
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
    res.redirect("removeProfile");
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
                res.redirect("newProfile");
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



