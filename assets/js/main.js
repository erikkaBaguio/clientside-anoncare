var auth_user = "";

$(document).ready(function(){

	decryptCookie();

});


function readCookie(name) {
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2) return parts.pop().split(";").shift();
}


function eraseCookie(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';

	$('#admin-page').hide(0);
	$('#nurse-page-page').hide(0);
	$('#doctor-page-page').hide(0);
	$('#add-user-form').hide(0);
	$('#log-in-page').show();

	$('#log-in-alert').html(
		'<div class="alert alert-warning"><strong>Success ' +
		 '!</strong> Successfully logged out.</div>');
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

	    },

	    error: function(e, stats, err){
	    	console.log(err);
	    	console.log(stats);
	    	$('#log-in-page').show();
	    	$('#footer').show();
	    }

	});

}


function home(){

	var myCookie = readCookie('user_tk');

	$.ajax({

		type:"GET",
	    url:"http://localhost:8051/api/anoncare/home/" + myCookie,
	    dataType:"json",

	    success: function(results){

	    	console.log(results)
	    	console.log('check');
	    	$('#login-form').hide();
	    	$('#footer').show();

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

	    },

	    error: function(e, stats, err){
	    	console.log(err);
	    	console.log(stats);
	    	$('#login-form').show();
	    	$('#footer').show();
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
					$('#welcome-alert-admin').html(
						'<div class="alert alert-success"><strong>Welcome ' + 
						results.data[0].fname +
						 '!</strong> Successfully logged in.</div>');

					$('#admin-name').html(results.data[0].fname + ' ' + results.data[0].lname);

					$("#welcome-alert-admin").fadeTo(2000, 500).slideUp(500);
				}

				if(results.data[0].role == 2){
					$('#doctor-page').show(0);
				}

				if(results.data[0].role == 3){
					$('#nurse-page').show();
				}
			}

			if(results.status == 'FAILED'){
				$('#log-in-alert').html(
					'<div class="alert alert-danger"><strong>FAILED ' +
					 '!</strong> Invalid username or password.</div>');
			}


		},

		error: function(e, stats, err){
			console.log(err);
			console.log(stats);
		}

	});
}


function storeUser(){

	var fname = $('#fname').val();
	var mname = $('#mname').val();
	var lname = $('#lname').val();
	var email = $('#email').val();
	var password = $('#password').val();
	var role_id = $('#role_id').val();

	var data = JSON.stringify({'fname':fname, 'mname':mname, 'lname':lname, 'email':email, 'password':password, 'role_id':role_id});

	$.ajax({

		type:"POST",
		url:"http://localhost:8051/api/anoncare/user",
		contentType:"application/json; charset=utf-8",
		data:data,
		dataType:"json",

		success: function(results){

			if(results.status == 'OK'){

				$('#welcome-alert-admin').html(
						'<div class="alert alert-success"><strong>Successfully added ' + 
						fname + lname +
						 '!</strong> with role id: '+ role_id +'</div>');
				$("#welcome-alert-admin").fadeTo(2000, 500).slideUp(500);

			}

			if(results.status == 'FAILED'){
				$('#welcome-alert-admin').html(
						'<div class="alert alert-danger"><strong>Failed to add ' + 
						fname + lname +
						 '!</strong> with role id: '+ role_id +'</div>');
				$("#welcome-alert-admin").fadeTo(2000, 500).slideUp(500);
			}

		},

		error: function(e, stats, err){
			console.log(err);
			console.log(stats);
		},

		beforeSend: function (xhrObj){

    		console.log("this is print this " + auth_user);
      		xhrObj.setRequestHeader("Authorization", "Basic " + btoa( auth_user ));
	    	
        }

	});

}

function checkPass(){
	var pass1 = document.getElementById('pass1');
	var pass2 = document.getElementById('pass2');
	var message = document.getElementById('confirmMessage');
	var goodColor = "#b6ffc7";
	var goodColor_font = "#66cc66"
	var badColor = "#ffdada";
	var badColor_font = "#ff3f3f";
	if(pass1.value == pass2.value){
	  pass2.style.backgroundColor = goodColor;
	  message.style.color = goodColor_font;
	  message.innerHTML = "Passwords Match!"
	  document.getElementById("submit_button").disabled = false;
	}
	else{
	  pass2.style.backgroundColor = badColor;
	  message.style.color = badColor_font;
	  message.innerHTML = "Passwords Do Not Match!"
	  document.getElementById("submit_button").disabled = true;
	}
}