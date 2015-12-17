// This file handles the configuration of the app.
// It is required by app.js

var express = require('express'),
	bodyParser = require('body-parser'),
 	methodOverride = require('method-override'),
 	fs = require('fs'),
 	path = require('path');

module.exports = function(app, io){

	// Set .html as the default template extension
	app.set('view engine', 'html');

	// Initialize the ejs template engine
	app.engine('html', require('ejs').renderFile);

	// Tell express where it can find the templates
	app.set('views', __dirname + '/views');
	app.use(bodyParser.urlencoded({ extended: false}));
	app.use(bodyParser.json());
	app.use(methodOverride('X-HTTP-Method'));          // Microsoft
	app.use(methodOverride('X-HTTP-Method-Override')); // Google/GData
	app.use(methodOverride('X-Method-Override'));  

	// Make the files in the public folder available to the world
	app.use(express.static(__dirname + '/public'));

};
