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
	$('#landing-page-header').show();
	$('#view-user-table').hide();

	var form = document.getElementById("registration-form");
	form.reset();

	var loginForm = document.getElementById("login-form");
	loginForm.reset();

	clearAssessmentForm();

	$('#log-in-alert').html(
		'<div class="alert alert-success" role="alert"><strong>Success ' +
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
	    	$('#login-loading-image').hide();
	    	$('#landing-page-header').show();
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
	    	$('#landing-page-header').hide();

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
					$('#doctor-name').html(results.data[0].fname + ' ' + results.data[0].lname);
					user_role = results.data[0].role;
				}

				if(results.data[0].role == 3){
					$('#nurse-page').show();
					user_role = results.data[0].role;
					$('#nurse-name').html(results.data[0].fname + ' ' + results.data[0].lname);
				}
			}

			if(results.status == 'FAILED'){
				console.log('FAILED');
			}

	    },

	    error: function(e, stats, err){
	    	console.log(err);
	    	console.log(stats);
			eraseCookie();
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
	$('#landing-page-header').hide();

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
				$('#landing-page-header').show();
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


function doctorReferral() {
	var attending_physician = $('#attending-physician').val();
	var data = JSON.stringify({'attending_physician': attending_physician});

	$('#doctor-referral-form').show();

	$.ajax({
		type: "POST",
		url:"http://localhost:8051/api/anoncare/assessment",
		dataType: json,

		success: function(results) {
			return results
		},
	});
}

function readNotification(id){

	$.ajax({

		type:"POST",
		url:"http://localhost:8051/api/anoncare/read/notification/"+id,
		contentType: "application/json; charset=utf-8",
		dataType:"json",

		beforeSend: function (xhrObj){

			xhrObj.setRequestHeader("Authorization", "Basic " + btoa( auth_user ));

		}

	});

}

//this function will return an option tag.
function showAllDoctors(){
		$.ajax({
			type:"GET",
			url:"http://localhost:8051/api/anoncare/doctors/",
			contentType:"application/json; charset=utf-8",
			dataType:"json",
			success: function(results){
				var doctor_row = '';
				var doctor;
				$('#refer-physician').html(function(){
					for (var i = 0; i < results.entries.length; i++) {
						doctor = '<option value="'+ results.entries[i].id +'" >'+
													results.entries[i].fname+ ' '+
													results.entries[i].lname+
								 '</option>';

						doctor_row+=doctor;
					}

					return doctor_row;
				});
			},
			error: function(e){
				alert('ERROR LOADING DOCTORS: '+e);
			},
			beforeSend: function (xhrObj){
				xhrObj.setRequestHeader("Authorization", "Basic " + btoa( auth_user ));
			}
		});
}

function showDoctorReferral(id){

	showAllDoctors();

	$.ajax({

		type:"GET",
		url:"http://localhost:8051/api/anoncare/assessment/by/" + id,
		contentType: "application/json; charset=utf-8",
		dataType:"json",

		success: function(results){

			$('#doctor-referral-data1').html(function(){

				var data = '<p>'+
							'<b>'+
								'<h4>Patient Name: '+results.entries[0].patient_fname +' '+ results.entries[0].patient_lname +'</h4>'+
								'<h5><b>ID No. : '
									+ results.entries[0].school_id + '<br><br>'+
									'Age: '+results.entries[0].age+ '<br><br>'+
									'Temperature : '+results.entries[0].temperature+ 'ºC<br><br>'+
									'Pulse rate: '+results.entries[0].pulse_rate+ '<br><br>'+
									'Respiration rate: '+results.entries[0].respiration_rate+ '<br><br>'+
									'Blood pressure: '+ results.entries[0].blood_pressure+ '<br><br>'+
									'Weight: '+results.entries[0].weight+'<br><br>'+
								'</b></h5>'
							+'</b>'
						  +'</p>';

				return data;

			});

			$('#doctor-referral-data2').html(function(){

				var data = '<p>'+
							'<b>'+
								'<h5><b><br><br>Chief of complaint : '
									+ results.entries[0].chief_complaint + '<br><br>'+
									'History of Present Illness: '+results.entries[0].history_of_present_illness+ '<br><br>'+
									'Medications taken : '+results.entries[0].temperature+ 'ºC<br><br>'+
									'Diagnosis: '+results.entries[0].diagnosis+ '<br><br>'+
									'Recommendation: '+results.entries[0].recommendation+ '<br><br>'+
								'</b></h5>'
							+'</b>'
						  +'</p>';

				return data;

			});


			$('#doctor-view-assessment-form').show();

		},
		error: function(e){
			alert('ERROR LOADING DOCTOR REFERRAL INFORMATION: ' + e);
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

var interval = 5000;
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

						notification = '<li><a href="#" onclick="showDoctorReferral('+results.entries[i].assessment_id+');readNotification('+results.entries[i].id+')"'+'><i class="fa fa-users text-aqua"></i>'+

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
}


function showAssessmentById(id){

	$.ajax({

		type:"GET",
		url:"http://localhost:8051/api/anoncare/assessment/by/" + id,
		contentType: "application/json; charset=utf-8",
		dataType:"json",

		success: function(results){

			$('#view-assessment-table').html(function(){

				var assessment_row = '';
				var assessment;

				for (var i = 0; i < results.entries.length; i++) {

					assessment = '<div class="box-body jumbotron">'+
									'<div class="row">'+
										'<div class="col-md-6">'+
											'<h5>'+
											'<b>'+
												'ID No.: '+results.entries[i].school_id+'<br><br>'+
												'Age: '+results.entries[i].age+'<br><br>'+
												'Temperature: '+results.entries[i].temperature+'<br><br>'+
												'Pulse rate: '+results.entries[i].pulse_rate+'<br><br>'+
												'Respiration rate: '+results.entries[i].respiration_rate+'<br><br>'+
												'Blood pressure: '+results.entries[i].blood_pressure+'<br><br>'+
												'Weight: '+results.entries[i].weight+'<br><br>'+
											'</b>'+
											+'</h5>'+
										'</div>'+
										'<div class="col-md-6">'+
										'<h5>'+
										'<b>'+
											'Chief of chief-complaint: '+results.entries[i].chief_complaint+'<br><br>'+
											'History of present illness: '+results.entries[i].history_of_present_illness+'<br><br>'+
											'Medications taken: '+results.entries[i].medications_taken+'<br><br>'+
											'Diagnosis: '+results.entries[i].diagnosis+'<br><br>'+
											'Recommendation: '+results.entries[i].recommendation+'<br><br>'+
											'Attending Physician: '+results.entries[i].attending_physician+'<br><br>'+
										'</b>'+
										+'</h5>'+
										'</div>'+
									'</div>'+
								 '</div>'


					assessment_row+=assessment;
				}

				$('#doctor-assessment-search').hide();

				return assessment_row;

			});

			$('#view-assessment-table').show();
			$('#assessment-data').hide();


		},

		beforeSend: function (xhrObj){

			xhrObj.setRequestHeader("Authorization", "Basic " + btoa( auth_user ));

		}

	});

}


function searchAssessment(){

	var search = $('#doctor-search-assessment').val();
	console.log(search);

	$.ajax({

		type:"GET",
		url:"http://localhost:8051/api/anoncare/assessment/"+search+"/",
		contentType:"application/json; charset=utf-8",
		dataType:"json",

		success: function(results){
			console.log(results);
			if(results.status == 'OK'){

				$('#assessment-name').html(results.entries[0].school_id +' | '+results.entries[0].patient_fname +' '+results.entries[0].patient_lname);

				$('#assessment-body').html(function(){

					var assessment_row = '';
					var assessment;

					for (var i = 0; i < results.entries.length; i++) {

						// assessment = '<div class="box-body jumbotron">'+
						// 				'<div class="row">'+
						// 					'<div class="col-md-6">'+
						// 						'<h5>'+
						// 						'<b>'+
						// 							'ID No.: '+results.entries[i].school_id+'<br><br>'+
						// 							'Age: '+results.entries[i].age+'<br><br>'+
						// 							'Temperature: '+results.entries[i].temperature+'<br><br>'+
						// 							'Pulse rate: '+results.entries[i].pulse_rate+'<br><br>'+
						// 							'Respiration rate: '+results.entries[i].respiration_rate+'<br><br>'+
						// 							'Blood pressure: '+results.entries[i].blood_pressure+'<br><br>'+
						// 							'Weight: '+results.entries[i].weight+'<br><br>'+
						// 						'</b>'+
						// 						+'</h5>'+
						// 					'</div>'+
						// 					'<div class="col-md-6">'+
						// 					'<h5>'+
						// 					'<b>'+
						// 						'Chief of chief-complaint: '+results.entries[i].chief_complaint+'<br><br>'+
						// 						'History of present illness: '+results.entries[i].history_of_present_illness+'<br><br>'+
						// 						'Medications taken: '+results.entries[i].medications_taken+'<br><br>'+
						// 						'Diagnosis: '+results.entries[i].diagnosis+'<br><br>'+
						// 						'Recommendation: '+results.entries[i].recommendation+'<br><br>'+
						// 						'Attending Physician: '+results.entries[i].attending_physician+'<br><br>'+
						// 					'</b>'+
						// 					+'</h5>'+
						// 					'</div>'+
						// 				'</div>'+
						// 			 '</div>';

						assessment = '<tr>'+
										'<td>'+results.entries[i].attending_physician+'</td>'+
										'<td>'+results.entries[i].assessment_date+'</td>'+
										'<td>'+'<button onclick="showAssessmentById('+ results.entries[i].assessment_id +')"; class="btn btn-info pull-center">View</button>'+'</td>'+
									 '</tr>';

						assessment_row+=assessment;

					}

					return assessment_row;

				});
				console.log(results)

				$('#assessment-data').show();


			}

			if(results.status == 'FAILED'){

				$('#welcome-alert-doctor').html(
						'<div class="alert alert-danger"><strong>FAILED ' +

						 '!</strong>'+ results.message +' </div>');
				$("#welcome-alert-doctor").fadeTo(2000, 500).slideUp(500);

			}

		},

		beforeSend: function (xhrObj){

			xhrObj.setRequestHeader("Authorization", "Basic " + btoa( auth_user ));

		}

	});


}

function searchPatient(){

	var search = $('#nurse-search-patient').val();

	if(search == ''){
		search = $('#doctor-search-patient').val();
	}

	console.log(search);

	$.ajax({

		type:"GET",
	    url:"http://localhost:8051/api/anoncare/patient/"+search+"/",
	    contentType: "application/json; charset=utf-8",
	    dataType:"json",

		success: function(results){

			console.log(results);
			if(results.status == 'OK'){
				if (user_role == 3){
					$('#patient-data').html(

						'<div class="box-body jumbotron">'+
								'<div class="row">'+
									'<div class="col-md-4">'+
										'<h5>'+
										'<b>'+
											'ID No.: '+results.entries[0].school_id+'<br><br>'+
											'First Name: '+results.entries[0].fname+'<br><br>'+
											'Middle Name: '+results.entries[0].mname+'<br><br>'+
											'Last Name: '+results.entries[0].lname+'<br><br>'+
											'Age: '+results.entries[0].age+'<br><br>'+
											'Sex: '+results.entries[0].sex+'<br><br>'+
											'Height: '+results.entries[0].height+'<br><br>'+
											'Weight: '+results.entries[0].weight+'<br><br>'+
											'Birthday: '+results.entries[0].date_of_birth+'<br><br>'+
											'Civil Status: '+results.entries[0].civil_status+'<br><br>'+
											'Guardian: '+results.entries[0].guardian+'<br><br>'+
											'Home Address: '+results.entries[0].home_addr+'<br><br>'+
										'</b>'+
										+'</h5>'+
									'</div>'+
									'<div class="col-md-4">'+
									'<h5>'+
									'<b>'+
										'Smoking: '+results.entries[1].smoking+'<br><br>'+
										'Allergies: '+results.entries[1].allergies+'<br><br>'+
										'Alcohol: '+results.entries[1].alcohol+'<br><br>'+
										'Medications taken: '+results.entries[1].medications_taken+'<br><br>'+
										'Drugs: '+results.entries[1].drugs+'<br><br>'+
										'Cough: '+results.entries[2].cough+'<br><br>'+
										'dyspnea: '+results.entries[2].dyspnea+'<br><br>'+
										'hemoptysis: '+results.entries[2].hemoptysis+'<br><br>'+
										'TB exposure: '+results.entries[2].tb_exposure+'<br><br>'+
										'Frequency: '+results.entries[3].frequency+'<br><br>'+
										'Flank Plan: '+results.entries[3].flank_plan+'<br><br>'+
										'Discharge: '+results.entries[3].discharge+'<br><br>'+
										'Dysuria: '+results.entries[3].dysuria+'<br><br>'+
										'Nocturia: '+results.entries[3].nocturia+'<br><br>'+
										'Decrease Urine Amount: '+results.entries[3].dec_urine_amount+'<br><br>'+
									'</b>'+
									+'</h5>'+
									'</div>'+
									'<div class="col-md-4">'+
									'<h5>'+
									'<b>'+
										'Asthma: '+results.entries[4].asthma+'<br><br>'+
										'PTB: '+results.entries[4].ptb+'<br><br>'+
										'Heart Problem: '+results.entries[4].heart_problem+'<br><br>'+
										'Hepa A,B: '+results.entries[4].hepa_a_b+'<br><br>'+
										'Chicken Pox: '+results.entries[4].chicken_pox+'<br><br>'+
										'Mumps: '+results.entries[4].mumps+'<br><br>'+
										'Typhoid Fever: '+results.entries[4].typhoid_fever+'<br><br>'+
										'Chest Pain: '+results.entries[5].chest_pain+'<br><br>'+
										'Palpitations: '+results.entries[5].palpitations+'<br><br>'+
										'Pedal Edema: '+results.entries[5].pedal_edema+'<br><br>'+
										'Nocturnal Dyspnea: '+results.entries[5].nocturnal_dyspnea+'<br><br>'+
										'Orthopnea: '+results.entries[5].orthopnea+'<br><br>'+
										'Headache: '+results.entries[6].headache+'<br><br>'+
										'Seizure: '+results.entries[6].seizure+'<br><br>'+
										'Dizziness: '+results.entries[6].dizziness+'<br><br>'+
										'Loss of Consciousness: '+results.entries[6].loss_of_consciousness+'<br><br>'+
									'</b>'+
									+'</h5>'+
									'</div>'+
								'</div>'+
						'</div>'

					);

					$('#patient-data').show();
				}


				if (user_role == 2){
					$('#doctor-patient-data').html(

						'<div class="box-body jumbotron">'+
								'<div class="row">'+
									'<div class="col-md-4">'+
										'<h5>'+
										'<b>'+
											'ID No.: '+results.entries[0].school_id+'<br><br>'+
											'First Name: '+results.entries[0].fname+'<br><br>'+
											'Middle Name: '+results.entries[0].mname+'<br><br>'+
											'Last Name: '+results.entries[0].lname+'<br><br>'+
											'Age: '+results.entries[0].age+'<br><br>'+
											'Sex: '+results.entries[0].sex+'<br><br>'+
											'Height: '+results.entries[0].height+'<br><br>'+
											'Weight: '+results.entries[0].weight+'<br><br>'+
											'Birthday: '+results.entries[0].date_of_birth+'<br><br>'+
											'Civil Status: '+results.entries[0].civil_status+'<br><br>'+
											'Guardian: '+results.entries[0].guardian+'<br><br>'+
											'Home Address: '+results.entries[0].home_addr+'<br><br>'+
										'</b>'+
										+'</h5>'+
									'</div>'+
									'<div class="col-md-4">'+
									'<h5>'+
									'<b>'+
										'Smoking: '+results.entries[1].smoking+'<br><br>'+
										'Allergies: '+results.entries[1].allergies+'<br><br>'+
										'Alcohol: '+results.entries[1].alcohol+'<br><br>'+
										'Medications taken: '+results.entries[1].medications_taken+'<br><br>'+
										'Drugs: '+results.entries[1].drugs+'<br><br>'+
										'Cough: '+results.entries[2].cough+'<br><br>'+
										'dyspnea: '+results.entries[2].dyspnea+'<br><br>'+
										'hemoptysis: '+results.entries[2].hemoptysis+'<br><br>'+
										'TB exposure: '+results.entries[2].tb_exposure+'<br><br>'+
										'Frequency: '+results.entries[3].frequency+'<br><br>'+
										'Flank Plan: '+results.entries[3].flank_plan+'<br><br>'+
										'Discharge: '+results.entries[3].discharge+'<br><br>'+
										'Dysuria: '+results.entries[3].dysuria+'<br><br>'+
										'Nocturia: '+results.entries[3].nocturia+'<br><br>'+
										'Decrease Urine Amount: '+results.entries[3].dec_urine_amount+'<br><br>'+
									'</b>'+
									+'</h5>'+
									'</div>'+
									'<div class="col-md-4">'+
									'<h5>'+
									'<b>'+
										'Asthma: '+results.entries[4].asthma+'<br><br>'+
										'PTB: '+results.entries[4].ptb+'<br><br>'+
										'Heart Problem: '+results.entries[4].heart_problem+'<br><br>'+
										'Hepa A,B: '+results.entries[4].hepa_a_b+'<br><br>'+
										'Chicken Pox: '+results.entries[4].chicken_pox+'<br><br>'+
										'Mumps: '+results.entries[4].mumps+'<br><br>'+
										'Typhoid Fever: '+results.entries[4].typhoid_fever+'<br><br>'+
										'Chest Pain: '+results.entries[5].chest_pain+'<br><br>'+
										'Palpitations: '+results.entries[5].palpitations+'<br><br>'+
										'Pedal Edema: '+results.entries[5].pedal_edema+'<br><br>'+
										'Nocturnal Dyspnea: '+results.entries[5].nocturnal_dyspnea+'<br><br>'+
										'Orthopnea: '+results.entries[5].orthopnea+'<br><br>'+
										'Headache: '+results.entries[6].headache+'<br><br>'+
										'Seizure: '+results.entries[6].seizure+'<br><br>'+
										'Dizziness: '+results.entries[6].dizziness+'<br><br>'+
										'Loss of Consciousness: '+results.entries[6].loss_of_consciousness+'<br><br>'+
									'</b>'+
									+'</h5>'+
									'</div>'+
								'</div>'+
						'</div>'

					);

					$('#doctor-patient-data').show();
				}


			}

		},

		beforeSend: function (xhrObj){

      		xhrObj.setRequestHeader("Authorization", "Basic " + btoa( auth_user ));

        }

	});

}
