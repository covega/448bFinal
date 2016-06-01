$( document ).ready(function() {


$('#redesign').click(function() {
	var url = $('#redesignURL').val();
	console.log(url);
	var reqURL = {
		"url" : url
	};

 	var xhr = new XMLHttpRequest();

 	xhr.open("POST", "/scrape");
 	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");


 	xhr.onreadystatechange = function(){
 		if(xhr.readyState == 4 && xhr.status == 200){
 			console.log(xhr.responseText);
 			$("#redesignIframe").cntents().find('html').html(xhr.responseText);
 		}
 	} 	

 	xhr.send(url);
 	//xhr.send(url);
 	
 	//send request to server.js

});

});




