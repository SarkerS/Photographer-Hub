const mongoose = require('mongoose');
const config = require('config');
const db = config.get('databaseURI');


const connectDB = async () => {

try {
    await mongoose.connect(db, { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false });
    console.log('Database connected .....')
} catch (error) {
    
    console.log("Failed to connect Database!");
    process.exit(1); // process exit with failure
}    
}

module.exports = connectDB;