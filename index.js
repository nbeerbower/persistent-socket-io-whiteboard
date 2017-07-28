const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
const mongo = require('mongodb').MongoClient;

mongo.connect('mongodb://localhost:27017/paint', (error, db) => {
	if (error) throw error;
	console.log('Connected to DB');
	app.use(express.static(__dirname + '/public'));

	function onConnection(socket) {
		console.log('client connected');
		db.collection('paint').find().sort({timestamp:1}).forEach((data, error) => {
			socket.emit('paint', data);
			if (error) console.log(error);
		});

		socket.on('paint', (data) => {
			data.timestamp = new Date();
			db.collection('paint').save(data, (error, result) => {
				if (error) console.log(error);
			});
			socket.broadcast.emit('paint', data);
		});
	}

	io.on('connection', onConnection);

	http.listen(port, () => console.log('running on port ' + port));
});
