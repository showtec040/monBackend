const express = require('express');
const mongoose = require('mongoose');

const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override'); // <-- Ajoute cette ligne

// Ces routes sont optionnelles, crée les fichiers vides si besoin
let agentRoutes, publicationRoutes, courierRoutes, departementRoutes, gradeRoutes, fonctionRoutes , documentArchiveRoutes, archiveRoutes, statsRoutes;
// Essaye de charger les routes, sinon crée un routeur vide

try { agentRoutes = require('./routes/agentRoutes'); } catch (err) {
  console.error("Erreur lors du chargement de agentRoutes :", err);
  agentRoutes = express.Router();
}

try { publicationRoutes = require('./routes/publicationRoutes'); } catch { publicationRoutes = express.Router(); }
try { courierRoutes = require('./routes/courierRoutes'); } catch { courierRoutes = express.Router(); }
try { departementRoutes = require('./routes/departementRoutes'); } catch { departementRoutes = express.Router(); }
try { gradeRoutes = require('./routes/gradeRoutes'); } catch { gradeRoutes = express.Router(); }
try { fonctionRoutes = require('./routes/fonctionRoutes'); } catch { fonctionRoutes = express.Router(); }
try { documentArchiveRoutes = require('./routes/documentArchiveRoutes'); } catch { documentArchiveRoutes = express.Router(); }
try { archiveRoutes = require('./routes/archiveRoutes'); } catch { archiveRoutes = express.Router(); }
try { statsRoutes = require('./routes/statsRoutes'); } catch { statsRoutes = express.Router(); }

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // ou plus si besoin
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(methodOverride('_method')); // <-- Ajoute cette ligne ici

// Middleware de vérification de version frontend
const FRONTEND_VERSION = "1.0.1"; // À mettre à jour à chaque release
app.use((req, res, next) => {
    // On vérifie la version sur les routes API (sauf fichiers statiques)
    if (req.path.startsWith('/api')) {
        const clientVersion = req.headers['x-frontend-version'];
        if (!clientVersion || clientVersion !== FRONTEND_VERSION) {
            return res.status(426).json({ success: false, message: "Cette Version de l'application est  obsolète. mettez a jour votre application ou contacter l'administrateur . tresor040@gmail.com" });
        }
    }
    next();
});

// Routes principales
app.use('/api/agents', agentRoutes);
app.use('/api/publications', publicationRoutes);
app.use('/api/couriers', require('./routes/courierRoutes'));
app.use('/api/departements', departementRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/fonctions', fonctionRoutes);
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/presence', require('./routes/presenceRoutes'));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api', documentArchiveRoutes);
app.use('/api/archives', archiveRoutes);
app.use('/api/stats', statsRoutes);
const statspresenceRoutes = require('./routes/statspresence');
app.use('/api/statspresence', statspresenceRoutes);

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});


// Export de l'app pour server.js
module.exports = app;
