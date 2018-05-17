var morgan = require('morgan');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var express = require('express');
var config = require('./config/config.js');
var passport = require('passport');

var User = require('./models/user/index');
// var jwt = require('jsonwebtoken');


var app = express();

app.use(passport.initialize());
require('./services/passport')(passport);

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(morgan('dev'));
mongoose.connect(config.database);


// User. findOne({email: "nhayhofdac@gmail.com"}, (err, foundUser)=> {
//     foundUser.password = "Herorich1";
//     foundUser.save();
// })

// User.register("nhayhofdfdac@gmail.com", "Herorich1", "Duc", "Master", (err, message) => {
//     if (err) { return console.log("err", err); }
//     console.log("message: ", message);
// });

// User.login("nhayhofdfdac@gmail.com", "Herorich1", (err, message)=> {
//     if (err) { return console.log("err: ", err); }
//     console.log("message: ", message);
// })

// User.verify("a989bf91dc3055631002b4becb6aae303a4ca15753ce3730404ffe833457624ace7b7f32bd9f1398e130cd891316af83", (err, success)=>{
//     console.log("success: ", success);
// })


app.get('/test',  passport.authenticate('jwt', { session: false }), (req,res) => {
    res.send(req.user);
});


//GOOGLE auth
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile','email'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login',  session: false }),
  function(req, res) {
    res.cookie('auth',  req.user.token);
    res.redirect('/');
});


//FACEBOOK auth
app.get('/auth/facebook',
  passport.authenticate('facebook' , {scope:['email']}));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login',session: false }), function(req, res) {
    console.log(req.user.token);
    res.cookie('auth',  req.user.token);
    res.redirect('/');
});

app.get('/', (req, res)=>{
    res.json('Token in cookie');
});



app.listen(3000);





























// app.use(passport.initialize());



