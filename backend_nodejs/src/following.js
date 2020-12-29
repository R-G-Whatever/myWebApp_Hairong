const mongoose = require('mongoose');
const userSchema = require('./userSchema');
const User = mongoose.model('user', userSchema, 'user');
const config = require('./config');
const connectionString = config.MONGO;
const connector =  mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });

const getFollowing = (req, res) => {
    let username = req.params.user;
    (async () => {
        await (connector.then(()=> {
            User.findOne({ 'username' : username }, 'username following', (err, obj) => {
                if (err || !obj) {
                    res.status(400).send("error");
                } else {
                    res.send({ username: obj.username, following: obj.following });
                }
            });
        }));
    })();
};

const putFollowing = (req, res) => {
    let curLoggedUsername = req.username;
    let userToBeFollowed = req.params.user;
    (async () => {
        await (connector.then(()=> {
            User.findOne({ 'username' : userToBeFollowed }, 'username' , (err, obj) => {
                if (err || !obj) {
                    res.statusMessage = "Error: the user to be followed does not exist!";
                    res.status(400).end();
                } else {
                    User.findOne({ 'username' : curLoggedUsername }, 'following', (err2, obj2) => {
                        if (err2 || !obj2) {
                            res.statusMessage = "Error in query!";
                            res.status(400).end();
                        } else {
                            let list = obj2.following;
                            let newUsername = obj.username;
                            if (list.indexOf(newUsername) > -1 || newUsername === curLoggedUsername) {
                                res.statusMessage = "This user has already been followed.";
                                res.status(400).end();
                            } else {
                                let newList = list.concat(newUsername);
                                User.findOneAndUpdate({ 'username' : curLoggedUsername }, { 'following' : newList }, { new : true },(err3, obj3) => {
                                    if (!err3) {
                                        res.send({ username: obj3.username, following: obj3.following });
                                    }
                                });
                            }
                        }
                    });
                }
            });
        }));
    })();
}

const deleteFollowing = (req, res) => {
    let curLoggedUsername = req.username;
    let userToBeDeleted = req.params.user;
    (async () => {
        await (connector.then(()=> {
            User.findOne({ 'username' : curLoggedUsername }, 'username following', (err, obj) => {
                if (err || !obj) {
                    res.status(400).send("error");
                } else {
                    let followingList = obj.following;
                    for ( let i = 0; i < followingList.length; i++ ) {
                        if ( followingList[i] === userToBeDeleted ) {
                            followingList.splice(i, 1);
                        }
                    }
                    User.findOneAndUpdate({ 'username' : curLoggedUsername },
                        { 'following' : followingList }, { new : true },(err2, obj2) => {
                        if (!err2) {
                            res.send({ username: obj2.username, following: obj2.following });
                        }
                    });
                }
            });
        }));
    })();
}

module.exports = (app) => {
    app.get('/following/:user?', getFollowing);
    app.put('/following/:user', putFollowing);
    app.delete('/following/:user', deleteFollowing);
}
