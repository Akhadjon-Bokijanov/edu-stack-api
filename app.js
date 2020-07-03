// all needed packages
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv/config');

// all needed routes 
const newsRoute = require('./routes/news');
const registerRoute = require('./routes/register');
const loginRoute = require('./routes/login');

// database connection
mongoose.connect(
	process.env.ConnectionString, {useNewUrlParser: true});


// all middleware functions
app.disable('x-powered-by');
app.use(bodyParser.json());
app.use('/ES/api/news', newsRoute);
app.use('/ES/api/register', registerRoute);
app.use('/ES/api/login', loginRoute);


app.listen(4000);