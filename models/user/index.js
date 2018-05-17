const mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');
var config = require('../../config/config')

var {resetTokenGenerator} = require('../../helper/TokenGenerator');
var {emailValidator,pwdValidator,first_lastName} = require('./validate');
var UserChema = new mongoose.Schema({
    email: {
        type: String,
        lowercase: true,
        unique: true,
        required:true,
        validate: emailValidator
    },
    password: {
        type: String,
        required: true,
        validate: pwdValidator 
    },
    role: {
        type: String,
        enum: ['Client','Manager','Admin'],
        default: 'Client'
    },
    resetPasswordToken: {type: String},
    resetPasswordExpires: {type: String},
    verify: {
        type:Boolean,
        default: false
    },
    firstName: {
        type: String,
        required: true,
        validate: first_lastName
    },
    lastName: {
        type: String,
        required: true,
        validate: first_lastName
    }
}, {
    timestamps: true
});
var User = mongoose.model('User', UserChema);
module.exports = User;
// pre save 
UserChema.pre('save', function(next){
    if (this.isModified('password') || this.isNew) {
        var salt = bcrypt.genSaltSync(10);
        this.password =  bcrypt.hashSync(this.password, salt);
    } 
    next();
});


//Method 
module.exports.register = function(email, password, firstName, lastName, cb) {
    User.findOne({email}, (err, foundUser) => {
        if (err) { return cb(err); }
        if (foundUser) {
            return cb(null, {success: false, message: "Email exists"});
        }

        //Create new User with reset token
        resetTokenGenerator(3600000, (err, resetPasswordToken, resetPasswordExpires)=>{
            if (err) { return cb(err); }
            User.create({
                email, 
                password, 
                firstName, 
                lastName, 
                resetPasswordToken, 
                resetPasswordExpires, 
                verify: false
            }, (err) => {
                if (err) { return cb(err); }
                
                return cb(null, {success: true, message: "Create successfull. Your token verify: " + resetPasswordToken});
            })
        });
    })
}

module.exports.findOneOrCreateNewNoPassword = function(email, firstName, lastName, cb){
    User.findOne({email}, (err, foundUser)=>{
        if (err) { return cb(err); }
        if (foundUser) { 
            var token = jwt.sign({_id: foundUser._id}, config.secret);
            return cb(null, {token: "bearer "+token}); 
        }
        var newUser = {
            email,
            firstName,
            lastName,
            verify: true
        };
        User(newUser).save({validateBeforeSave: false}, (err, newUser) => {
            if (err) { return cb(err); }
            var token = jwt.sign({_id: newUser._id}, config.secret);
            return cb(null, {token: "bearer "+token}); 
        });
    });
}

module.exports.login = function(email, password, cb) {
    User.findOne({email}, (err, foundUser) => {
        if (err) { return cb(err); }

        //check mail exists
        if (!foundUser) {
            return cb(null, {success: false, message: "Email not found!"});
        }

        //compare password
        if (!bcrypt.compareSync(password, foundUser.password)) {
            return cb(null, {success: false, message: "Invalid password"})
        }
        
        //create token
        var token = jwt.sign({_id: foundUser._id}, config.secret);
        cb(null, {success: true, token: "bearer "+token  });
    })
}






/*
module.exports.verify = function(token, cb) {
    User.findOneAndUpdate({ resetPasswordToken: token, resetPasswordExpires: {$gt: Date.now() } }, 
        {
            verify: true,
            resetPasswordToken: null, 
            resetPasswordExpires: null
        }, (err, doc)=>{
        if (err) { return cb(err); }
        return cb(null, !!doc)
    });
}
module.exports.newVerify
*/














