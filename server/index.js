require('dotenv').config();
const config = require('config');
const express = require('express');
const bearerToken = require('express-bearer-token');
const PORT = process.env.PORT || 3000;
const db = require('./db');
const {checkToken} = require('./middleware');
var morgan = require('morgan');
//routers require
const routersInit = require('./routes');

const app = express();
app.use(bearerToken());
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(morgan('tiny'))
//routers include
routersInit(app);

app.get('/', checkToken, (req, res)=>{
    res.send('Hello world!');
});

app.listen(PORT, () => {
    console.log(`The server was started on port ${PORT}`);
});