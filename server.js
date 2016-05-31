var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app = express();





app.get('/', function(req, res){
	console.log('port 3000');
});

app.get('/scrape', function(req, res){
	var url = 'http://web.stanford.edu/~jmorg/';

	request(url, function(error, response, html){ 
		if(error){
			console.log('we have a problem: ' + error);
			response.status(500).send(JSON.stringify(error));
			return;
		}
		var $ = cheerio.load(html); //this lets cheerio act just like jquery

		var headers = $(':header');
		var paragraphs = $('p');
		console.log(paragraphs);
		paragraphs.each(function() {
			uncolor($, this);
		});

		orderHeaders($, headers);

		res.send($.html());
	});
});

//TODO: test rigorously

function uncolor($, elt){
	var background = $(elt).css("background-color");
	if(!background || backround === "white" || backround === "#ffffff"){
		$(elt).css("color", "black");
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

	//check if headers have a shared ancestor		
	for(var i = 0; i < headers.length; i++){
		var depth = getDOMDepth($, headers[i]);
		var headerObj = {
			"header": headers[i],
			"depth" :  depth,
		};
		headersDepth.push(headerObj);
	}

	headersDepth.sort(function(a, b){
		return a.depth - b.depth;
	});

	//increment all header tags with depth > headers[i] and shared common ancestor

	for(var i = 0; i < headers.length; i++){
		for(var h = i+1; h < headers.length; h++){
			if(isDescendant($, $(headers[i]).parent()[0], headers[h])){ 

				var biggerHeaderNum = extractHeaderNum(headers[i]);
				var smallerHeaderNum = extractHeaderNum(headers[h]);

				if(smallerHeaderNum <= biggerHeaderNum){
					replaceHeaderTag($, headers[h], biggerHeaderNum+1);
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

	var closingTagRegex = new RegExp('</' + this.tagName, 'i');
	newTag = newTag.replace(closingTagRegex, '</' + updatedTag);

	$(header).replaceWith(newTag);
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
	return header.tagName.substring(1, 2);
}

app.listen('3000');

exports = module.exports = app;