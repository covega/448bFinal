var newCode = { 
	'text' : "Please redesign your webpage before downloading the new source code!"
}

$(document).ready(function() {


$("#redesign").click(function() {
	var url = $('#redesignURL').val();
	//var url = 'http://web.stanford.edu/~miland/samples/sample.html';
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
 			newCode.text = xhr.responseText; 
 			$("#redesignIframe").contents().find("html").html(xhr.responseText);
 			
 		}
 	} 	

 	xhr.send(url);
 	//xhr.send(url);
 	
 	//send request to server.js

});

$('#download').click(function() {

	var file = new File([newCode.text], "index_redesigned.html", {type: "text/html;charset=utf-8"});
	saveAs(file);

});


$('#preview').click(function(){
	$("#redesignIframe").css("display", "block");
});

});




