const auth = require('./src/auth');
const profile = require('./src/profile');
const articles = require('./src/articles');
const following = require('./src/following');
const cors = require('cors');
const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const mongoose = require('mongoose');
const authSchema = require('./src/authSchema');
const Auth = mongoose.model('auth', authSchema, 'auth');
const userSchema = require('./src/userSchema');
const User = mongoose.model('user', userSchema, 'user');
const profileSchema = require('./src/profileSchema');
const Profile = mongoose.model('profile', profileSchema, 'profiles');

const config = require('./src/config');
const connectionString = config.MONGO;
const redis = require('redis').createClient(config.REDIS);

const connector =  mongoose.connect(connectionString, { useFindAndModify: false, useNewUrlParser: true, useUnifiedTopology: true });

const session = require('express-session');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;

let corsOptions = {
    origin : config.FRONTEND_HOST,
    optionsSuccessStatus : 200,
    credentials : true,
    methods : 'GET, PUT, POST, DELETE, OPTIONS',
    allowedHeaders : 'Authorization, Content-Type, Origin, X-Requested-With',
    exposedHeaders : 'Location, X-Session-Id'
}

app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors(corsOptions));

/////////////////////////////////////////////////////////////////////////////////
///////////////////Below are third party authentication//////////////////////////
/////////////////////////////////////////////////////////////////////////////////

passport.use(new FacebookStrategy({
        clientID: config.FACEBOOK_CLIENT_ID,
        clientSecret: config.FACEBOOK_CLIENT_SECRET,
        callbackURL: "/facebook/callback"
    },
    function(accessToken, refreshToken, profile, done) {
        let user = {
            'fbname' : profile.displayName,
            'fbid'   : profile.id,
            'token': accessToken
        };

        (async () => {
            await (connector.then(()=> {
                Auth.findOne({ 'username' : user.fbid }, (err, obj) => {
                    if (!err && !obj) {
                        connector.then(() => {
                            new Auth({ username : user.fbid, fbid: user.fbid, created: Date.now() }).save();
                            new Profile({ username : user.fbid, displayName: user.fbname, created: Date.now() }).save();
                            new User({ username : user.fbid, created: Date.now() }).save();
                        });
                    } else if (err) {
                        return done(err);
                    }
                    done(null, user);
                });
            }));
        })();
    })
);

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

app.use(session({
    secret: 'thisisasecret',
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

// Redirect the user to Facebook for authentication.  When complete,
// Facebook will redirect the user back to the application at
//     /auth/facebook/callback
app.get('/facebook', passport.authenticate('facebook')); // could have a passport auth second arg {scope: 'email'}

getCookie = (string, cname) => {
    const name = cname + "=";
    const ca = string.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

// Facebook will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
app.get('/facebook/callback', function(req, res, next){
        passport.authenticate('facebook', function(err, user, profile){
            if (!err) {
                let cookie = req.headers.cookie;
                let sid = getCookie(cookie, "connect.sid");
                redis.hmset('sessions', sid , user.fbid );
                res.cookie("hasSid", "1", { maxAge: 3600 * 1000 });
                res.cookie("user", user.fbid, { maxAge: 3600 * 1000 });
            }
            res.redirect(config.FRONTEND_HOST);
        })(req, res, next);
});

/////////////////////////////////////////////////////////////////////////////////
///////////////////Above are third party authentication//////////////////////////
/////////////////////////////////////////////////////////////////////////////////
auth(app);
profile(app);
articles(app);
following(app);

// Get the port from the environment, i.e., Heroku sets it
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    const addr = server.address();
    console.log(`Server listening at http://${addr.address}:${addr.port}`)
});
