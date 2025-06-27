
const { Server } = require('socket.io');
// Stockage temporaire (remplace par une base de données si besoin)
let messages = []; // [{from, to, message, date}]
let userSockets = {}; // { nomUtilisateur: socket.id }

function setupSocket(server) {
    const io = new Server(server, {
        cors: { origin: "*" }
    });

    io.on('connection', (socket) => {
        console.log('Nouvel utilisateur connecté');

        // Enregistrement de l'utilisateur
        socket.on('register', (nomUtilisateur) => {
            userSockets[nomUtilisateur] = socket.id;
        });

        // Quand le client demande l'historique pour une conversation
        socket.on('demanderHistorique', ({ userA, userB }) => {
            const historique = messages.filter(
                m =>
                    (m.from === userA && m.to === userB) ||
                    (m.from === userB && m.to === userA)
            );
            socket.emit('messageHistory', historique);
        });

        // Quand un message est envoyé
        socket.on('sendMessage', (data) => {
            data.date = new Date();
            messages.push(data);
            // Envoi à l'expéditeur
            if (userSockets[data.from]) {
                io.to(userSockets[data.from]).emit('receiveMessage', data);
            }
            // Envoi au destinataire
            if (userSockets[data.to] && data.to !== data.from) {
                io.to(userSockets[data.to]).emit('receiveMessage', data);
            }
        });

        socket.on('disconnect', () => {
            // Nettoyage (optionnel)
            for (const [user, id] of Object.entries(userSockets)) {
                if (id === socket.id) {
                    delete userSockets[user];
                    break;
                }
            }
            console.log('Utilisateur déconnecté');
        });
    });
}

module.exports = { setupSocket };