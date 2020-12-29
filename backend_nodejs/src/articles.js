const mongoose = require('mongoose');
const articleSchema = require('./articleSchema');
const Article = mongoose.model('article', articleSchema, 'articles');
const userSchema = require('./userSchema');
const User = mongoose.model('user', userSchema, 'user');
const config = require('./config');

const connectionString = config.MONGO;
const connector =  mongoose.connect(connectionString, { useFindAndModify: false, useNewUrlParser: true, useUnifiedTopology: true });

const uploadImage = require('./uploadCloudinary');

const getArticle = (req, res) => {
    let param = req.params.id;
    (async () => {
        await (connector.then(()=> {
            Article.findOne({ 'pid' : param }, (err, obj) => {
                if (!err) {
                    res.send({ articles : [obj] });
                } else {
                    Article.find({ 'author' : param }, (err2, arr2) => {
                        if (!err2) {
                            res.send({ articles : arr2 });
                        } else {
                            res.status(400).end();
                        }
                    });
                }
            });
        }));
    })();
};

const getArticles = (req, res) => {
    let curLoggedUsername = req.username;
    (async () => {
        await (connector.then(()=> {
            User.findOne({ 'username' : curLoggedUsername }, (err, obj) => {
                if ( !err || obj ) {
                    let userList = ( obj.following || obj.following.length ) ? obj.following.concat(curLoggedUsername) : [curLoggedUsername] ;
                    Article.find({ 'author' : { $in : userList } }, (err2, arr2) => {
                        if (!err2 && arr2.length > 0) {
                            res.send({ articles : arr2 });
                        } else {
                            res.send({ articles : [] });
                        }
                    });
                } else {
                    res.send({ articles : [] });
                }
            });
        }));
    })();
};

const postArticle = (req, res) => {
    let pic = req.fileurl;
    let curLoggedUsername = req.username;
    (async () => {
        await (connector.then(() => {
            Article.countDocuments((err, c) => {
                if (!err) {
                    new Article({ pid: c, author : curLoggedUsername, imageUrl: pic, body: req.body.body, created: Date.now() }).save();
                    getArticles( req, res );
                }
            });
        }));
    })();
}

const putArticle = (req, res) => {
    // Update the article :id with a new text if commentId is not supplied.
    // Forbidden if the user does not own the article.
    // If commentId is supplied, then update the requested comment on the article, if owned.
    // If commentId is -1, then a new comment is posted with the text message.

    // check if the user owns the article
    let curLoggedUsername = req.username;
    let articleId = req.params.id;
    let commentId = req.body.commentId;
    let text = req.body.text;

    // get the article from database according to id
    (async () => {
        await (connector.then(()=> {
            Article.findOne({ 'pid' : articleId }, (err, obj) => {
                if (err) {
                    res.status(400).end();
                } else {
                    if ( obj.author !== curLoggedUsername && !commentId) {
                        res.status(401).end(); // cannot edit the article
                    } else {
                        if (commentId == null) {
                            Article.findOneAndUpdate({ 'pid' : articleId }, { 'body' : text }, (err2, obj2) => {
                                if (err2) {
                                    res.status(400).end(); // update article failed
                                } else {
                                    getArticles( req, res );
                                }
                            });
                        } else if (commentId === -1) {
                            let commentList = obj.comments;
                            commentList.push({ commentId : commentList.length, author : curLoggedUsername, text : text });
                            Article.findOneAndUpdate({ 'pid' : articleId }, { 'comments' : commentList }, (err2, obj2) => {
                                if (err2) {
                                    res.status(400).end(); // add comment failed
                                } else {
                                    getArticles( req, res );
                                }
                            });
                        } else {
                            let commentList = obj.comments;
                            let curComment = commentList[commentId];
                            if ( curComment && curComment.author === curLoggedUsername ) {
                                // change an element in a list
                                commentList[commentId].text = text;
                                Article.findOneAndUpdate({ 'pid' : articleId }, { 'comments' : commentList }, (err2, obj2) => {
                                    if (err2) {
                                        res.status(400).end(); // add comment failed
                                    } else {
                                        getArticles( req, res );
                                    }
                                });
                            } else {
                                res.status(401).end(); // cannot edit the comment
                            }
                        }
                    }
                }
            });
        }));
    })();
}

module.exports = (app) => {
    app.get('/articles/', getArticles);
    app.get('/articles/:id', getArticle);
    app.put('/articles/:id', putArticle);
    app.post('/article', uploadImage('text'), postArticle);
}
