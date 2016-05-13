var auth_user = "";
var user_role;
var timer = 0;

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

	stop();
	$('#admin-page').hide(0);
	$('#nurse-page').hide(0);
	$('#doctor-page').hide(0);
	$('#add-user-form').hide(0);
	$('#log-in-page').show();
	$('#view-user-table').hide();

	var form = document.getElementById("registration-form");
	form.reset();

	var loginForm = document.getElementById("login-form");
	loginForm.reset();

	clearAssessmentForm();

	$('#log-in-alert').html(
		'<div class="alert alert-success"><strong>Success ' +
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
	    	$('#log-in-page').show();
	    	$('#footer').show();
	    	$('#login-loading-image').hide();
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

	    	$('#login-form').hide();
	    	$('#footer').show();

	    	if(results.status == 'OK'){
				var token = results.token;
				//user_tk is abbrev of user_token
				document.cookie = "user_tk=" + token;

				$('#log-in-page').hide(0);

				if(results.data[0].role == 1){
					$('#admin-page').show(0);
					$('#admin-name').html(results.data[0].fname + ' ' + results.data[0].lname);

					user_role = results.data[0].role;

				}

				if(results.data[0].role == 2){
					$('#doctor-page').show(0);

					user_role = results.data[0].role;
				}

				if(results.data[0].role == 3){
					$('#nurse-page').show();
					user_role = results.data[0].role;
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
			$('#login-loading-image').hide();
	    },

	    error: function(e, stats, err){
	    	console.log(err);
	    	console.log(stats);
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
				$('#log-in-page').hide(0);

				if(results.data[0].role == 1){
					$('#admin-page').show(0);
					$('#welcome-alert-admin').html(
						'<div class="alert alert-success"><strong>Welcome ' +
						results.data[0].fname +
						 '!</strong> Successfully logged in.</div>');

					$('#admin-name').html(results.data[0].fname + ' ' + results.data[0].lname);

					$("#welcome-alert-admin").fadeTo(2000, 500).slideUp(500);

					user_role = results.data[0].role;
				}

				if(results.data[0].role == 2){
					$('#doctor-page').show(0);
					$('#welcome-alert-doctor').html(
						'<div class="alert alert-success"><strong>Welcome ' +
						results.data[0].fname +
						 '!</strong> Successfully logged in.</div>');

					$('#doctor-name').html(results.data[0].fname + ' ' + results.data[0].lname);

					$("#welcome-alert-doctor").fadeTo(2000, 500).slideUp(500);

					user_role = results.data[0].role;
					getNotification();
				}

				if(results.data[0].role == 3){

					$('#nurse-page').show(0);
					$('#welcome-alert-nurse').html(
						'<div class="alert alert-success"><strong>Welcome ' +
						results.data[0].fname +
						 '!</strong> Successfully logged in.</div>');

					$('#nurse-name').html(results.data[0].fname + ' ' + results.data[0].lname);

					$("#welcome-alert-nurse").fadeTo(2000, 500).slideUp(500);

					user_role = results.data[0].role;
				}

				siginDecryption();

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

	$('#home-loading-image').show();
	$('#add-user-form').hide();

	if(user_role == 1){

		$.ajax({

			type:"POST",
			url:"http://localhost:8051/api/anoncare/user",
			contentType:"application/json; charset=utf-8",
			data:data,
			dataType:"json",

			success: function(results){

				if(results.status == 'OK'){

					$('#home-loading-image').hide();
					$('#add-user-form').show();

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
					$('#home-loading-image').hide();
					$('#add-user-form').show();

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

	      		xhrObj.setRequestHeader("Authorization", "Basic " + btoa( auth_user ));

	        }

		});
	}

	else{
		alert("UNAUTHORIZE ACCESS");
	}

}


function searchUser(){

	var search = $('#admin-search-user').val();

	var data = JSON.stringify({'search':search});

	var form = document.getElementById("registration-form");
	form.reset();

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

					for (var i = 0; i < results.entries.length; i++) {
						table_body = '<tr>'+
										'<td>'+ results.entries[i].fname +'</td>' +
										'<td>'+ results.entries[i].mname +'</td>' +
										'<td>'+ results.entries[i].lname +'</td>' +
										'<td>'+ results.entries[i].email +'</td>' +
										'<td>'+ results.entries[i].role +'</td>' +
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

function clearAssessmentForm(){
	var assessment_form = document.getElementById("assessment-form");
	var assessment_form_2 = document.getElementById("assessment-form-2");
	assessment_form.reset();
	assessment_form_2.reset();
}

function getAllDoctors(){

	$.ajax({

		type:"GET",
		url:"http://localhost:8051/api/anoncare/doctors/",
		contentType:"application/json; charset=utf-8",
		dataType:"json",

		success: function(results){
			var doctor_row = '';
			var doctor;

			console.log(results);

			$('#attending-physician').html(function(){

				for (var i = 0; i < results.entries.length; i++) {
					doctor = '<option value="'+ results.entries[i].id +'" >'+
												results.entries[i].fname+ ' '+
												results.entries[i].lname+
							 '</option>';

					doctor_row+=doctor;
				}

				console.log(doctor_row);
				return doctor_row;

			});

		},

		error: function(e){
			alert('THIS IS NOT COOL. ERROR IN GETTING ALL DOCTORS.' + e + auth_user);
		},

		beforeSend: function (xhrObj){

      		xhrObj.setRequestHeader("Authorization", "Basic " + btoa( auth_user ));

        }

	});

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
						   });

	if(user_role == 3){

	    $.ajax({
	    	type:"POST",
	    	url: "http://localhost:8051/api/anoncare/assessment",
	    	contentType:"application/json; charset=utf-8",
			data:data,
			dataType:"json",

			success: function(results){
				if (results.status == 'OK'){

					$('#welcome-alert-nurse').html(
						'<div class="alert alert-success"><strong>Success ' +
						 '!</strong>' + results.message +'</div>');

					$("#welcome-alert-nurse").fadeTo(2000, 500).slideUp(500);

					clearAssessmentForm();

				}

				if(results.status == 'FAILED'){

					$('#welcome-alert-nurse').html(
						'<div class="alert alert-danger"><strong>Failed ' +
						 '!</strong>' + results.message +'</div>');

					$("#welcome-alert-nurse").fadeTo(2000, 500).slideUp(500);

				}
			},
			error: function(e){
				alert("THIS IS NOT COOL. SOMETHING WENT WRONG: " + e);
			},
			beforeSend: function (xhrObj){

	    		console.log(auth_user);
	      		xhrObj.setRequestHeader("Authorization", "Basic " + btoa( auth_user ));

	        }
	    });
	}

	else {
		alert("UNAUTHORIZE ACCESS");
	}
}

function storePatient(){

	$('#nurse-loading-image').show();

	var id = $('#patient-input-id').val();
	var fname = $('#patient-input-fname').val();
	var mname = $('#patient-input-mname').val();
	var lname = $('#patient-input-lname').val();
	var age = $('#patient-input-age').val();

	if(document.getElementById('patient-female').checked) {
	  	//Male radio button is checked
		var sex = $('#patient-female').val();
	}
	else if(document.getElementById('patient-male').checked) {
		  //Female radio button is checked
		  var sex = $('#patient-male').val();
	}

	var patient_type = $('#patient-type').val();
	var patient_department = $('#patient-department').val();
	var patient_height = $('#patient-input-height').val();
	var patient_weight = $('#patient-input-weight').val();
	var patient_birth = $('#patient-birth').val();

	if(document.getElementById('patient-single').checked) {
		var patient_civil_status = $('#patient-single').val();
	}
	else if(document.getElementById('patient-married').checked) {
		  var patient_civil_status = $('#patient-married').val();
	}
	else if(document.getElementById('patient-divorced').checked) {
		  var patient_civil_status = $('#patient-divorced').val();
	}
	else if(document.getElementById('patient-widow').checked) {
		  var patient_civil_status = $('#patient-widow').val();
	}

	var patient_gurdian = $('#patient-input-gurdian').val();
	var address = $('#patient-input-address').val();
	var asthma = $('#patient-input-asthma').val();
	var ptb = $('#patient-input-ptb').val();
	var heart = $('#patient-input-heart').val();
	var hepa = $('#patient-input-hepa').val();
	var chickenpox = $('#patient-input-chickenpox').val();
	var mumps = $('#patient-input-mumps').val();
	var typhoid = $('#patient-input-typhoid').val();
	var headache = $('#patient-input-headache').val();
	var seizure = $('#patient-input-seizure').val();
	var dizziness = $('#patient-input-dizziness').val();
	var consciousness = $('#patient-input-consciousness').val();
	var smoking = $('#patient-input-smoking').val();
	var allergies = $('#patient-input-allergies').val();
	var alcohol = $('#patient-input-alcohol').val();
	var medication = $('#patient-input-medication').val();
	var drugs = $('#patient-input-drugs').val();
	var cough = $('#input-patient-cough').val();
	var dyspnea = $('#input-patient-dyspnea').val();
	var hemo = $('#patient-input-hemo').val();
	var tb = $('#patient-input-tb').val();
	var frequency = $('#patient-input-frequency').val();
	var flank = $('#patient-input-flank').val();
	var discharge = $('#patient-input-discharge').val();
	var dysuria = $('#patient-input-dysuria').val();
	var nocturia = $('#patient-input-nocturia').val();
	var urine = $('#patient-input-urine').val();
	var chest_pain = $('#patient-input-chest').val();
	var palpitations = $('#patient-input-palpitation').val();
	var pedal = $('#patient-input-pedal').val();
	var orthopnea = $('#patient-input-orthopnea').val();
	var nocturnal = $('#patient-input-nocturnal').val();


	var data = JSON.stringify({'school_id':id, 'fname':fname, 'mname':mname,
							   'lname':lname, 'age':age, 'sex':sex,
							   'department_id':patient_department,
							   'patient_type_id':patient_type,
							   'height':patient_height, 'weight':patient_weight,
							   'date_of_birth':patient_birth,
							   'civil_status':patient_civil_status,
							   'name_of_guardian':patient_gurdian,
							   'home_address':address,
							   'smoking':smoking, 'allergies':allergies,
							   'medications_taken':medication,
							   'drugs':drugs, 'cough':cough, 'dyspnea':dyspnea,
							   'hemoptysis':hemo, 'tb_exposure':tb,
							   'frequency':frequency, 'flank_plan':flank,
							   'discharge':discharge, 'dysuria':dysuria,
							   'nocturia':nocturia,
							   'dec_urine_amount':urine,
							   'asthma':asthma, 'ptb':ptb, 'heart_problem':heart,
							   'hepatitis_a_b':hepa, 'chicken_pox':chickenpox,
							   'typhoid_fever':typhoid, 'chest_pain':chest_pain,
							   'palpitations':palpitations, 'pedal_edema':pedal,
							   'orthopnea':orthopnea, 'nocturnal_dyspnea':dyspnea,
							   'headache':headache, 'seizure':seizure,
							   'dizziness':dizziness,
							   'loss_of_consciousness':consciousness,
							   'mumps':mumps, 'alcohol':alcohol

	});

	if(user_role == 3){

		$.ajax({

			type:"POST",
			url:"http://localhost:8051/api/anoncare/patient",
			contentType: "application/json; charset=utf-8",
			data:data,
			dataType:"json",

			success: function(results){

				$('#nurse-loading-image').hide();

				if(results.status == 'OK'){

					$('#welcome-alert-nurse').html(
						'<div class="alert alert-success"><strong>Successfull ' +
						 '!</strong>'+ results.message +'</div>');

					$("#welcome-alert-nurse").fadeTo(2000, 500).slideUp(500);

				}

				if(results.status == 'FAILED'){

					$('#welcome-alert-nurse').html(
						'<div class="alert alert-danger"><strong>Failed ' +
						 '!</strong>'+ results.message +'</div>');

					$("#welcome-alert-nurse").fadeTo(2000, 500).slideUp(500);
				}
			},

			error: function(e, stats, err){
				console.log(err);
				console.log(stats);
				$('#nurse-loading-image').hide();
				alert('THIS IS NOT COOL. SOMETHING WENT WRONG');
			},

			beforeSend: function (xhrObj){

	      		xhrObj.setRequestHeader("Authorization", "Basic " + btoa( auth_user ));

	        }

		});

	}

	else{
		alert('THIS IS NOT COOL SOMETHING WENT WRONG: UNAUTHORIZE ACCESS');
	}

}

var interval = 2000;
function getNotification(){
	var myCookie = readCookie('user_tk');
	$.ajax({

		type:"GET",
		url:"http://localhost:8051/api/anoncare/notifications/"+myCookie,
		contentType: "application/json; charset=utf-8",
		dataType:"json",

		success: function(results){

			if(results.status == 'OK'){

				$('#notification-message').html(results.message);
				$('#notification-count').html(results.entries.length);

				$('#notification-menu').html(function(){

					var notification_row = '';
					var notification;

					for (var i = 0; i < results.entries.length; i++) {

						notification = '<li><a href="#"><i class="fa fa-users text-aqua"></i>'+

						'Assessment #'+ results.entries[i].assessment_id+ 'Assessment request from user '+
						results.entries[i].doctor_id;

						notification_row+=notification;

					}

					return notification_row;

				});
			}
		},

		complete: function (data) {
            // Schedule the next
            timer = setTimeout(getNotification, interval);
        },

		error: function(e, stats, err){
			console.log(err);
			console.log(stats);
			alert('THIS IS NOT COOL. SOMETHING WENT WRONG');
		},

		beforeSend: function (xhrObj){

			xhrObj.setRequestHeader("Authorization", "Basic " + btoa( auth_user ));

		}

	});

}

function stop() {
    clearTimeout(timer);
    timer = 0;
}
