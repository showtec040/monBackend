// socket.js
const { Server } = require('socket.io');
const Message = require('../models/Message'); // adapte le chemin si besoin

// Pour garder la liste des utilisateurs connectés
const connectedUsers = new Map();

function setupSocket(server) {
    const io = new Server(server, {
        cors: { origin: "*", methods: ["GET", "POST"] }
    });

    io.on('connection', (socket) => {
        // Authentification simple
        socket.on('login', ({ userId }) => {
            connectedUsers.set(socket.id, userId);
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
            // Par défaut, un message envoyé n'est pas lu
            msg.lu = false;
            const message = new Message(msg);
            await message.save();
            // Envoi au destinataire et à l'expéditeur
            for (let [sockId, userId] of connectedUsers.entries()) {
                if (userId == msg.to || userId == msg.from) {
                    io.to(sockId).emit('newMessage', message);
                }
            }
        });

        // Marquer les messages comme lus
        socket.on('markAsRead', async ({ from, to }) => {
            await Message.updateMany({ from, to, lu: false }, { $set: { lu: true } });
            // Optionnel : notifier l'expéditeur que ses messages ont été lus
        });

        // Déconnexion
        socket.on('disconnect', () => {
            connectedUsers.delete(socket.id);
            const onlineUserIds = Array.from(connectedUsers.values());
            io.emit('onlineUsers', onlineUserIds);
        });
    });
}

module.exports = { setupSocket };
