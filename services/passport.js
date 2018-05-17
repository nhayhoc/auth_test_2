var JwtStrategy = require('passport-jwt').Strategy,
ExtractJwt = require('passport-jwt').ExtractJwt;
var User = require('../models/user');
var config = require('../config/config');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;


module.exports = (passport)=>{


    //for JWT
    var opts = {}
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
    opts.secretOrKey = config.secret;
    passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
        if(jwt_payload) {
            return done(null, jwt_payload._id);
        } else {
            return done(null, false);
        }
    }));


    //for GOOGLE AUTH
    passport.use(new GoogleStrategy({
        clientID: '877129210233-qmrai9k1heckv1js90dvdocslrkou093.apps.googleusercontent.com',
        clientSecret: 'Zwg3V1jf4e_BmhFy6w0pGf9k',
        callbackURL: "/auth/google/callback"
        },
        function(accessToken, refreshToken, profile, done) {
            User.findOneOrCreateNewNoPassword(profile.emails[0].value, profile.name.familyName, profile.name.givenName, (err, token) => {
                if (err) { return done(err); }
                return done(null,  token)
            });
    }));

    //for FACEBOOK AUTH
    passport.use(new FacebookStrategy({
        clientID: '589814121397570',
        clientSecret: '6e46ccf51b7bf781c9845567e757fd98',
        callbackURL: "https://6f219b64.ngrok.io/auth/facebook/callback",
        profileFields: ['id', 'displayName', 'photos', 'email'],
        enableProof: true
    }, function(accessToken, refreshToken, data,  done) {
        const email = data.emails[0].value;
        const fullName = data.displayName.split(' ');
        const firstName = fullName[0];
        const lastName = fullName[fullName.length-1];
        console.log("email: ", email);
        console.log('-----------------------------------------------------------------------------------------------------------------------------------');

        User.findOneOrCreateNewNoPassword(email, firstName, lastName, (err, token)=>{
            if (err) { return done(err); }
            return done(null,  token);
        });
    }));

}
