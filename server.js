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

/* orderHeaders
 * takes in cheerior elements from DOM
 * sorts through to find which headers are children of which
 * then assigns them incremental 
 */

function orderHeaders(headers){
	//for each elt in headers
		//get which headers are its immediate children
		//mark "height" in DOM

	//once I have all children
	//starting from headers that are "highest up"
		//get childrens header tags
		//if not smaller, assign a header tag that is 1 smaller
}

/* isChild 
 * takens in two DOM elements
 * returns if child is a child of parent
 */

 function isChild(parent, child){
 	
 }

app.listen('3000');

exports = module.exports = app;