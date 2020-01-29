const {Schema, model} = require('mongoose');

const ResetPasswordSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    token: {
        type: Schema.Types.String,
        required: true
    },
    expire: {
        type: Schema.Types.String,
        default: Date.now() + 60 * 60 * 1000
    }
});

module.exports = model('ResetPassword', ResetPasswordSchema);