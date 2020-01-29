const {body} = require('express-validator');
const User = require('../models/user');

const registerFormValidator = [
    body('email')
    .isEmail()
    .withMessage('Укажите корректный email')
    .bail()
    .custom(async (email, {req}) => {
        try{
            const isDuplicateEmail = await User.findOne({email});
            if(isDuplicateEmail){
                return Promise.reject('Пользователь с таким email уже существует')
            }
        }catch(error){
            console.log(error);
        }
    }),
    body('psw')
    .isLength({min: 6, max: 50})
    .withMessage('Длина пароля должна быть не менее 6 символов')
    .isAlphanumeric()
    .withMessage('Пароль должен содержать только цифры и буквы латинского алфавита'),
    body('confirmPassword')
    .notEmpty()
    .withMessage('Подтвердите пароль')
    .custom(async (confirmPassword, {req}) => {
        if(confirmPassword !== req.body.psw){
            return Promise.reject('Пароли должны совпадать');
        }
    })
];

const loginUserDataValidator = [
    body('email')
    .isEmail()
    .withMessage('Укажите корректный email')
    .bail(),
    body('psw')
    .notEmpty()
    .bail()
    .withMessage('Укажите пароль')
    .isAlphanumeric()
    .withMessage('Пароль должен содержать только цифры и буквы латинского алфавита')
];

const refreshTokenValidator = [
    body('refreshToken')
    .notEmpty()
    .withMessage('Необходимо передать refresh token'),
    body('fingerprint')
    .notEmpty()
    .withMessage('Необходимо передать fingerprint'),
];

const updateUserDateValidator = [
    body('email')
    .if((value, {req}) => req.user.email !== value)
    .isEmail()
    .withMessage('Укажите корректный email')
    .bail()
    .custom(async (value, {req}) => {
        try{
            const isDuplicateEmail = await User.findOne({email: value});
            if(isDuplicateEmail){
                return Promise.reject('Пользователь с таким email уже существует')
            }
        }catch(error){
            console.log(error);
        } 
    }),
    body('newPassword')
    .if(value => value)
    .notEmpty()
    .isLength({min: 6, max: 50})
    .withMessage('Длина пароля должна быть не менее 6 символов')
    .isAlphanumeric()
    .withMessage('Пароль должен содержать только цифры и буквы латинского алфавита'),
    body('confirmPassword')
    .if((value, {req}) => req.body.newPassword)
    .notEmpty()
    .withMessage('Подтвердите пароль')
    .bail()
    .custom(async (confirmPassword, {req}) => {
        if(confirmPassword !== req.body.newPassword){
            return Promise.reject('Пароли должны совпадать');
        }
    }),
    body('psw')
    .if((value, {req}) => req.body.newPassword && req.body.confirmPassword)
    .notEmpty()
    .withMessage('Укажите свой текущий пароль')
    .bail()
    .custom(async (password, {req}) => {
        try{
            const isPasswordValid = await User.matchPassword(password, req.user.psw);
            if(!isPasswordValid){
                return Promise.reject('Текущий пароль указан неверно')
            }
        }catch(error){
            console.log(error);
        }
    })
];

const newCategoryValidator = [
    body('title')
    .trim()
    .notEmpty()
    .withMessage('Укажите название категории')
    .escape(),
    body('description')
    .if(value => value)
    .escape()
    .trim()
];

const newTaskValidator = [
    body('title')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Укажите название задачи'),
    body('description')
    .if(value => value)
    .escape()
    .trim(),
    body('expirationDate')
    .if(value => value)
    .escape()
    .trim()
    .custom(value => new Date(value) > Date.now())
    .withMessage('Дата окончания должна быть старше текущей даты')
];

const resetPasswordValidator = [
    body('email')
    .trim()
    .notEmpty()
    .withMessage('Укажите корректный email')
    .isEmail()
    .withMessage('Укажите корректный email')
];

const storePasswordValidator = [
    body('psw')
    .isLength({min: 6, max: 50})
    .withMessage('Длина пароля должна быть не менее 6 символов')
    .isAlphanumeric()
    .withMessage('Пароль должен содержать только цифры и буквы латинского алфавита'),
    body('confirmPassword')
    .notEmpty()
    .withMessage('Подтвердите пароль')
    .custom(async (confirmPassword, {req}) => {
        if(confirmPassword !== req.body.psw){
            return Promise.reject('Пароли должны совпадать');
        }
    })
];

module.exports = {
    registerFormValidator,
    updateUserDateValidator,
    newTaskValidator,
    newCategoryValidator,
    loginUserDataValidator,
    refreshTokenValidator,
    resetPasswordValidator,
    storePasswordValidator
}