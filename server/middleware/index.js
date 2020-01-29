const checkToken = require('./checkToken');
const multerLoader = require('./avatarLoader');
const {
    registerFormValidator,
    updateUserDateValidator,
    newTaskValidator,
    newCategoryValidator
} = require('./validators');
module.exports = {
    checkToken,
    multerLoader,
    registerFormValidator,
    updateUserDateValidator,
    newTaskValidator,
    newCategoryValidator
}