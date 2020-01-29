const router = require('express').Router();
const {multerLoader, checkToken, updateUserDateValidator} = require('../middleware');
const {
    getUsers,
    updateUser,
} = require('../controllers/user');

router.put('/user', [
    checkToken, 
    updateUserDateValidator,
    multerLoader
], updateUser);
router.get('/user', checkToken, getUsers);

module.exports = router;