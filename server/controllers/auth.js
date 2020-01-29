const User = require('../models/user');
const Token = require('../models/token');
const ResetPassword = require('../models/resetPassword');
const jwt = require('jsonwebtoken');
const {validationResult} = require('express-validator');
const {welcomeLetter, resetPasswordLetter} = require('../email');
const crypto = require('crypto');
const util = require('util');

const registrationUser = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).json({success: false, error: errors.array()})
    }
    const {psw, fingerprint, ...rest} = req.body;
    const user = new User({
        ...rest,
        psw: await User.hashPassword(psw),
        avatar: req.files.avatar ? req.files.avatar[0].path : ''
    });
    if(!user){
        res.status(400).json({success: false, error: 'User not created'});
    }
    try{
        const {accessToken, refreshToken} = await Token.getTokens(user._id, fingerprint);
        await user.save();
        welcomeLetter(user.email);
        return res.status(201).json({
            success: true,
            message: 'User created',
            token: {accessToken, refreshToken},
            data: user
        })
    }catch(error){
        return res.status(400).json({
            success: false,
            message: error.message,
            error
        })
    }
};

const loginUser = async (req, res) => {

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).json({success: false, error: errors.array()})
    }

    const {email, psw, fingerprint} = req.body;
    try{
        const candidate = await User.findOne({email});
        if(!candidate){
            throw new Error('Email or password not corect!');
        }
        const isPasswordValid = await User.matchPassword(psw, candidate.psw);
        if(!isPasswordValid){
            throw new Error('Email or password not corect!')
        }
        if(!fingerprint || !fingerprint.length){
            throw new Error('Fingerprint not found!')
        }
        const {accessToken, refreshToken} = await Token.getTokens(candidate._id, fingerprint);
        return res.status(200).json({
            success: true,
            user: candidate,
            token: {accessToken, refreshToken}
        });
    }catch(error){
        console.log(error);
        return res.status(400).json({
            success: false,
            error: error.message
        })
    }
}

const resetPassword = async (req, res) => {

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).json({success: false, error: errors.array()});
    }

    const {email} = req.body;

    try{
        const candidate = await User.findOne({email});
        if(!candidate){
            return res.status(400).json({success: false, error: 'Пользователь с таким email не найден!'});
        }
        ResetPassword.findOneAndDelete({userId: candidate._id});
        const randomByte = util.promisify(crypto.randomBytes);
        const token = (await randomByte(32)).toString('hex');
        const newResetPasswordRequest = new ResetPassword({
            userId: candidate._id,
            token
        });
        await newResetPasswordRequest.save();
        resetPasswordLetter({email, token});
        return res.status(200).json({success: true, message: 'На ваш Email отправлено письмо с инструкциями для востановления.'})
    }catch(error){
        console.log(error);
        return res.status(400).json({success: false, error: error.message});
    }

}

const setNewPassword = async (req, res) => {

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).json({success: false, error: errors.array()});
    }

    const {token, psw} = req.body;

    try{
        const resetPasswordBid = await ResetPassword.findOneAndDelete({token});
        if(!resetPasswordBid || resetPasswordBid.expire < Date.now()){
            return res.status(400).json({success: false, error: 'Ошибка! Указанный токен неправильный или его срок действия истек! Попробуйте еще раз.'});
        }
        const passwordHash = await User.hashPassword(psw);
        const updatedUser = await User.findOneAndUpdate({_id: resetPasswordBid.userId}, {psw: passwordHash}, {new: true});
        if(!updatedUser){
            return res.status(400).json({success: false, error: 'Ошибка! Пользователь не найден!'});
        }
        await Token.deleteMany({userId: resetPasswordBid.userId});
        return res.status(200).json({success: true, message: 'Пароль изменен!'});
    }catch(error){
        console.log(error);
        return res.status(400).json({success: false, error: error.message})
    }

}

const refreshToken = async (req, res) => {

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).json({success: false, error: errors.array()})
    }

    const {fingerprint, refreshToken} = req.body;

    try{
        const oldToken = await Token.checkRefreshToken(refreshToken, fingerprint);
        const newTokens = await Token.getTokens(oldToken.userId, fingerprint);
        res.status(200).json({
            success: true,
            token: {
                ...newTokens
            }
        });
    }catch(error){
        if(error instanceof jwt.TokenExpiredError){
            const {uuid} = jwt.decode(refreshToken);
            await Token.findOneAndDelete({refreshTokenUuid: uuid});
        }
        return res.status(401).json({success: false, error: error.message});
    }
}

module.exports = {
    loginUser,
    refreshToken,
    registrationUser,
    resetPassword,
    setNewPassword
}