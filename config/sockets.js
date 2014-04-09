var Chat = require('../app/models/chat');

module.exports = function (io) {


	io.sockets.on('connection', function (socket) {
		socket.on('disconnect', function () {
			var rooms = io.sockets.manager.roomClients[socket.id];
			for(var room in rooms) {
				socket.leave(room);
			}
		})

  		socket.on('joinChat', function (eventId) {
    		socket.room = eventId;
    		socket.join(socket.room);
    		io.sockets.in(socket.room).emit('userJoind', 'user joined rooom');
  		});


  		socket.on('postMessage', function  (msg, eventId) {
  			io.sockets.in(eventId).emit('newMessage',msg);
  		})

  		socket.on('leaveChat', function (eventId) {
  			socket.leave(eventId);
  		})
	});

}