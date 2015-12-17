var gravatar = require('gravatar'),
	db = require('./dbConnection1.js'),
	dbConnection2 = require('./dbConnection2.js');
var multipart = require('connect-multiparty');
var path = require('path');
var util = require('util');
var multipartMiddleware = multipart();
var fs = require('fs');
var makedirp = require('mkdirp');

module.exports = function(app, io){

	app.get('/', function(req, res){
		//res.render('index');
		res.render('firstPage/index');
	});
	app.post('/loginOrSignUp', function(req, res){
		dbConnection2.queryBuilder(req, res);
	});
	app.post('/getPreviousMsg', multipartMiddleware, function(req, res) {
		dbConnection2.queryBuilder(req, res);
	});
	
	app.post('/fileUpload', multipartMiddleware, function(req, res) {
	  var files = req.files,
	  		id = req.body.id,
	  		name = files.file.name,
	  		relativePath = 'public/uploads/' + id;
	  		//extension = name.substring(name.lastIndexOf('.'), name.length);
	  var directory = __dirname + '/' + relativePath;
	  makedirp.sync(directory);
	  var readStream = fs.createReadStream(files.file.path);
	  var writeStream = fs.createWriteStream(relativePath + '/' + id);
	  readStream.pipe(writeStream);
	  req.extension = extension;
	  //dbConnection2.queryBuilder(req, res); /// save image name in db
	  res.send('imageupload');
	  //fs.renameSync(file.path, directory + "/" + '34.jpg');
	  /*util.pump(readStream, writeStream, function(err) {
	        if (err) {
	            //handle error
	        } else {

	            //successfully uploaded
	        }
      });*/
	  // don't forget to delete all req.files when done
	});
	var clients = {};
	var socketsOfClients = {};
	var connected;
	var chat = io.sockets.on('connection', function (socket) {
		connected = io.sockets.connected;
		socket.on('userRegistration', function(data) {
			var userDetail = data.userDetail;
			clients[userDetail[0].id] = socket.id;
			socketsOfClients[socket.id] = userDetail[0].id;
			console.log('userRegistration');
			console.log(userDetail[0].id);
			data.decision = "login";
			Object.keys(socketsOfClients).forEach(function(sId) {
				console.log("socket clients");
				if (connected[sId] && clients[userDetail[0].id] !== sId) {
					console.log("siddd");
					connected[sId].emit('userJoin', { currentlyOnlineUserList: userDetail});
				}
				
			});
			//db.queryBuilder(data, clients, socketsOfClients, socket, connected);
			
		});
		socket.on('msg', function(data){
			data.decision = "msg";
			if (connected[clients[data.receiver]]) {
				connected[clients[data.receiver]].emit('receive', {msg: data.msg, sender: data.sender, receiver: data.receiver, img: data.img});
			} else {
				console.log("offline msg");
				data.offlineMsg = true;
			}
			dbConnection2.queryBuilder(undefined, undefined, data);
		});
		socket.on('logout', function(data) {
			data.decision = "logout";
			db.queryBuilder(data, clients, socketsOfClients, socket, connected);
			
		});
		socket.on('getPreviousMsg', function(data) {
			console.log('previ');
			data.decision = "premsg";
			db.queryBuilder(data, clients, socketsOfClients, socket, connected);
			
		});
		socket.on('fileUpload', function(data) {
			
			console.log('fileUpload' + data.msg);
			
		});
	});
};


