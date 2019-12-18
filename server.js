const express = require('express')
const connectDB = require('./config/dbconnect');

const app = express();

//Database connection method call
connectDB();


app.get('/', (req, res)=> res.send('API Running'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log('Server satrted on port : '+ PORT));