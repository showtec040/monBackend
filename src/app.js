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
const statspresenceRoutes = require('./backend/routes/statspresence');
app.use('/api/statspresence', statspresenceRoutes);-- Ajout de la route pour les statistiques de présence

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});


// Export de l'app pour server.js
module.exports = app;
