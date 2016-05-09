var auth_user = "";

$(document).ready(function(){

	decryptCookie();

});


function readCookie(name) {
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2) return parts.pop().split(";").shift();
}


function decryptCookie(){

	var myCookie = readCookie('user_tk');
	var data = JSON.stringify({'token':myCookie});

	$.ajax({

		type:"POST",
	    url:"http://localhost:8051/decrypt",
	    contentType: "application/json; charset=utf-8",
	    data:data,
	    dataType:"json",

	    success: function(results){
	    	auth_user = results.token;
	    	home();

	    }

	});

}


function home(){

	$.ajax({

		type:"GET",
	    url:"http://localhost:8051/api/anoncare/home",
	    // dataType:"json",

	    success: function(results){

	    	console.log(results)
	    	console.log('check');
	    	$('#home').show();
	    	$('#login-form').hide();
	    	alert('OWW YOU HAVE A COOKIE IN YOUR BROWSER SO I AUTOMATICALLY LOGGED YOU IN. PLEASE DO YOUR TESTING NOW');
	    },

	    error: function(e, stats, err){
	    	console.log(err);
	    	console.log(stats);
	    	$('#login-form').show();
	    	console.log( "auth user" + auth_user );
	    },

	    beforeSend: function (xhrObj){

    		console.log("this is print this " + auth_user);
      		xhrObj.setRequestHeader("Authorization", "Basic " + btoa( auth_user ));
	    	
        }

	});

}


function signin(){
	var username = $('#username').val();
	var password = $('#password').val();

	var data = JSON.stringify({'username':username, 'password':password});

	$.ajax({

		type:"POST",
		url:"http://localhost:8051/auth",
		contentType:"application/json; charset=utf-8",
		data:data,
		dataType:"json",

		success: function(results){
			console.log(results.status);

			if(results.status == 'OK'){
				var token = results.token;
				//user_tk is abbrev of user_token
				document.cookie = "user_tk=" + token;
				console.log(results.data[0].role);
				$('#log-in-page').hide(0);

				if(results.data[0].role == 1){
					$('#admin-page').show(0);
				}

				if(results.data[0].role == 2){
					$('#doctor-page').show(0);
				}

				if(results.data[0].role == 3){
					$('#nurse-page').show();
				}
			}

			if(results.status == 'FAILED'){
				console.log('FAILED');
			}

			else{
				alert('ERROR 404');
			}

		},

		error: function(e, stats, err){
			console.log(err);
			console.log(stats);
		}

	});
}