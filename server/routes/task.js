const router = require('express').Router();
const {createTask, deletTask, updateTask, getTasks, getTaskById} = require('../controllers/task');
const {checkToken, newTaskValidator} = require('../middleware');

router.post('/task', [checkToken, newTaskValidator], createTask);
router.put('/task/:id', [checkToken, newTaskValidator], updateTask);
router.get('/task', [checkToken], getTasks);
router.get('/task/:id', [checkToken], getTaskById);
router.delete('/task', checkToken, deletTask);

module.exports = router;