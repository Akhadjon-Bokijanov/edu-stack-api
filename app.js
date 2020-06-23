const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv/config');

app.use(bodyParser.json());

mongoose.connect(
	process.env.ConnectionString, {useNewUrlParser: true});


const newsRoute = require('./routes/news');
app.use('/ES/api/news', newsRoute);


app.listen(4000);