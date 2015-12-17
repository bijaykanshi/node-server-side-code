var fs = require('fs');
var mysql = require('mysql');

var dbconnection = {};

dbconnection.pool =  mysql.createPool({
	host : 'localhost',
	user : 'root',
	password: 'root',
	database: 'chat'
});
dbconnection.queryBuilder = function (data, clients, socketsOfClients, socket, connected) {
	var userDetail,
		senderPosition,
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
		}
	
	if (query) {
		dbconnection.applyQueryIntoDataBase(query, data, clients, socketsOfClients, socket, connected);
	}
}
dbconnection.applyQueryIntoDataBase = function (query, data, clients, socketsOfClients, socket, connected) {
	console.log('applyQueryIntoDataBase');
	dbconnection.pool.getConnection(function(err, connection) {
			
				connection.query( query,  function(err, rows) {
				  	if(err)	{
				  		console.log(err);
				  	}  else if(data.decision === "logout") {
				  		console.log('logout');
				  	} else if(data.decision === 'login') {
				  		if (rows.length) {
				  			console.log(rows.length);
				  			console.log('login detail');
				  			var query = ' update users set online = 1 where emailid = '+"'"+data.userDetail['emailId']+"'" + ';',
				  				id;
				  				
				  			console.log(query);
				  			connection.query( query,  function(err, rows) {
				  				if(err) {
				  					console.log(err);
				  				} else {
				  					console.log('success in update');
				  				}
				  			});
				  			query = 'select id, username,emailid, lattitude, longitude from users where emailid = '+"'" + data.userDetail['emailId'] + "'" + ';';
				  			console.log(query);
				  			connection.query( query,  function(err, idAndUserName) {
				  				if(err) {
				  					console.log(err);
				  				} else {
				  					console.log('selection success');
				  					id = idAndUserName[0].id;
				  					console.log(id);
				  					clients[id] = socket.id;
									socketsOfClients[socket.id] = id;
									if (connected[socket.id]) {
										connected[socket.id].emit('loginSuccess', {rows: rows, idAndUserName: idAndUserName});
									}
									idAndUserName[0].lattitude = data.senderPosition.lat ||  idAndUserName[0].lattitude;
									idAndUserName[0].longitude = data.senderPosition.lng ||  idAndUserName[0].longitude;
									Object.keys(socketsOfClients).forEach(function(sId) {
										if (connected[sId] && clients[id] !== sId) {
											connected[sId].emit('userJoin', { currentlyOnlineUserList: idAndUserName});
										}
										
									});
				  				}
				  			});
				  			
				  		} else {
				  			if (connected[socket.id]) {
				  				connected[socket.id].emit('unAuthorizedUser', {msg: 'notRecord'});
				  			}
				  			
				  			//socket.disconnect();
				  		
				  		}
				  	}  else if(data.decision === 'signUp') {
				  		//socket.disconnect();
				  		console.log("signUp");
				  	} else if(data.decision === 'msg') {
				  		if (data.offlineMsg) {
				  			var query = ' update users set online = 1 where emailid = '+"'"+data.userDetail['emailId']+"'" + ';';
				  		}
				  		console.log("successFully inserted");
				  	} else if (data.decision === "premsg") {
				  		if (rows.length) {
				  			console.log('kya yaar');
				  			console.log(data.senderId);
				  			console.log("kkdfkj" + clients[data.senderId]);
				  			if (connected[clients[data.senderId]]) {
				  				connected[clients[data.senderId]].emit('replyForPreMsg', {msgList: rows});
				  			}
				  		}
					}
				});
			
		connection.release();
	});
}
module.exports =  dbconnection;
   
