const {Schema, model} = require('mongoose');

const CategorySchema = new Schema({
    title: {
        type: Schema.Types.String,
        required: true
    },
    description: {
        type: Schema.Types.String,
    },
    categoryThumbnail: {
        type: Schema.Types.String,
        default: ''
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createDate: {
        type: Schema.Types.Date,
        default: Date.now()
    }
});

module.exports = model('Category', CategorySchema);