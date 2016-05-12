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
	$('#view-user-table').hide();

	$('#log-in-alert').html(
		'<div class="alert alert-warning"><strong>Success ' +
		 '!</strong> Successfully logged out.</div>');

	$('#footer').hide();
}


function decryptCookie(){

	var myCookie = readCookie('user_tk');
	var data = JSON.stringify({'token':myCookie});

    $('#login-loading-image').show();

	$.ajax({

		type:"POST",
	    url:"http://localhost:8051/decrypt",
	    contentType: "application/json; charset=utf-8",
	    data:data,
	    dataType:"json",

	    success: function(results){
	    	auth_user = results.token;
	    	home();
	    	$('#login-loading-image').hide();

	    },

	    error: function(e, stats, err){
	    	console.log(err);
	    	console.log(stats);
	    	$('#log-in-page').show();
	    	$('#footer').show();
	    	$('#login-loading-image').hide();
	    }

	});

}


function home(){

	$.ajax({

		type:"GET",
	    url:"http://localhost:8051/api/anoncare/home/" + myCookie,
	    dataType:"json",

	    success: function(results){

	    	console.log(auth_user);
	    	console.log(results);
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
					$('#admin-name').html(results.data[0].fname + ' ' + results.data[0].lname);
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
	    	$('#footer').hide();
	    },

	    beforeSend: function (xhrObj){

    		console.log("this is print this " + auth_user);
      		xhrObj.setRequestHeader("Authorization", "Basic " + btoa( auth_user ));

        }

	});

}


function siginDecryption(){

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
	    	console.log('this is auth_user from siginDecryption: ' + auth_user);
			$('#login-loading-image').hide();
	    },

	    error: function(e, stats, err){
	    	console.log(err);
	    	console.log(stats);
	    	console.log('error from siginDecryption');
	    }

	});

}

function signin(){
	var username = $('#username').val();
	var password = $('#password').val();

	var data = JSON.stringify({'username':username, 'password':password});

	$('#login-loading-image').show();
	$('#log-in-page').hide();

	$.ajax({

		type:"POST",
		url:"http://localhost:8051/auth",
		contentType:"application/json; charset=utf-8",
		data:data,
		dataType:"json",

		success: function(results){

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
					$('#welcome-alert-doctor').html(
						'<div class="alert alert-success"><strong>Welcome ' +
						results.data[0].fname +
						 '!</strong> Successfully logged in.</div>');

					$('#doctor-name').html(results.data[0].fname + ' ' + results.data[0].lname);

					$("#welcome-alert-doctor").fadeTo(2000, 500).slideUp(500);
				}

				if(results.data[0].role == 3){
					$('#nurse-page').show(0);
					$('#welcome-alert-nurse').html(
						'<div class="alert alert-success"><strong>Welcome ' +
						results.data[0].fname +
						 '!</strong> Successfully logged in.</div>');

					$('#nurse-name').html(results.data[0].fname + ' ' + results.data[0].lname);

					$("#welcome-alert-nurse").fadeTo(2000, 500).slideUp(500);
				}

				siginDecryption();

				console.log('auth user from signin: ' + auth_user);
			}

			if(results.status == 'FAILED'){
				$('#login-loading-image').hide();
				$('#log-in-page').show();
				$('#log-in-alert').html(
					'<div class="alert alert-danger"><strong>FAILED ' +
					 '!</strong> Invalid username or password.</div>');
			}


		},

		error: function(e, stats, err){
			console.log(err);
			console.log(stats);
			$('#login-loading-image').hide();
		}

	});
}


