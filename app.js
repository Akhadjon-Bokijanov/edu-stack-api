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
const userSettings = require('./routes/me');
const usersRoute = require('./routes/allUsers');
const resourcesRoute = require('./routes/resources');
const test = require('./routes/test');

// database connection
mongoose.connect(
	process.env.ConnectionString, 
	{
		useUnifiedTopology: true, 
		useNewUrlParser: true
	}
);


// all middleware functions
app.disable('x-powered-by');
app.use(bodyParser.json());
app.use('/uploads/newsImages', express.static('uploads/newsImages'));
app.use('/uploads/avatars', express.static('uploads/avatars'));
app.use('/uploads/resources', express.static('uploads/resources'));
app.use('/ES/api/news', newsRoute);
app.use('/ES/api/register', registerRoute);
app.use('/ES/api/login', loginRoute);
app.use('/ES/api/me', userSettings);
app.use('/ES/api/users', usersRoute);
app.use('/ES/api/resources', resourcesRoute);
app.use('/', test);


app.listen(process.env.PORT || 3000);