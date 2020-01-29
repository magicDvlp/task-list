const {Schema, model} = require('mongoose');

const TaskSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: Schema.Types.String,
        required: true
    },
    description: {
        type: Schema.Types.String,
        default: ''
    },
    createdDate: {
        type: Schema.Types.Date,
        default: Date.now()
    },
    expirationDate: {
        type: Schema.Types.Date,
        default: '',
        min: Date.now()
    },
    isCompleted: {
        type: Schema.Types.Boolean,
        default: false
    },
    position: {
        type: Schema.Types.Number,
        default: 0
    },
    categoryId: [{
        type: Schema.Types.ObjectId,
        ref: 'Category'
    }]
});

module.exports = model('Task', TaskSchema);