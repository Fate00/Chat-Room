var express = require('express');
var app = express();
var server = require('http').Server(app);
var path = require('path');
var io = require('socket.io')(server);

var onlineUsers = [];

app.use(express.static(path.join(__dirname, '/views')));

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

io.on('connection', function(socket) {

	socket.on('login', function(data) {
		console.log('Enter login socket');
		console.log(data);
		socket.username = data.name;
		onlineUsers.push(data);

		var newResData = {};
		newResData.users = onlineUsers;
		newResData.loginUser = data;

		socket.emit('login', newResData);
		socket.broadcast.emit('login', newResData);
	});

	socket.on('sendMessage', function(msgData) {
		var msgContent = msgData.name + ': ' + msgData.msg;
		console.log('Chat message: ' + msgContent);
		var res = {};
		res.msg = msgContent;
		socket.emit('addChatMessage', res);
		socket.broadcast.emit('addChatMessage', res);
	});

	socket.on('changeName', function(userInfo) {
		for (var i = 0; i < onlineUsers.length; i++) {
			if (onlineUsers[i].name == userInfo.oldName) {
				onlineUsers[i].name = userInfo.newName;
				socket.username = userInfo.newName;
				break;
			}
		}
		socket.emit('changeNameSuccess', { newName: userInfo.newName, oldName: userInfo.oldName, users: onlineUsers });
		socket.broadcast.emit('changeNameSuccess', { newName: userInfo.newName, oldName: userInfo.oldName, users: onlineUsers });
	});

	socket.on('disconnect', function() {
		for (var i = 0; i < onlineUsers.length; i++) {
			if (onlineUsers[i].name == socket.username) {
				onlineUsers.splice(i, 1);
				break;
			}
		}
		var resData = {};
		resData.onlineUsers = onlineUsers;
		resData.username = socket.username;
		socket.broadcast.emit('userLeft', resData);
	});
});

server.listen(3000, function() {
	console.log('Server start..');
});