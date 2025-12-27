# Mon Vieux Grimoire - BackEnd

## Projet
Développement du back-end d'un site de notation de livres, réalisé avec Node.js, Express et MongoDB. Ce projet démontre ma capacité à concevoir une API REST sécurisée et performante pour une application de partage communautaire.

## C'est quoi ?
"Mon Vieux Grimoire" est une plateforme où les utilisateurs peuvent ajouter des livres, les noter et consulter les avis des autres membres. L'enjeu technique principal était de gérer de manière fluide le téléchargement d'images, leur optimisation, et d'assurer une sécurité robuste pour les données des utilisateurs.

## Technologies Utilisées

- Runtime: Node.js

- Framework: Express.js

- Base de données: MongoDB via Mongoose

- Sécurité & Authentification: JSON Web Tokens (JWT), BcryptJS, Express-Rate-Limit

- Gestion d'images: Multer & Sharp (Optimisation)

- Documentation: Swagger UI

## Compétences & Fonctionnalités Clés

### Architecture RESTful: 
Conception d'une API structurée respectant les standards CRUD.

### Sécurité Avancée:
- Protection contre les injections NoSQL avec express-mongo-sanitize.

- Limitation du débit (Rate Limiting) pour prévenir les attaques par force brute.

- Hachage sécurisé des mots de passe avec bcryptjs.

- Traitement d'Images Optimisé: Utilisation de Sharp pour redimensionner et convertir les images téléchargées afin d'améliorer les temps de chargement.

- Validation de Données: Mise en place de schémas Mongoose stricts avec validation d'unicité.

- Tests Automatisés: Suite de tests unitaires et d'intégration réalisée avec Jest et Supertest.

## Architecture du Projet

Le projet suit une structure MVC (Modèle-Vue-Contrôleur) pour assurer la maintenabilité du code :

```
Mon-Vieux-Grimoire/
├── controllers/  # Logique métier des routes
├── models/       # Modèles de données Mongoose
├── routes/       # Définition des points d'entrée de l'API
├── middleware/   # Authentification, gestion d'images, sécurité
├── images/       # Stockage des fichiers optimisés
├── server.js     # Point d'entrée de l'application
└── .env          # Variables d'environnement (sécurisées)
```

## Installation et Lancement
1.  Télécharchez le FrontEnd de la manière de votre choix, et lisez le readme pour savoir comment le lancer.
Pour le télécharger, c'est ici : https://github.com/OpenClassrooms-Student-Center/P7-Dev-Web-livres

2. Téléchargez le BackEnd (si vous lisez ceci, vous êtes au bon endroit)
Si vous voulez néanmoins le lien, le voici : https://github.com/J4cKr0y/Mon-Vieux-Grimoire

3. Ajoutez le fichier .env fourni ou créez le vôtre sur ce format :
    ```
    //.env
    DATABASE_URL=
    DATABASE_NAME=
    DATABASE_PASSWORD=
    PORT=4000
    JWT_SECRET=
    ```

4. Installer les dépendances :
```
npm install
```

5. Allez dans le dossier où se situe de BackEnd, et lancez : `nodemon server`.
Ensuite, suivez le readme du FrontEnd pour le lancer. (Sauf changement : `npm start`).


## Qualité du Code & Bonnes Pratiques

L'accent a été mis sur la robustesse et la pérennité de la solution technique :

### Validation de Schéma stricte : 
Utilisation de mongoose-unique-validator pour garantir l'intégrité des données utilisateur en base de données.

### Sécurisation des Flux (Middlewares) :

- Sanitization : Protection contre les injections NoSQL avec express-mongo-sanitize.

- Rate Limiting : Limitation des requêtes par IP pour prévenir les attaques par déni de service (DoS) et le brute-force.

- XSS & Encodage : Utilisation de he pour l'encodage des entités HTML afin de prévenir les failles Cross-Site Scripting.

### Logging & Monitoring : 
Intégration de morgan pour un suivi précis des requêtes HTTP en environnement de développement.

### Normalisation des Images : 
Pipeline automatisé avec Sharp pour convertir systématiquement les fichiers en .webp et réduire leur poids sans perte de qualité visible.

### Tests & Environnement Isolé :
- Tests d'intégration avec Supertest.
- Utilisation de mongodb-memory-server pour exécuter les tests sur une base de données en mémoire, garantissant des tests rapides et sans pollution de la base de production.

### Documentation Technique
Pour faciliter la collaboration avec les développeurs Frontend, une documentation interactive a été mise en place :

- Swagger/OpenAPI : L'API est entièrement documentée via swagger-jsdoc, permettant de tester les points de terminaison directement depuis le navigateur.

- Standardisation des Erreurs : Gestion centralisée des codes de statut HTTP (200, 201, 401, 403, 500) pour une communication claire avec le client.