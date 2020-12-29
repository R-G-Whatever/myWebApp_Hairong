const mongoose = require('mongoose');

const authSchema = new mongoose.Schema({
    username : {
        type : String,
        required: [true, 'Username is required']
    },
    fbid : {
        type : String
    },
    salt : {
        type : String
    },
    hash : {
        type : String
    },
    created: {
        type: Date,
        required: [true, 'Created date is required']
    }
})

module.exports = authSchema;
