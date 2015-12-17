var fs = require('fs');
var mysql = require('mysql');

var dbconnection = {};

dbconnection.pool =  mysql.createPool({
	host : 'localhost',
	user : 'root',
	password: 'root',
	database: 'chat'
});
dbconnection.queryBuilder = function (req, res, msgData) {
	var decision = msgData ? msgData.decision : req.body.decision,
		query,
		data = {};
		console.log('decision' + decision);
		if (decision === 'login') {
			data.emailId = req.body.emailId;
			data.passward = req.body.passward;
			console.log('passward' + data.passward);
			query = 'SELECT id, username, lattitude, longitude, online FROM users WHERE EXISTS(SELECT username FROM users WHERE emailid ='+ "'"+data.emailId+"'"+ ' and passward =' + "'"+data.passward+"'" + ' );';
		} else if (decision === 'signUp') {
			query = 'insert into users ( username , passward, emailid, lattitude, longitude ) values ('+"'"+req.body.userNameSignUp+"'"+','+"'"+req.body.passward+"'"+','+"'"+req.body.emailId+"'"+','+"'"+req.body.lat+"'"+','+"'"+req.body.lng+"'"+');';
		} else if (decision === 'imageupload') {
			var id = req.body.id;
			query = ' update users set imagename = "'+ id + req.extension +'" where id = "' + id + '";';
		} else if (decision === 'msg') {
			query = 'insert into onlinechat (id, msg, senderId, receiverId) values ('+"'"+msgData.insertDbId+"'"+','+"'"+msgData.msg+"'"+','+"'"+msgData.sender[0].id+"'"+','+"'"+msgData.receiver+"'"+');';
			
		} else if (decision === 'getPreviousMsg') {
			query = 'SELECT * FROM onlinechat where id = '+"'"+req.body.id+"'" + ';';
		}
		/*senderPosition,
		query;
		if (data.userDetail) {
			 userDetail = data.userDetail;
			 senderPosition = data.senderPosition;
			 if (userDetail['whatToDo'] === 'signUp') {
				query = 'insert into users ( username , passward, emailid, lattitude, longitude ) values ('+"'"+userDetail['userNameSignUp']+"'"+','+"'"+userDetail['passward']+"'"+','+"'"+userDetail['emailId']+"'"+','+"'"+senderPosition['lat']+"'"+','+"'"+senderPosition['lng']+"'"+');';
				console.log(query);
			} else if(userDetail['whatToDo'] === 'login'){
				query = 'SELECT id, username, lattitude, longitude FROM users WHERE EXISTS(SELECT username FROM users WHERE emailid ='+ "'"+userDetail['emailId']+"'"+ ' and passward =' + "'"+userDetail['passward']+"'" + ' ) and online = 1;';
				console.log(query);
			}
		} else if (data.decision === "msg") {
			query = 'insert into onlinechat (id, msg, senderId, receiverId) values ('+"'"+data.insertDbId+"'"+','+"'"+data.msg+"'"+','+"'"+data.sender[0].id+"'"+','+"'"+data.receiver+"'"+');';
			console.log(query);
		} else if (data.decision === "premsg") {
			query = 'SELECT * FROM onlinechat where id = '+"'"+data.id+"'" + ';';
			console.log(query);
		} else {
			query = ' update users set online = 0 where id = '+"'"+data.sender[0].id+"'" + ';';
			console.log(query);
		}*/
	
	if (query) {
		console.log(query);
		dbconnection.applyQueryIntoDataBase(query, decision, data, res);
	}
}
dbconnection.applyQueryIntoDataBase = function (query, decision, data, res) {
	console.log('applyQueryIntoDataBase');
	dbconnection.pool.getConnection(function(err, connection) {
				var responseData = {};
				connection.query( query,  function(err, rows) {
				  	if(err)	{
	  					responseData.error = true;
	  					res.send(responseData);
				  		console.log(err);
				  	}  else if(decision === "logout") {
				  		console.log('logout');
				  	} else if(decision === 'login') {
				  		if (rows.length) {
				  			console.log(rows.length);
				  			console.log('login detail');
				  			var query = ' update users set online = 1 where emailid = '+"'"+data.emailId+"'" + ';',
				  				id;
				  				
				  			console.log(query);
				  			connection.query( query,  function(err, rows) {
				  				if(err) {
				  					console.log(err);
				  				} else {
				  					console.log('success in update');
				  				}
				  			});
				  			query = 'select id, username,emailid, lattitude, longitude, imagename from users where emailid = '+"'" + data.emailId + "'" + ';';
				  			console.log(query);
				  			connection.query( query,  function(err, idAndUserName) {
				  				if(err) {
				  					responseData.error = true;
				  					res.send(responseData);
				  					console.log(err);
				  				} else {
				  					console.log('selection success');
				  					id = idAndUserName[0].id;
				  					responseData.idAndUserName = idAndUserName;
				  					responseData.rows = rows;
				  					responseData.decision = 'login';
				  					res.send(responseData);
				  				}
				  			});
				  			
				  		} else {
				  			res.send("invaliduser");
				  		
				  		}
				  	}  else if(decision === 'signUp') {
				  		//socket.disconnect();
				  		console.log("signUp");
				  	} else if(decision === 'msg') {
				  		if (data.offlineMsg) {
				  			var query = ' update users set online = 1 where emailid = '+"'"+data.userDetail['emailId']+"'" + ';';
				  		}
				  		console.log("successFully inserted");
				  	} else if (decision === "getPreviousMsg") {
				  		responseData.decision = 'getPreviousMsg';
				  		responseData.data = rows;
				  		if (rows.length) {
				  			console.log('kya yaar');
				  		}
				  		res.send(responseData);
					}
				});
			
		connection.release();
	});
}
module.exports =  dbconnection;
   
