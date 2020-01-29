const router = require('express').Router();
const {loginUser, refreshToken, registrationUser, resetPassword, setNewPassword} = require('../controllers/auth');
const {multerLoader} = require('../middleware');
const {registerFormValidator, loginUserDataValidator, refreshTokenValidator, resetPasswordValidator, storePasswordValidator} = require('../middleware/validators');

router.post('/login', [loginUserDataValidator], loginUser);
router.post('/login/refresh', [refreshTokenValidator], refreshToken);
router.post('/register', [multerLoader, registerFormValidator], registrationUser);
router.post('/resetPassword', [resetPasswordValidator], resetPassword);
router.post('/setNewPassword', [storePasswordValidator], setNewPassword);

module.exports = router;