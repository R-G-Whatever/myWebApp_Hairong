const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
    pid : {
        type: Number,
        required: [true, 'PID is required']
    },
    author: {
        type: String,
        required: [true, 'Author is required']
    },
    body: {
        type: String,
        required: [true, 'Body is required']
    },
    imageUrl : {
        type: String
    },
    comments: [],
    created: {
        type: Date,
        required: [true, 'Created date is required']
    }
})

module.exports = articleSchema;
