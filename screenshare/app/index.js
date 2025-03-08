import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import path from 'path';
import { Server } from 'socket.io';


const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;


const SalaSchema = new mongoose.Schema({
  nome: { type: String, required: true, unique: true },
  criadaEm: { type: Date, default: Date.now }
});

const Sala = mongoose.model('Sala', SalaSchema);

mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB conectado!"))
  .catch(err => console.error("Erro ao conectar ao MongoDB:", err));


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

  socket.on('sala', async (sala) => {
    let s = new Sala({
      nome: sala.nome,
      criadaEm: new Date().toISOString()
    })

    await s.save()
    .then(() => console.log("salvo"))
    .catch((e) => console.error("nao salvou", e))
  })

  socket.on

  socket.on('disconnect', function () {
    let index = ids.indexOf(socket.id);
    ids.splice(index, 1);
    io.emit('ids', ids);
  });
});


server.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});




