import express from 'express';
import http from 'http';
import path from 'path';
import { Server } from 'socket.io';


const PORT = process.env.PORT;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*'
    }
});

let ids = [];

app.use(express.static('public'));

const __dirname = path.resolve(path.dirname(''));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/receiver', (req, res) => {
    res.sendFile(__dirname + '/public/receiver.html');
});

io.on('connection', (socket) => {
  ids.push(socket.id); 
  io.emit('ids', ids);

  socket.on('frame', (frame) => {
    ids.forEach(id => {
      io.to(id).emit('frame', frame);
    });
  });

  socket.on('disconnect', function () {
    let index = ids.indexOf(socket.id);
    ids.splice(index, 1);
    io.emit('ids', ids);
  });
});


server.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});