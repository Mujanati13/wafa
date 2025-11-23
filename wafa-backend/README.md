# WAFA Backend API

Backend API pour la plateforme WAFA - Éducation médicale

## 🚀 Fonctionnalités

### ✅ Authentification & Sécurité
- Inscription et connexion utilisateur
- Vérification par email
- Réinitialisation de mot de passe
- Google OAuth integration
- Protection des routes avec middleware

### 💳 Système de Paiement
- Intégration PayPal
- Gestion des abonnements Premium
- Historique des transactions
- Webhooks PayPal

### 📚 Gestion du Contenu
- Modules et cours
- Questions et QCM
- Explications détaillées
- Résumés de cours
- Examens par année

### 🎯 Fonctionnalités Utilisateur
- Playlists personnalisées
- Notes sur les questions
- Signalement de questions
- Système de points et leaderboard
- Statistiques de progression

### 📧 Communication
- Formulaire de contact
- Notifications par email
- Support floating buttons

## 📋 Prérequis

- Node.js v14 ou supérieur
- MongoDB (local ou Atlas)
- Compte Gmail pour emails (optionnel)
- Compte PayPal développeur (optionnel)
- Compte Cloudinary (optionnel)

## ⚙️ Installation

1. **Cloner le projet**
```bash
cd wafa-backend
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**
```bash
# Copier le fichier .env.example
cp .env.example .env

# Éditer .env avec vos informations
```

4. **Configuration MongoDB**
Remplacer `<db_password>` dans le .env:
```
MONGO_URL=mongodb+srv://user:VOTRE_MOT_DE_PASSE@cluster0.wfcdfm3.mongodb.net/wafa?retryWrites=true&w=majority&appName=Cluster0
```

5. **Démarrer le serveur**
```bash
# Mode développement
npm run dev

# Mode production
npm start
```

## 🧪 Tests

Exécuter la suite de tests complète:

```bash
# S'assurer que le serveur est démarré
npm start

