'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cors = require('cors');
var urlShortenerRouter= require('./controller/urlshortener');


var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
console.log('connecting to DB URI');

const serverConnected = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI,
      { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
    console.log('connected to mongo DataBase');
  } catch (error) { console.log('error connection to MongoDB:', error.message); }
};

serverConnected();

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({extended: false}));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

//URL Shortener Microservice
app.use('/api/shorturl',urlShortenerRouter);


app.listen(port, function () {
  console.log('Node.js listening ...');
});