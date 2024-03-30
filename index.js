const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(__dirname + '/public'));

const connectedUsers = {};

io.on('connection', (socket) => {
    console.log('a user connected');

    const userId = generateUserId();
    connectedUsers[userId] = socket;

    socket.emit('user-connected', userId);

    socket.on('disconnect', () => {
        console.log('user disconnected');
        delete connectedUsers[userId];
        io.emit('user-disconnected', userId);
    });

    socket.on('offer', (offer, toUserId) => {
        const destinationSocket = connectedUsers[toUserId];
        if (destinationSocket) {
            destinationSocket.emit('offer', offer, userId);
        } else {
            console.log(`User with ID ${toUserId} is not connected.`);
        }
    });

    socket.on('answer', (answer, toUserId) => {
        const destinationSocket = connectedUsers[toUserId];
        if (destinationSocket) {
            destinationSocket.emit('answer', answer);
        } else {
            console.log(`User with ID ${toUserId} is not connected.`);
        }
    });

    socket.on('ice-candidate', (candidate, toUserId) => {
        const destinationSocket = connectedUsers[toUserId];
        if (destinationSocket) {
            destinationSocket.emit('ice-candidate', candidate);
        } else {
            console.log(`User with ID ${toUserId} is not connected.`);
        }
    });
});

function generateUserId() {
    return Math.random().toString(36).substr(2, 9);
}


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
