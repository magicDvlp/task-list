const {Schema, model} = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new Schema({
    name: {
        type: Schema.Types.String,
        default: ''
    },
    psw: {
        type: Schema.Types.String,
        required: true
    },
    email: {
        type: Schema.Types.String,
        required: true,
        unique: true
    },
    avatar: {
        type: Schema.Types.String,
        default: ''
    },
    registrationDate: {
        type: Schema.Types.Date,
        default: Date.now()
    },
    emailConfirm: {
        type: Schema.Types.Boolean,
        default: false
    }
});

UserSchema.statics.hashPassword = async function(password){
    return await bcrypt.hash(password, 10);
}

UserSchema.statics.matchPassword = async function(password, hash){
    const match = await bcrypt.compare(password, hash);
    if(!match){
        return false;
    }
    return true;
}

module.exports = model('User', UserSchema);