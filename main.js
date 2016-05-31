$( document ).ready(function() {


$('#redesign').click(function() {
	var url = $('#redesignURL').val();
	console.log(url);
	var reqURL = {
		"url" : url
	};

 	var xhr = new XMLHttpRequest();
 	xhr.open("POST", "/scrape");
 	xhr.onreadystatechange = function(){
 		if(xhr.readyState == 4 && xhr.status == 200){
 			console.log(xhr.responseText);		
 		}
 	} 	

 	xhr.send(JSON.stringify(reqURL));
 	
 	//send request to server.js

});

});




