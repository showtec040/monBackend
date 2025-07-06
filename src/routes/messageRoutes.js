const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const User = require('./backend/models/User');
const Message = require('./backend/models/Message');

const app = express();
app.use(cors());
app.use(express.json());

// Connexion MongoDB
mongoose.connect('mongodb://localhost:27017/pad-messagerie', { useNewUrlParser: true, useUnifiedTopology: true });

// Liste des utilisateurs connectés (socketId <-> userId)
const connectedUsers = new Map();

// Route pour récupérer tous les utilisateurs (à sécuriser)
app.get('/api/users', async (req, res) => {
  const users = await User.find({}, '_id nom email');
  res.json(users);
});

// --- Socket.IO ---
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

io.on('connection', (socket) => {
  // Authentification simple par userId (à remplacer par un vrai token)
  socket.on('login', async ({ userId }) => {
    connectedUsers.set(socket.id, userId);
    // Optionnel : broadcast la liste des connectés
    const onlineUserIds = Array.from(connectedUsers.values());
    io.emit('onlineUsers', onlineUserIds);
  });

  // Récupérer l'historique des messages
  socket.on('getMessages', async ({ from, to }) => {
    const messages = await Message.find({
      $or: [
        { from, to },
        { from: to, to: from }
      ]
    }).sort({ date: 1 });
    socket.emit('messages', messages);
  });

  // Envoi d'un message
  socket.on('sendMessage', async (msg) => {
    const message = new Message(msg);
    await message.save();
    // Envoi au destinataire si connecté
    for (let [sockId, userId] of connectedUsers.entries()) {
      if (userId === msg.to || userId === msg.from) {
        io.to(sockId).emit('newMessage', message);
      }
    }
  });

  // Déconnexion
  socket.on('disconnect', () => {
    connectedUsers.delete(socket.id);
    const onlineUserIds = Array.from(connectedUsers.values());
    io.emit('onlineUsers', onlineUserIds);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log('Serveur Socket.IO avancé lancé sur le port', PORT);
});
