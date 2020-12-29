const md5 = require('md5');
const mongoose = require('mongoose');
const authSchema = require('./authSchema');
const Auth = mongoose.model('auth', authSchema, 'auth');
const userSchema = require('./userSchema');
const User = mongoose.model('user', userSchema, 'user');
const profileSchema = require('./profileSchema');
const Profile = mongoose.model('profile', profileSchema, 'profiles');

const config = require('./config');
const redis = require('redis').createClient(config.REDIS);
const connectionString = config.MONGO;
const connector =  mongoose.connect(connectionString, { useFindAndModify: false, useNewUrlParser: true, useUnifiedTopology: true });

let cookieKey = "sid";

function isLoggedIn(req, res, next) {
    if (!req.cookies) {
        return res.sendStatus(401);
    }
    let sid;
    if(req.cookies[cookieKey]) {
        sid = req.cookies[cookieKey];
    } else {
        sid = req.cookies['connect.sid'];
    }
    if (!sid) {
        return res.sendStatus(401);
    }

    redis.hget('sessions', sid, (err2, res2) => {
        let username = res2;
        if (username) {
            req.username = username;
            next();
        } else if (req.cookies['user']) {
            req.username = req.cookies['user'];
            next();
        } else {
            return res.sendStatus(401);
        }
    });
    // let username = sessionUser[sid];
}

function login(req, res) {
    let username = req.body.username;
    let password = req.body.password;

    if (!username) {
        res.statusMessage = "User cannot be empty.";
        res.status(400).end();
    }

    if (!password) {
        res.statusMessage = "Password cannot be empty.";
        res.status(401).end();
    }

    (async () => {
        await (connector.then(()=> {
            Auth.findOne({ 'username' : username }, (err, obj) => {
                if (err || !obj) {
                    res.statusMessage = "Error in query: No user.";
                    res.status(400).end();
                } else {
                    let user = obj;
                    let hash = md5( user.salt + password );

                    if (hash === user.hash) {
                        let sid = md5(username);

                        redis.hmset('sessions', sid , username );
                        // sessionUser[sid] = username;

                        res.cookie(cookieKey, sid, { maxAge: 3600 * 1000, httpOnly: true, sameSite: "none", secure: true });
                        res.cookie("hasSid", "1", { maxAge: 3600 * 1000 });
                        let msg = { username: username, result: 'success' };
                        res.send(msg);
                    } else {
                        res.statusMessage = "Password Incorrect.";
                        res.status(401).end();
                    }
                }
            });
        }));
    })();
}

function register(req, res) {
    let username = req.body.username;
    let displayName = req.body.displayName;
    let password = req.body.password;
    let dob = req.body.dob;
    let email = req.body.email;
    let phone = req.body.phone;
    let zipcode = req.body.zipcode;

    if (!username || !password || !dob || !email) {
        res.statusMessage = "Info Incomplete.";
        res.status(400).end();
    }

    (async () => {
        await (connector.then(()=> {
            Auth.findOne({ 'username' : username }, (err, obj) => {
                if (!err && !obj) {
                    let salt = username + new Date().getTime();
                    let hash = md5( salt + password );
                    connector.then(() => {
                        new Auth({ username : username, salt: salt, hash: hash, created: Date.now() }).save();
                        new Profile({ username : username, displayName: displayName, dob: dob, email: email, phone: phone,
                            zipcode: zipcode, created: Date.now() }).save();
                        new User({ username : username, created: Date.now() }).save();
                        let msg = { username: username, result: 'success' };
                        res.send(msg);
                    });
                } else {
                    res.statusMessage = "This username exists in database.";
                    res.status(400).end();
                }
            });
        }));
    })();
}

function logout(req, res) {
    res.clearCookie(cookieKey);
    res.clearCookie("connect.sid");
    res.send({ statusMessage : "OK" }).end();
}

function putPassword(req, res) {
    let username = req.username;
    if (!username) {
        return res.sendStatus(401);
    }
    let newPassword = req.body.password;

    (async () => {
        await (connector.then(()=> {
            Auth.findOne({ 'username' : username }, (err, obj) => {
                if (err || !obj) {
                    res.status(400).send("Error in query: No user.");
                } else {
                    let user = obj;
                    let hash = md5( user.salt + newPassword );
                    Auth.findOneAndUpdate({ 'username' : username }, { 'hash' : hash }, (err2, obj2) => {
                        if (!err2) {
                            res.send({ username: username, result: 'success' });
                        }
                    });
                }
            });
        }));
    })();
}

module.exports = (app) => {
    app.post('/login', login);
    app.post('/register', register);
    app.use(isLoggedIn);
    app.put('/password', putPassword);
    app.put('/logout', logout);
}
