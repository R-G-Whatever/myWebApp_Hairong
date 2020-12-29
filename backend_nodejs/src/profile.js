const mongoose = require('mongoose');
const profileSchema = require('./profileSchema');
const Profile = mongoose.model('profile', profileSchema, 'profiles');
const config = require('./config');
const connectionString = config.MONGO;
const connector =  mongoose.connect(connectionString, { useFindAndModify: false, useNewUrlParser: true, useUnifiedTopology: true });

const uploadImage = require('./uploadCloudinary');

const getHeadline = (req, res) => {
    let username = req.params.user;
    (async () => {
        await (connector.then(()=> {
            // query the database for the user profile object with the username
            Profile.findOne({ 'username' : username }, 'username headline', (err, obj) => {
                if (err || !obj) {
                    res.status(400).end();
                } else {
                    res.send({ username : obj.username, headline : obj.headline });
                }
            });
        }));
    })();
}

const getDob = (req, res) => {
    let username = req.params.user;
    (async () => {
        await (connector.then(()=> {
            Profile.findOne({ 'username' : username }, 'username dob', (err, obj) => {
                if (err || !obj) {
                    res.status(400).end();
                } else {
                    let dob = obj.dob;
                    let dobConvert = new Date(dob); // TODO: the reverse: new Date().getTime();
                    res.send({ username : obj.username, dob : dobConvert });
                }
            });
        }));
    })();
}

const getPhone = (req, res) => {
    let username = req.params.user;
    (async () => {
        await (connector.then(()=> {
            Profile.findOne({ 'username' : username }, 'username phone', (err, obj) => {
                if (err || !obj) {
                    res.status(400).end();
                } else {
                    res.send({ username : obj.username, phone : obj.phone });
                }
            });
        }));
    })();
}

const getDisplayName = (req, res) => {
    let username = req.params.user;
    (async () => {
        await (connector.then(()=> {
            Profile.findOne({ 'username' : username }, 'username displayName', (err, obj) => {
                if (err || !obj) {
                    res.status(400).end();
                } else {
                    res.send({ username : obj.username, displayName : obj.displayName });
                }
            });
        }));
    })();
}

const getEmail = (req, res) => {
    let username = req.params.user;
    (async () => {
        await (connector.then(()=> {
            Profile.findOne({ 'username' : username }, 'username email', (err, obj) => {
                if (err || !obj) {
                    res.status(400).end();
                } else {
                    res.send({ username : obj.username, email : obj.email });
                }
            });
        }));
    })();
}

const getZipcode = (req, res) => {
    let username = req.params.user;
    (async () => {
        await (connector.then(()=> {
            Profile.findOne({ 'username' : username }, 'username zipcode', (err, obj) => {
                if (err || !obj) {
                    res.status(400).end();
                } else {
                    res.send({ username : obj.username, zipcode : obj.zipcode });
                }
            });
        }));
    })();
}

const getAvatar = (req, res) => {
    let username = req.params.user;
    (async () => {
        await (connector.then(()=> {
            Profile.findOne({ 'username' : username }, 'username avatar', (err, obj) => {
                if (err || !obj) {
                    res.status(400).end();
                } else {
                    res.send({ username : obj.username, avatar : obj.avatar });
                }
            });
        }));
    })();
}

const putHeadline = (req, res) => {
    let curLoggedUsername = req.username;
    let newHeadline = req.body.headline;

    (async () => {
        await (connector.then(()=> {
            Profile.findOneAndUpdate({ 'username' : curLoggedUsername },
                { 'headline' : newHeadline }, { new : true }, (err, obj) => {
                if (err || !obj) {
                    res.status(400).end();
                } else {
                    res.send({ username : curLoggedUsername, headline : newHeadline });
                }
            });
        }));
    })();
}

const putEmail = (req, res) => {
    let curLoggedUsername = req.username;
    let newEmail = req.body.email;
    (async () => {
        await (connector.then(()=> {
            Profile.findOneAndUpdate({ 'username' : curLoggedUsername },
                { 'email' : newEmail }, { new : true }, (err, obj) => {
                if (err || !obj) {
                    res.status(400).end();
                } else {
                    res.send({ username : curLoggedUsername, email : newEmail });
                }
            });
        }));
    })();
}

const putPhone = (req, res) => {
    let curLoggedUsername = req.username;
    let newPhone = req.body.phone;
    (async () => {
        await (connector.then(()=> {
            Profile.findOneAndUpdate({ 'username' : curLoggedUsername },
                { 'phone' : newPhone }, { new : true }, (err, obj) => {
                    if (err || !obj) {
                        res.status(400).end();
                    } else {
                        res.send({ username : curLoggedUsername, phone : newPhone });
                    }
                });
        }));
    })();
}

const putDisplayName = (req, res) => {
    let curLoggedUsername = req.username;
    let newDisplayName = req.body.displayName;
    (async () => {
        await (connector.then(()=> {
            Profile.findOneAndUpdate({ 'username' : curLoggedUsername },
                { 'displayName' : newDisplayName }, { new : true }, (err, obj) => {
                    if (err || !obj) {
                        res.status(400).end();
                    } else {
                        res.send({ username : curLoggedUsername, displayName : newDisplayName });
                    }
                });
        }));
    })();
}

const putZipcode = (req, res) => {
    let curLoggedUsername = req.username;
    let newZipcode = req.body.zipcode;
    (async () => {
        await (connector.then(()=> {
            Profile.findOneAndUpdate({ 'username' : curLoggedUsername },
                { 'zipcode' : newZipcode }, { new : true }, (err, obj) => {
                if (err || !obj) {
                    res.status(400).end();
                } else {
                    res.send({ username : curLoggedUsername, zipcode : newZipcode });
                }
            });
        }));
    })();
}

const putAvatar = (req, res) => {
    let curLoggedUsername = req.username;
    let newAvatar = req.fileurl;
    (async () => {
        await (connector.then(()=> {
            Profile.findOneAndUpdate({ 'username' : curLoggedUsername },
                { 'avatar' : newAvatar }, { new : true }, (err, obj) => {
                if (err || !obj) {
                    res.status(400).end();
                } else {
                    res.send({ username : curLoggedUsername, avatar : newAvatar });
                }
            });
        }));
    })();
}

module.exports = (app) => {
    app.get('/headline/:user?', getHeadline);
    app.put('/headline', putHeadline);

    app.get('/email/:user?', getEmail);
    app.put('/email', putEmail);

    app.get('/phone/:user?', getPhone);
    app.put('/phone', putPhone);

    app.get('/displayName/:user?', getDisplayName);
    app.put('/displayName', putDisplayName);

    app.get('/dob/:user?', getDob);

    app.get('/zipcode/:user?', getZipcode);
    app.put('/zipcode', putZipcode);

    app.get('/avatar/:user?', getAvatar);
    app.put('/avatar', uploadImage('text'), putAvatar);
}
