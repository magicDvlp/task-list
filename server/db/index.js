const config = require('config');
const mongoose = require('mongoose');
const MONGO_URI = config.get('MONGO_URI');

async function DbConnect(){
    try{
        const response = await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true, 
            useUnifiedTopology: true,
            useFindAndModify: false
        });
        const db = response.connection;
        return db;
    }catch(error){
        console.log(error);
    }
}

const db = DbConnect();

module.exports = db;