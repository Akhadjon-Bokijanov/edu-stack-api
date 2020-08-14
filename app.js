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
const exercisesRoute = require('./routes/exercises')
const home = require('./routes/home');

// patched mongoose
require('./helpers/customFuncs');

// database connection
const ConnectionString = 'mongodb+srv://Pr1nCe:r1552622q@cluster0-b1lbe.mongodb.net/edustack?retryWrites=true&w=majority'
mongoose.connect(
	ConnectionString, 
	{
		useUnifiedTopology: true, 
		useNewUrlParser: true,
		useFindAndModify: false,
		useCreateIndex: true
	}
);


// all middleware functions
app.disable('x-powered-by');
app.use(bodyParser.json({
		limit: '50mb', extended: true 
	}));
app.use(bodyParser.urlencoded({
		limit: "50mb", extended: true, parameterLimit:50000
	}));
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
app.use('/ES/api/exercises', exercisesRoute)
app.use('/', home);

const port = 8080;
app.listen(port, '172.31.6.217');
