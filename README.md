# PAD Backend Documentation

## Introduction

Le projet PAD est une application web qui permet de gérer des agents, des publications, des documents et des courriers. Ce backend est construit avec Node.js, Express et MongoDB, offrant une API RESTful pour interagir avec les données.

## Structure du projet

Le backend est organisé comme suit :

```
backend
├── src
│   ├── controllers          # Contrôleurs pour gérer la logique métier
│   │   ├── agentController.js
│   │   ├── publicationController.js
│   │   ├── documentController.js
│   │   └── courierController.js
│   ├── models               # Modèles de données pour MongoDB
│   │   ├── agent.js
│   │   ├── publication.js
│   │   ├── document.js
│   │   └── courier.js
│   ├── routes               # Routes pour l'API
│   │   ├── agentRoutes.js
│   │   ├── publicationRoutes.js
│   │   ├── documentRoutes.js
│   │   └── courierRoutes.js
│   ├── utils                # Utilitaires
│   │   └── db.js           # Connexion à la base de données
│   ├── app.js               # Configuration de l'application Express
│   └── server.js            # Point d'entrée de l'application
├── package.json             # Dépendances et scripts
└── README.md                # Documentation du backend
```

## Installation

1. Clonez le dépôt :
   ```
   git clone <url-du-repo>
   cd PAD/backend
   ```

2. Installez les dépendances :
   ```
   npm install
   ```

3. Configurez votre base de données MongoDB dans `src/utils/db.js`.

4. Démarrez le serveur :
   ```
   npm start
   ```

## API

### Agents

- **GET /api/agents** : Récupérer tous les agents.
- **POST /api/agents** : Créer un nouvel agent.
- **GET /api/agents/:id** : Récupérer un agent par ID.
- **PUT /api/agents/:id** : Mettre à jour un agent par ID.
- **DELETE /api/agents/:id** : Supprimer un agent par ID.

### Publications

- **GET /api/publications** : Récupérer toutes les publications.
- **POST /api/publications** : Créer une nouvelle publication.
- **GET /api/publications/:id** : Récupérer une publication par ID.
- **PUT /api/publications/:id** : Mettre à jour une publication par ID.
- **DELETE /api/publications/:id** : Supprimer une publication par ID.

### Documents

- **GET /api/documents** : Récupérer tous les documents.
- **POST /api/documents** : Importer un nouveau document.
- **GET /api/documents/:id** : Récupérer un document par ID.
- **DELETE /api/documents/:id** : Supprimer un document par ID.

### Courriers

- **GET /api/couriers** : Récupérer tous les courriers.
- **POST /api/couriers** : Envoyer un nouveau courrier.
- **GET /api/couriers/:id** : Récupérer un courrier par ID.
- **POST /api/couriers/:id/confirmer** : Confirmer la réception d'un courrier.

## Contribuer

Les contributions sont les bienvenues ! Veuillez soumettre une demande de tirage pour toute amélioration ou correction.

## License

Ce projet est sous licence MIT.