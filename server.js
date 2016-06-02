var express = require('express');
var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');
var request = require('request');
var cheerio = require('cheerio');

var app = express();



app.use(express.static(__dirname));


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))


app.get('/', function(req, res){
	console.log('port 3000');
	res.send();
});

var imageCount = 0;
var linkCount = 0;

app.post('/scrape', function(req, res){
	console.log(req.body);
	//var url = Object.keys(req.body)[0];
	var url = Object.keys(req.body)[0];
	console.log(url);
	//var url = 'http://web.stanford.edu/~jmorg/';

	request(url, function(error, response, html){ 
		if(error){
			console.log('we have a problem: ' + error);
			response.status(500).send(JSON.stringify(error));
			return;
		}
		var $ = cheerio.load(html); //this lets cheerio act just like jquery

		

		var headers = $(':header');
		orderHeaders($, headers);		
		
		var paragraphs = $('p');
		paragraphs.each(function() {
			uncolor($, this);
		});

		var fonts = $('font');
		fonts.each(function() {
			uncolor($, this);
		});

		var images = $('img');
		imageCount = images.length;

		images.each(function(){			
			downloadImage($, this, url, res);
		});

		var links = $('link');		
		linkCount = links.length;

		links.each(function(){
			downloadLinks($, this, url, res);
		});

	});
});

function downloadLinks($, link, siteURL, res){
	var url = link.attribs.href;

	var name = 'scrapedLinks/' + path.basename(url);

	if (! (/^https?:\/\//.test(url))) { //regex to test if we can do it
		if(url[0]!='/'){
			url = '/' + url;
		}

		url = path.normalize(url);		

		if(url[0] === '/' && siteURL[siteURL.length -1] === '/'){
			url = url.substring(1, url.length);
		} else if (url[0] !== '/' && siteURL[siteURL.length -1] !== '/'){
			url = '/' + url;
		}

		url = siteURL + url;
	}

	var stream = fs.createWriteStream(name);

	stream.on('close', function() {
		linkCount--;
		console.log(linkCount);
		if(imageCount == 0 && linkCount == 0){
			console.log('finished');
			res.send($.html());
		}
	});

	request(url).pipe(stream);
	console.log(name);
	link.attribs.href = name;

}

function downloadImage($, image, siteURL, res){
	var url = image.attribs.src;

	var name = 'scrapedImages/' + path.basename(url);

	if (! (/^https?:\/\//.test(url))) { //regex to test if we can do it
		if(url[0]!='/'){
			url = '/' + url;
		}

		url = path.normalize(url);		

		if(url[0] === '/' && siteURL[siteURL.length -1] === '/'){
			url = url.substring(1, url.length);
		} else if (url[0] !== '/' && siteURL[siteURL.length -1] !== '/'){
			url = '/' + url;
		}

		url = siteURL + url;
	}

	var stream = fs.createWriteStream(name);

	stream.on('close', function() {
		imageCount--;
		if(imageCount == 0 && linkCount == 0){
			console.log('finished');
			res.send($.html());
		}
	});

	request(url).pipe(stream);
	image.attribs.src = name;
}

//TODO: test rigorously

function uncolor($, elt){
	var background = $(elt).css('background-color');
	if(!background || backround === 'white' || backround === '#ffffff'){
		$(elt).css('color', 'black');
	}
}


/* orderHeaders
 * takes in cheerior elements from DOM
 * sorts through to find which headers are children of which
 * then assigns them incremental 
 * TODO: test rigorously
 */

function orderHeaders($, headers){
	var headersDepth = [];
	var headerParents = [];

	//check if headers have a shared ancestor		
	for(var i = 0; i < headers.length; i++){
		var depth = getDOMDepth($, headers[i]);
		var headerObj = {
			'header': headers[i],
			'depth' :  depth,
		};
		headersDepth.push(headerObj);
		headerParents.push($(headers[i]).parent()[0]);
	}

	headersDepth.sort(function(a, b){
		return b.depth - a.depth;
	});

	//increment all header tags with depth > headers[i] and shared common ancestor
	for(var i = 0; i < headers.length; i++){
		for(var h = i+1; h < headers.length; h++){
			if(headersDepth[i] != headersDepth[h] && isDescendant($, headerParents[i], headerParents[h])){ 
				var biggerHeaderNum = extractHeaderNum(headers[i]);
				var smallerHeaderNum = extractHeaderNum(headers[h]);
				if(smallerHeaderNum <= biggerHeaderNum){		
					headers[h] = replaceHeaderTag($, headers[h], 1+biggerHeaderNum);
				}
			}	
		}
	}
}


function replaceHeaderTag($, header, newNum){

	var updatedTag = 'h' + newNum;
	var outer = $.html(header);

	var openingTagRegex = new RegExp('<' + header.tagName, 'i');
	var newTag = outer.replace(openingTagRegex, '<' + updatedTag);

	var closingTagRegex = new RegExp('</' + header.tagName, 'i');
	newTag = newTag.replace(closingTagRegex, '</' + updatedTag);

	//console.log(newTag);
	$(header).replaceWith($(newTag)[0]);
	//console.log($(newTag)[0]);

	return $(newTag)[0];

}


 /* getDOMDepth
  * takes in cheerio reference and an element
  * returns elements tree depth in DOM 
  */
function getDOMDepth($, element){
	var depth = 0;
	var elt = $(element)

	while(elt[0]){
		depth++;
		elt = elt.parent();
	}

	return depth;
}

/* isDescendant
 * takens in two DOM elements
 * returns if child is a descendant of parent
 */

 function isDescendant($, parent, child){
 	return $.contains(parent, child);
 }

 /* extractHeaderNum
 * takes in DOM element header
 * returns just the number in its tag
 */
function extractHeaderNum(header){
	return parseInt(header.tagName.substring(1, 2));
}

var server = app.listen(3000, function () {
    var port = server.address().port;
});

//exports = module.exports = app;