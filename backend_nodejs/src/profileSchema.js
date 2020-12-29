const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    username : {
        type : String,
        required: [true, 'Username is required']
    },
    displayName : {
        type: String
    },
    headline : {
        type : String
    },
    dob : {
        type : Number
    },
    phone : {
        type : String
    },
    email : {
        type : String
    },
    zipcode : {
        type : String
    },
    avatar : {
        type : String
    },
    created: {
        type: Date,
        required: [true, 'Created date is required']
    }
})

module.exports = profileSchema;
