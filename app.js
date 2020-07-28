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
const questionsRoute = require('./routes/questions');
const blogRoute = require('./routes/blogs');
const surveyRoute = require('./routes/surveys');

// database connection
mongoose.connect(
	process.env.ConnectionString, 
	{
		useUnifiedTopology: true, 
		useNewUrlParser: true,
		useFindAndModify: false,
		useCreateIndex: true
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
app.use('/ES/api/questions', questionsRoute);
app.use('/ES/api/blogs', blogRoute);
app.use('/ES/api/surveys', surveyRoute);


app.listen(4000);