function storeUser(){

	var fname = $('#registration-fname').val();
	var mname = $('#registration-mname').val();
	var lname = $('#registration-lname').val();
	var email = $('#registration-email').val();
	var password = $('#pass1').val();
	var username = $('#registration-username').val();
	var role_id = $('#registration-role_id').val();

	var data = JSON.stringify({'fname':fname, 'mname':mname, 'lname':lname, 'username':username, 'email':email, 'password':password, 'role_id':role_id});

	$.ajax({

		type:"POST",
		url:"http://localhost:8051/api/anoncare/user",
		contentType:"application/json; charset=utf-8",
		data:data,
		dataType:"json",

		success: function(results){

			console.log(results.status);

			if(results.status == 'OK'){

				$('#welcome-alert-admin').html(
						'<div class="alert alert-success"><strong>Successfully added ' +
						fname + lname +
						 '!</strong> with role id: '+ role_id +'</div>');
				$("#welcome-alert-admin").fadeTo(2000, 500).slideUp(500);

				var form = document.getElementById("registration-form");
				form.reset();
				$('#confirmMessage').hide();

			}

			if(results.status == 'FAILED'){
				$('#welcome-alert-admin').html(
						'<div class="alert alert-danger"><strong>Failed to add ' +
						fname + lname +
						 '!</strong>'+ results.message +'</div>');
				$("#welcome-alert-admin").fadeTo(2000, 500).slideUp(500);
			}

		},

		error: function(e, stats, err){
			console.log(err);
			console.log(stats);
		},

		beforeSend: function (xhrObj){

    		console.log(auth_user);
      		xhrObj.setRequestHeader("Authorization", "Basic " + btoa( auth_user ));

        }

	});

}


function searchUser(){

	var search = $('#admin-search-user').val();

	var data = JSON.stringify({'search':search});

	$.ajax({

		type:"POST",
		url:"http://localhost:8051/api/anoncare/user/search",
		contentType:"application/json; charset=utf-8",
		data:data,
		dataType:"json",

		success: function(results){

			console.log(results.status);

			if(results.status == 'OK'){

				$('#view-user-table-body').html(function(){

					var table = "";

					for (var i = 0; i < results.data.length; i++) {
						table_body = '<tr>'+
										'<td>'+ results.data[i].fname +'</td>' +
										'<td>'+ results.data[i].mname +'</td>' +
										'<td>'+ results.data[i].lname +'</td>' +
										'<td>'+ results.data[i].email +'</td>' +
										'<td>'+ results.data[i].role +'</td>' +
						 			+'</tr>'

						table = table+=table_body;
					}

					return table;

				});

				$('#view-user-table').show();

			}

			if(results.status == 'FAILED'){
				$('#welcome-alert-admin').html(
						'<div class="alert alert-danger"><strong>Failed to search ' +
						search +
						 '!</strong>'+ results.message +'</div>');
				$("#welcome-alert-admin").fadeTo(2000, 500).slideUp(500);
			}

		},

		error: function(e, stats, err){
			console.log(auth_user);
			console.log(e);
			console.log(err);
			console.log(stats);
		},

		beforeSend: function (xhrObj){

    		console.log(auth_user);
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


function storeAssessment(){
	var school_id = $('#school-id').val();
    var age = $('#age').val();
    var temperature = $('#temperature').val();
    var pulse_rate= $('#pulse-rate').val();
    var respiration_rate = $('#respiration-rate').val();
    var blood_pressure = $('#blood-pressure').val();
    var weight = $('#weight').val();
    var chief_complaint = $('#chief-complaint').val();
    var history_of_present_illness = $('#history-of-present-illness ').val();
    var medications_taken = $('#medications-taken').val();
    var diagnosis = $('#diagnosis').val();
    var recommendation = $('#recommendation').val();
    var attending_physician= $('#attending-physician').val();


    var data = JSON.stringify({'school_id':school_id,
    						   'age':age,
    						   'temperature':temperature,
    						   'pulse_rate':pulse_rate,
    						   'respiration_rate':respiration_rate,
    						   'blood_pressure':blood_pressure,
    						   'weight':weight,
    						   'chief_complaint':chief_complaint,
    						   'history_of_present_illness':history_of_present_illness,
    						   'medications_taken':medications_taken,
    						   'diagnosis':diagnosis,
    						   'recommendation':recommendation,
    						   'attending_physician':attending_physician
    						})

    $.ajax({
    	type:"POST",
    	url: "http://localhost:8051/api/anoncare/assessment",
    	contentType:"application/json; charset=utf-8",
		data:data,
		dataType:"json",

		success: function(){

		},
		error: function(){

		},
		beforeSend: function (xhrObj){

    		console.log(auth_user);
      		xhrObj.setRequestHeader("Authorization", "Basic " + btoa( auth_user ));

        }
    })
}
