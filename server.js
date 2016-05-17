var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app = express();

app.get('/', function(req, res){
	console.log('port 3000');
});

app.get('/scrape', function(req, res){
	var url = 'http://www.southandeastbayairportshuttle.com/';

	request(url, function(error, response, html){ 
		if(error){
			console.log('we have a problem: ' + error);
			response.status(500).send(JSON.stringify(error));
			return;
		}
		var $ = cheerio.load(html); //this lets cheerio act just like jquery

		var title = $('title').html();
		
		res.send(JSON.stringify(title));
	});
});

app.listen('3000');

exports = module.exports = app;