# Dans un autre terminal
node test-api.js
```

Les tests couvrent:
- ✅ Authentification (register, login, check-auth)
- ✅ Profil utilisateur (get, update)
- ✅ Modules et questions
- ✅ Playlists (CRUD)
- ✅ Notes (CRUD)
- ✅ Contact
- ✅ Signalements
- ✅ Explications et résumés

## 📁 Structure du Projet

```
wafa-backend/
├── controllers/          # Logique métier
│   ├── auth.js          # Authentification
│   ├── paymentController.js  # Paiements PayPal
│   ├── playlistController.js # Playlists
│   ├── noteController.js     # Notes
│   └── ...
├── models/              # Schémas MongoDB
│   ├── userModel.js     # Utilisateurs
│   ├── transactionModel.js # Transactions
│   ├── playlistModel.js    # Playlists
│   └── ...
├── routes/              # Routes API
│   ├── authRoute.js     # /api/v1/auth
│   ├── paymentRoute.js  # /api/v1/payments
│   └── ...
├── middleware/          # Middlewares
│   ├── authMiddleware.js    # Protection routes
│   ├── uploadMiddleware.js  # Upload Cloudinary
│   └── validateSchema.js    # Validation
├── strategies/          # Passport strategies
│   ├── local-strategy.js
│   └── google-strategy.js
├── utils/              # Utilitaires
│   └── emailService.js # Service email
├── validators/         # Schémas validation
├── app.js             # Application Express
└── test-api.js        # Script de tests
```

## 🔐 Variables d'Environnement

### Obligatoires
- `MONGO_URL` - Connection string MongoDB
- `SESSION_SECRET` - Secret pour les sessions
- `JWT_SECRET` - Secret pour les tokens JWT
- `FRONTEND_URL` - URL du frontend

### Optionnelles
- `EMAIL_USER` / `EMAIL_PASSWORD` - Configuration Gmail
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - OAuth Google
- `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` - PayPal
- `CLOUDINARY_*` - Upload d'images

## 📡 API Endpoints

### Authentification
```
POST   /api/v1/auth/register          - Inscription
POST   /api/v1/auth/login             - Connexion
GET    /api/v1/auth/logout            - Déconnexion
GET    /api/v1/auth/check-auth        - Vérifier authentification
POST   /api/v1/auth/forgot-password   - Demander réinit mot de passe
POST   /api/v1/auth/reset-password    - Réinitialiser mot de passe
GET    /api/v1/auth/verify-email      - Vérifier email
GET    /api/v1/auth/google            - OAuth Google
```

### Utilisateurs
```
GET    /api/v1/users/profile          - Obtenir profil
PUT    /api/v1/users/profile          - Mettre à jour profil
POST   /api/v1/users/upload-photo     - Upload photo de profil
```

### Paiements
```
POST   /api/v1/payments/create-order       - Créer commande PayPal
POST   /api/v1/payments/capture-payment    - Capturer paiement
GET    /api/v1/payments/transactions       - Historique transactions
POST   /api/v1/payments/webhook            - Webhook PayPal
```

### Playlists
```
GET    /api/v1/playlists              - Obtenir toutes les playlists
POST   /api/v1/playlists              - Créer playlist
GET    /api/v1/playlists/:id          - Obtenir une playlist
PUT    /api/v1/playlists/:id          - Mettre à jour playlist
DELETE /api/v1/playlists/:id          - Supprimer playlist
POST   /api/v1/playlists/:id/questions     - Ajouter question
DELETE /api/v1/playlists/:id/questions/:qid - Retirer question
```

### Notes
```
GET    /api/v1/notes                  - Obtenir toutes les notes
POST   /api/v1/notes                  - Créer note
GET    /api/v1/notes/:id              - Obtenir une note
PUT    /api/v1/notes/:id              - Mettre à jour note
DELETE /api/v1/notes/:id              - Supprimer note
```

### Contact
```
POST   /api/v1/contact                - Envoyer message de contact
GET    /api/v1/contact                - Obtenir messages (admin)
```

## 🛡️ Sécurité

- Mots de passe hashés avec bcrypt
- Sessions sécurisées avec express-session
- Protection CSRF
- Validation des données avec Joi
- Rate limiting (à implémenter)
- Helmet pour headers HTTP sécurisés

## 📧 Configuration Email

Pour activer les emails (vérification, réinitialisation):

1. Activer l'authentification 2FA sur Gmail
2. Générer un mot de passe d'application
3. Ajouter les credentials dans .env:
```
EMAIL_USER=votre.email@gmail.com
EMAIL_PASSWORD=mot_de_passe_application
```

## 💰 Configuration PayPal

1. Créer un compte développeur PayPal
2. Créer une application sandbox
3. Copier les credentials dans .env:
```
PAYPAL_CLIENT_ID=votre_client_id
PAYPAL_CLIENT_SECRET=votre_client_secret
PAYPAL_MODE=sandbox
```

## ☁️ Configuration Cloudinary

1. Créer un compte Cloudinary
2. Copier les credentials dans .env:
```
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
```

## 🐛 Debugging

Activer les logs détaillés:
```bash
NODE_ENV=development npm run dev
```

## 📝 Notes Importantes

1. **Sécurité**: Changez tous les secrets en production
2. **Database**: Utilisez MongoDB Atlas pour la production
3. **CORS**: Configurez les origins autorisées dans .env
4. **Rate Limiting**: À implémenter pour la production
5. **Backup**: Configurez des backups automatiques de la DB

## 🤝 Contribution

Pour contribuer au projet:
1. Fork le repository
2. Créer une branche feature
3. Commit les changements
4. Push vers la branche
5. Créer une Pull Request

## 📄 Licence

Ce projet est sous licence propriétaire WAFA.

## 📞 Support

Pour toute question ou problème:
- Email: admin@wafa.com
- WhatsApp: [Votre numéro]
- Instagram: @wafa.official

---

Développé avec ❤️ par l'équipe WAFA
