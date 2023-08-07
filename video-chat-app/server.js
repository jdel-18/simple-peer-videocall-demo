const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const SimplePeer = require('simple-peer');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(__dirname + '/public'));

const peers = {};

io.on('connection', socket => {
  socket.on('join', roomID => {
    if (!peers[roomID]) peers[roomID] = {};

    peers[roomID][socket.id] = new SimplePeer({ initiator: true, trickle: false });

    peers[roomID][socket.id].on('signal', data => {
      socket.emit('offer', data);
    });

    socket.on('answer', answer => {
      peers[roomID][socket.id].signal(answer);
    });

    socket.on('disconnect', () => {
      if (peers[roomID][socket.id]) {
        peers[roomID][socket.id].destroy();
        delete peers[roomID][socket.id];
      }
    });
  });

  socket.on('sendChat', message => {
    socket.to(socket.room).emit('receiveChat', message);
  });

  socket.on('joinChat', roomID => {
    socket.room = roomID;
    socket.join(roomID);
  });
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});
