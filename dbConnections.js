// This file handles the configuration of the app.
// It is required by app.js
var mysql = require('mysql'),
	bodyParser = require('body-parser');

module.exports = function(app, io){
	var pool =  mysql.createPool({
		host : 'localhost',
		user : 'root',
		password: 'root',
		database: 'chat'
	  });
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: false }));	
	app.post('/loginOrSignUpere', function(req, res){


		var body = '',	POST,
			query,
			emailId = req.body.emailId,
			passward = req.body.passward,
			decision = req.body.decision;
		console.log('aa gaye bhai ham' + req.body);
		console.log(req.body.emailId);
		console.log(req.body.passward);
		pool.getConnection(function(err, connection) {
			if (decision === 'login') {
				console.log('connection' + connection);
				connection.query( "select id, username from users where username = ? and passward = ?",
					[POST.user, POST.passward],  function(err, rows) {
				  	if(err)	{
				  		console.log(err);
				  		res.send('error');
				  	} else if(rows.length) {
				  		console.log(rows);
			  			connection.query( "update users set online = true where id ="+rows[0].id+"",function(error){
			  				if(error){
			  					console.log(error);
			  				}
			  				console.log('sucess');
			  			});
				  		res.send('login');
				  	} else {
				  		res.send('userNotExist');
				  	}
				});
			} else {
				query = 'insert into users ( username , passward, emailid, lattitude, longitude ) values ('+"'"+POST['userNameSignUp']+"'"+','+"'"+POST['passward']+"'"+','+"'"+POST['emailId']+"'"+','+"'"+POST['lat']+"'"+','+"'"+POST['lng']+"'"+');';
				console.log(query);

				connection.query( query,  function(err, rows) {
				  	if(err)	{
				  		console.log(err);
				  		res.send('error');
				  	} else {
				  		console.log('signUp');
				  		res.send('signUp');
				  	}
				});
			}
			
			connection.release();
		});
	});
	app.post('/profileImageUpload', function(req, res){ 
		console.log("upload");
		console.log(req.xhr);
		console.log(req.header('x-file-name'));
		var file = req.body.data;
		var body = '',	POST;
		console.log(req.params);
		console.log('files' + req.files.file.originalFilename);
		console.log(req.files.file.path);
        req.on('data', function (data) {
            body += data;
        });
        req.on('end', function () {

            POST = JSON.parse(body);
            console.log(POST);
            console.log(POST.file);
        });
		// pool.getConnection(function(err, connection) {
			
		// 	connection.release();
		// });
	});
};
