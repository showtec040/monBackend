const { Server } = require('socket.io');
// Stockage temporaire (remplace par une base de données si besoin)
let messages = []; // [{fromId, toId, message, date}]
let userSockets = {}; // { userId: socket.id }

function setupSocket(server) {
    const io = new Server(server, {
        cors: { origin: "*" }
    });

    io.on('connection', (socket) => {
        console.log('Nouvel utilisateur connecté');

        // Enregistrement de l'utilisateur par son _id
        socket.on('register', (userId) => {
            userSockets[userId] = socket.id;
        });

        // Quand le client demande l'historique pour une conversation
        socket.on('demanderHistorique', ({ userA, userB }) => {
            const historique = messages.filter(
                m =>
                    (m.fromId === userA && m.toId === userB) ||
                    (m.fromId === userB && m.toId === userA)
            );
            socket.emit('messageHistory', historique);
        });

        // Quand un message est envoyé
        socket.on('sendMessage', (data) => {
            data.date = new Date();
            messages.push(data);
            // Envoi à l'expéditeur
            if (userSockets[data.fromId]) {
                io.to(userSockets[data.fromId]).emit('receiveMessage', data);
            }
            // Envoi au destinataire
            if (userSockets[data.toId] && data.toId !== data.fromId) {
                io.to(userSockets[data.toId]).emit('receiveMessage', data);
            }
        });

        socket.on('disconnect', () => {
            // Nettoyage (optionnel)
            for (const [userId, id] of Object.entries(userSockets)) {
                if (id === socket.id) {
                    delete userSockets[userId];
                    break;
                }
            }
            console.log('Utilisateur déconnecté');
        });
    });
}

module.exports = { setupSocket };
