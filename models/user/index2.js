const mongoose = require('mongoose');

var UserChema = new mongoose.Schema({
    email: {
        type: String,
        lowercase: true,
        unique: true,
        required:true,
    },
    password: {
        type: String,
        required: true,
    }
});

UserChema.pre('findOneAndUpdate', (next) => {
    console.log('here');
}) ;

module.exports = mongoose.model('User', UserChema)