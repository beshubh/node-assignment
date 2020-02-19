const passport = require('passport');

const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt  = require('jsonwebtoken');


const User = require('./models/users');

const config = require('./config');




exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


exports.getToken =(user)=>{
    return jwt.sign(user, config.secretKey, {expiresIn:3600})
}
const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new JwtStrategy(opts,(jwtPayload, done)=>{
    console.log('jwt payload',jwtPayload);
    User.findOne({_id:jwtPayload._id},(err, user)=>{
        if(err) {
            return done(err,false);
        } else if(user) {
            return done(null, user);
        } else{
            done(null, false);
        }
    });
}));
exports.verifyUser = passport.authenticate('jwt',{session:false});