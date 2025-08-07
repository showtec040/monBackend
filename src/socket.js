// socket.js
const { Server } = require('socket.io');
const Message = require('./models/Message'); // adapte le chemin si besoin
<<<<<<< HEAD

// Pour garder la liste des utilisateurs connectés
const connectedUsers = new Map();
=======
>>>>>>> d8273cb (Mise à jour backend : sécurité, email, corrections)

// Pour garder la liste des utilisateurs connectés
const connectedUsers = new Map();

let ioInstance = null;
function setupSocket(server) {
<<<<<<< HEAD
    const io = new Server(server, {
        cors: { origin: "*", methods: ["GET", "POST"] }
    });

    io.on('connection', (socket) => {
        // Authentification simple
        socket.on('login', ({ userId }) => {
            connectedUsers.set(socket.id, userId);
            const onlineUserIds = Array.from(connectedUsers.values());
            io.emit('onlineUsers', onlineUserIds);
=======
    ioInstance = new Server(server, {
        cors: { origin: "*", methods: ["GET", "POST"] }
    });

    ioInstance.on('connection', (socket) => {
        // Authentification simple
        socket.on('login', ({ userId }) => {
            connectedUsers.set(socket.id, userId);
            // Rejoindre une room avec l'ID utilisateur pour les notifications ciblées
            socket.join(userId);
            const onlineUserIds = Array.from(connectedUsers.values());
            ioInstance.emit('onlineUsers', onlineUserIds);
>>>>>>> d8273cb (Mise à jour backend : sécurité, email, corrections)
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
            // Par défaut, un message envoyé n'est pas lu
            msg.lu = false;
            const message = new Message(msg);
            await message.save();
            // Envoi au destinataire et à l'expéditeur
            for (let [sockId, userId] of connectedUsers.entries()) {
                if (userId == msg.to || userId == msg.from) {
<<<<<<< HEAD
                    io.to(sockId).emit('newMessage', message);
=======
                    ioInstance.to(sockId).emit('newMessage', message);
>>>>>>> d8273cb (Mise à jour backend : sécurité, email, corrections)
                }
            }
        });
        // Déconnexion
        socket.on('disconnect', () => {
            connectedUsers.delete(socket.id);
            const onlineUserIds = Array.from(connectedUsers.values());
<<<<<<< HEAD
            io.emit('onlineUsers', onlineUserIds);
=======
            ioInstance.emit('onlineUsers', onlineUserIds);
>>>>>>> d8273cb (Mise à jour backend : sécurité, email, corrections)
        });
    });
}

<<<<<<< HEAD
module.exports = { setupSocket };
=======
function getIO() {
    return ioInstance;
}

module.exports = { setupSocket, getIO };
>>>>>>> d8273cb (Mise à jour backend : sécurité, email, corrections)
