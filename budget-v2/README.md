# 💰 Budget Couple

Application web de gestion de budget mensuel pour couple. Gérez vos dépenses partagées et personnelles, répartissez équitablement, suivez vos objectifs d'épargne et anticipez vos échéances.

## Fonctionnalités

- **Profils personnalisables** — Ajoutez, modifiez et supprimez des profils avec salaire et revenus annexes
- **Catégories avec couleurs** — Chaque catégorie de dépense a sa propre couleur visible dans toute l'interface
- **Dépenses partagées et personnelles** — Suivi mensuel avec attribution par profil
- **Répartition équitable** — Mode 50/50, proportionnel au revenu, ou pourcentage personnalisé
- **Budget prévu vs réel** — Comparez vos prévisions avec les dépenses effectives
- **Objectifs d'épargne** — Définissez des objectifs et suivez votre progression
- **Échéances** — Gérez les dates de paiement avec alertes de retard
- **Simulateur de scénarios** — Testez l'impact de changements de salaire ou de dépenses
- **Graphiques dynamiques** — Camemberts, barres empilées, jauges mis à jour en temps réel
- **Mode clair / sombre** — Bascule automatique ou manuelle
- **Responsive mobile** — Navigation par sidebar, optimisée pour tous les écrans
- **Données de démo** — Pré-chargées automatiquement au premier lancement

## Technologies

| Composant | Technologie |
|-----------|-------------|
| Frontend | React 18, TypeScript, Tailwind CSS, shadcn/ui, Recharts |
| Backend | Express 5, Node.js |
| Base de données | SQLite (better-sqlite3) via Drizzle ORM |
| Routing | wouter (hash-based) |
| Build | Vite, esbuild |

## Installation locale

### Prérequis

- **Node.js** 18 ou supérieur
- **npm** (inclus avec Node.js)

### Étapes

```bash
# 1. Cloner ou extraire le projet
cd budget-couple

# 2. Installer les dépendances
npm install

# 3. Lancer en mode développement
npm run dev
```

L'application est accessible sur **http://localhost:5000**.

Les données de démo (deux profils avec dépenses réalistes en euros) se chargent automatiquement au premier lancement.

### Commandes disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Démarre le serveur de développement (hot reload) |
| `npm run build` | Compile le projet pour la production |
| `npm start` | Lance le serveur de production (après build) |
| `npm run check` | Vérifie les types TypeScript |

## Déploiement en production

### Build de production

```bash
npm run build
npm start
```

Le serveur écoute sur le port défini par la variable d'environnement `PORT` (par défaut : 5000).

---

### Déployer sur Railway.app

1. Créer un compte sur [railway.app](https://railway.app)
2. Créer un nouveau projet → **Deploy from GitHub repo** (ou glisser le dossier)
3. Railway détecte automatiquement Node.js
4. Configurer les commandes dans les paramètres :
   - **Build Command** : `npm install && npm run build`
   - **Start Command** : `npm start`
5. Railway attribue automatiquement le `PORT` — rien à configurer
6. Cliquer sur **Deploy** — l'URL publique est générée automatiquement

### Déployer sur Render.com

1. Créer un compte sur [render.com](https://render.com)
2. Nouveau → **Web Service**
3. Connecter votre dépôt GitHub ou uploader le code
4. Configurer :
   - **Runtime** : Node
   - **Build Command** : `npm install && npm run build`
   - **Start Command** : `npm start`
5. Le plan gratuit ("Free") suffit pour un usage personnel
6. Render attribue automatiquement le `PORT`
7. Cliquer sur **Create Web Service**

### Déployer sur Fly.io

1. Installer le CLI Fly : `curl -L https://fly.io/install.sh | sh`
2. Se connecter : `fly auth login`
3. Depuis le dossier du projet :

```bash
fly launch
```

4. Fly détecte Node.js et crée un `Dockerfile` automatiquement
5. Si Fly demande le port, indiquer **5000** (ou laisser le défaut)
6. Déployer :

```bash
fly deploy
```

### Déployer sur un VPS (serveur personnel)

Si vous avez un VPS (OVH, Hetzner, DigitalOcean...) :

```bash
# Sur votre serveur
git clone <votre-repo> budget-couple
cd budget-couple
npm install
npm run build

# Lancer avec un gestionnaire de processus
npm install -g pm2
pm2 start "npm start" --name budget-couple
pm2 save
pm2 startup
```

Pour exposer l'application sur internet, configurez un reverse proxy **Nginx** :

```nginx
server {
    listen 80;
    server_name budget.votre-domaine.fr;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Puis activez HTTPS avec Certbot :

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d budget.votre-domaine.fr
```

## Structure du projet

```
budget-couple/
├── client/                  # Frontend React
│   ├── index.html
│   └── src/
│       ├── components/      # Composants UI (layout, navigation)
│       ├── hooks/           # Hooks React Query (CRUD)
│       ├── lib/             # Utilitaires (formatage, API)
│       └── pages/           # Pages de l'application
│           ├── dashboard.tsx    # Tableau de bord, KPIs, gestion profils/catégories
│           ├── depenses.tsx     # Liste et gestion des dépenses
│           ├── repartition.tsx  # Répartition équitable entre profils
│           ├── objectifs.tsx    # Objectifs d'épargne
│           ├── echeances.tsx    # Échéances et dates de paiement
│           └── simulateur.tsx   # Simulateur de scénarios
├── server/                  # Backend Express
│   ├── index.ts             # Point d'entrée serveur
│   ├── routes.ts            # Routes API + seed data
│   ├── storage.ts           # Couche d'accès données (Drizzle ORM)
│   ├── static.ts            # Service des fichiers statiques
│   └── vite.ts              # Intégration Vite (dev uniquement)
├── shared/
│   └── schema.ts            # Modèle de données (tables, types, constantes)
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
└── drizzle.config.ts
```

## Base de données

L'application utilise **SQLite** — un fichier `data.db` est créé automatiquement à la racine du projet au premier lancement. Aucune configuration de base de données n'est nécessaire.

Pour réinitialiser les données, supprimez simplement le fichier `data.db` et relancez l'application.

## Licence

MIT
