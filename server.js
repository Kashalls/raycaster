const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const fs = require('fs');

var port = process.env.PORT || 2000;
var online = 0;
var roomList = [];
roomList.push([]);

const update = setInterval(() => {
	for (var i = 0; i < roomList.length; i++) {
		io.sockets.in(roomList[i]).emit('update', roomList[i]);
	}
}, 10);

app.use('/assets', express.static(`${__dirname}/assets`));

app.get('/', (req, res) => {
	res.sendFile(`${__dirname}/index.html`);
});

app.get('/assets/:Image', (req, res) => {
	res.sendFile(`${__dirname}/assets/${req.params.Image}`);
});

app.get('/raycasting.js', (req, res) => {
	res.sendFile(`${__dirname}/raycasting.js`);
});

io.on('connection', (socket) => {
	socket.on('newconnection', (name) => {
		console.log('player has connected');
		socket.pID = online;
		socket.username = name;
		online += 1;
		socket.emit('setup', online, 0);
		socket.join(0);
		socket.room = 0;
		roomList[0].push({ id: socket.pID, x: 0, y: 0, rot: 0 });
		io.sockets.emit('updateOnline', online);
	});

	socket.on('disconnect', () => {
		const { room } = socket;
		console.log('player has disconnected');
		online -= 1;
		roomList[room].splice(roomList[room].indexOf(socket.pID), 1);
		io.sockets.emit('updateOnline', online);
	});

	socket.on('move', (room, data) => {
		roomList[room][roomList[room].indexOf(socket.pID)] = data;
	});

	socket.on('log', (msg) => {
		console.log(msg);
	});
});

http.listen(port, () => {
	console.log(`listening on *:${port}`);
});
