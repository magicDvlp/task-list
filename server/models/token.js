const config = require('config');
const {Schema, model} = require('mongoose');
const uuidv4 = require('uuid/v4');
var jwt = require('jsonwebtoken');
const JWT_SECRET = config.get('JWT_SECRET');

const TokenSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    refreshTokenUuid: {
        type: Schema.Types.String,
        required: true
    },
    fingerprint: {
        type: Schema.Types.String,
        required: true,
        default: 1
    },
    expiresIn: {
        type: Schema.Types.Number,
        required: true
    }
});

TokenSchema.statics.createAccessToken = function(userId){
    const payload = {
        userId,
        type: 'accessToken',
    };
    const options = {
        expiresIn: '15m'
    };
    return token = jwt.sign(payload, JWT_SECRET, options);
}

TokenSchema.statics.createRefreshToken = async function(userId, fingerprint){
    const payload = {
        userId,
        uuid: uuidv4(),
        type: 'refreshToken'
    };
    const options = {
        expiresIn: Date.now() + 30 * 24 * 60 * 60 * 1000
    };
    await this.create({
        userId,
        fingerprint,
        refreshTokenUuid: payload.uuid,
        expiresIn: options.expiresIn
    });
    return token = jwt.sign(payload, JWT_SECRET, options);
}

TokenSchema.statics.getTokens = async function(userId, fingerprint){
    return {
        accessToken: this.createAccessToken(userId),
        refreshToken: await this.createRefreshToken(userId, fingerprint)
    }
}

TokenSchema.statics.checkRefreshToken = async function(refreshToken, fingerprint){
    const decode = jwt.verify(refreshToken, JWT_SECRET);
    const tokenFromDb = await this.findOneAndDelete({refreshTokenUuid: decode.uuid});
    if(!tokenFromDb){
        throw new Error('Token failed!');
    }
    if(fingerprint != tokenFromDb.fingerprint){
        throw new Error('Fingerprint are failed!');
    }
    return tokenFromDb;
}

module.exports = model('Token', TokenSchema);