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

	res.send();
});

var imageCount = 0;
var linkCount = 0;

app.post('/scrape', function(req, res){
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

function sendResponse($, res){
	updateLayout($);

	var headers = $(':header');
	orderHeaders($, headers);	

	headers.each(function() {
		cleanFont($, this);
	});
	
	var paragraphs = $('p');
	paragraphs.each(function() {
		cleanFont($, this);
	});

	var fonts = $('font');
	fonts.each(function() {
		cleanFont($, this);
	});

	updateBody($); 

	res.send($.html());
}

function updateLayout($){
	var divs = $('div');
	for(var i = 0; i < divs.length; i++){
		if(getDOMDepth($, divs[i]) < 5){
			//if($(divs[i]).css("width") || $(divs[i]).css("max-width")){
				//console.log(divs[i]);
				$(divs[i]).css("width", "95vw !important");
				$(divs[i]).css("max-width", "95vw !important");
			//}
		}
	}

}

function updateBody($){
	var bodies = $('body');
	var background = $(bodies[0]).css('background-color');
	console.log(background);

	var buttons = $('button');
	buttons.each(function() { 
		cleanButton($, this, background);
	});

	var navLinks = $('a');
	navLinks.each(function() { 
		cleanNavLinks($, this);
	});

	$(bodies[0]).css("background-color", "white");

}

function cleanButton($, elt, color){
	$(elt).css("color", color);
	$(elt).css("background", "black");
	$(elt).css("font-family", "Times New Roman");
}

function cleanNavLinks($, elt){
	var title = $(elt).innerHTML;
	$(elt).css("color", "black");
	$(elt).css("font-weight", "bold");
	$(elt).css("font-size", "20px");
	$(elt).css("font-family", "Times New Roman");
	$(elt).css("text-decoration", "none");
	$(elt).css("title", title);
}

function downloadLinks($, link, siteURL, res){
	var url = link.attribs.href;

	url = parseURL(url, siteURL);

	var name = 'scrapedLinks/' + path.basename(url);

	if(!url) return;
	var stream = fs.createWriteStream(name);

	stream.on('close', function() {
		linkCount--;
		if(imageCount == 0 && linkCount == 0){
			sendResponse($, res);
		}
	});

	request(url).pipe(stream);

	//FIXME: remove before using on different port
	link.attribs.href = "http://localhost:3000/" + name;

}

function downloadImage($, image, siteURL, res){
	var url = image.attribs.src;

	url = parseURL(url, siteURL);

	var name = 'scrapedImages/' + path.basename(url);

	if(!url) return;

	var stream = fs.createWriteStream(name);

	stream.on('close', function() {
		imageCount--;
		if(imageCount == 0 && linkCount == 0){
			sendResponse($, res);		
		}
	});

	request(url).pipe(stream);

	console.log(name);
	//FIXME: remove before using on different port
	image.attribs.src = "http://localhost:3000/" + name;
}

function parseURL(url, siteURL){
	if(!url) return '';

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

	return url;
}


//TODO: test rigorously

function cleanFont($, elt){
	var background = $(elt).css('background-color');
	if(!background || backround === 'white' || backround === '#ffffff'){
		//console.log('color removed!');
		$(elt).css('color', 'black');
	}

	$(elt).css("font-family", "Times New Roman");
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
					console.log('headers reorded!');
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

	$(header).replaceWith($(newTag));

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
