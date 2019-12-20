const express = require('express')
const connectDB = require('./config/dbconnect');

const app = express();

//Database connection method call
connectDB();


app.get('/', (req, res)=> res.send('API Running'));

//Routes defined
app.use('/api/users', require('./routes/api/users'));
app.use('api/userpost', require('./routes/api/userpost'));
app.use('/api/authentication', require('./routes/api/authentication'));
app.use('/api/userprofile', require('./routes/api/userprofile'));


//routes.initialize(app);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log('Server satrted on port : '+ PORT));