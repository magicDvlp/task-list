const authRouter = require('./auth');
const userRouter = require('./user');
const taskRouter = require('./task');
const categoryRouter = require('./category');

function routersInit(app){
    app.use('/api', userRouter);
    app.use('/api', authRouter);
    app.use('/api', taskRouter);
    app.use('/api', categoryRouter);
}

module.exports = routersInit;