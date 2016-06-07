var app = angular.module('myapp', ['ngStorage', 'ngRoute']);

app.factory('socketService', function ($rootScope) {
	var emailS;

  	return {
    
    	checkUser: function(userData, $sessionStorage, callback) {
    		var user = JSON.parse(sessionStorage.user);
    		if (userData.email != user.email) {
    			callback(1);
    		} else if (userData.pw != user.pw) {
    			callback(2);
    		} else {
    			callback(0);
    		}
    	}
  	};
});

app.controller('chatController', function($scope, $sessionStorage, socketService, $window) {
	
	console.log('Enter chat controller:');
	var socket = io();
	var user = JSON.parse(sessionStorage.user);
	var oldName;
	console.log('data: ' + user);

	$scope.users = [];

	socket.emit('login', user);

	socket.on('login', function(newResData) {
		console.log('res data: ' + newResData);
		var elem = '<li><span style="font-size:150%;font-weight: bold; color: #00F819;">' + newResData.loginUser.name + ' online' + '</span></li>';
		$('.Message').append(elem);
		$('.Message')[0].scrollTop = $('.Message')[0].scrollHeight;
		$scope.users = newResData.users;
		$scope.$apply();
	});

	$scope.send = function() {
		var msg = $scope.inputMessage;

		if (msg.substring(0, 5) == '/nick') {
			var newName = msg.substring(6);
			oldName = user.name;
			sessionStorage.removeItem('user');
			user.name = newName;
			sessionStorage.user = JSON.stringify(user);			
			$scope.inputMessage = '';

			socket.emit('changeName', { newName: newName, oldName: oldName });
		} else {
			var msgData = {};
			msgData.name = user.name;
			msgData.msg = msg;

			socket.emit('sendMessage', msgData);

			$scope.inputMessage = '';
		}		
	}

	socket.on('changeNameSuccess', function(data) {
		var elem = '<li><span style="font-size:150%;font-weight: bold; color: #FF9500;">' + data.oldName + ' change name to ' + data.newName + '</span></li>';
		$('.Message').append(elem);
		$('.Message')[0].scrollTop = $('.Message')[0].scrollHeight;
		$scope.users = data.users;
		$scope.$apply();
	});

	socket.on('addChatMessage', function(data) {
		var elem = '<li class="text-left" style="margin-top: 10px; font-size: 140%;font-weight: bold;">' + data.msg + '</li>';
		$('.Message').append(elem);
		$('.Message')[0].scrollTop = $('.Message')[0].scrollHeight;
		$scope.$apply();	
	});

	socket.on('userLeft', function(data) {
		var elem = '<li><span style="font-size:150%;font-weight: bold; color: #FF0000;">' + data.username + ' offline' + '</span></li>';
		$('.Message').append(elem);
		$('.Message')[0].scrollTop = $('.Message')[0].scrollHeight;
		$scope.users = data.onlineUsers;
		$scope.$apply();
	});

	$scope.logout = function() {
		$window.location.href='/';
	}
});

app.controller('loginController', function($scope, $sessionStorage, $window, socketService) {

	$scope.login = function() {

		var account = {};
		account.email = $scope.emailL;
		account.pw = $scope.pwL;
		socketService.checkUser(account, $sessionStorage, function(res) {
			if (res == 1) {
				alert('Invalid email');
			} else if (res == 2) {
				alert('Ivalid password');
			} else {
				$window.location.href='/chat.html';
			}
		});
	}
});

app.controller('registerController', function($scope, $sessionStorage, $window, socketService) {

	$scope.signIn = function() {
		
		if ($scope.pwR1 != $scope.pwR2) {
			alert('Invalid password!');
		} else {
			console.log('Enter:');
			var user = {};
			user.email = $scope.emailR;
			user.name = $scope.nameR;
			user.pw = $scope.pwR1;

			console.log('user:' + user.email);

			sessionStorage.user = JSON.stringify(user);
		
			$window.location.href='/chat.html';
		}
	}
});