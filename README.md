# 🌍 AfroCareer AI

> **L'IA au service de l'orientation et de l'accélération de carrière pour la jeunesse africaine.**

**AfroCareer AI** est une suite complète de coaching professionnel propulsée par l'intelligence artificielle (Gemini 3.5 Flash). Elle a pour but d'aider la jeunesse africaine à identifier des opportunités d'avenir dans l'économie numérique locale et internationale, à tracer des parcours d'apprentissage optimisés, à auditer leurs CVs réels, et à réussir leurs entretiens d'embauche.

---

## 🎨 Fonctionnalités Clés (Les 6 Modules)

### 1. 🧭 Diagnostic & Orientation Professionnelle
*   **Aide à l'orientation** : Analyse des compétences, des centres d'intérêt, du niveau d'études actuel et des ambitions de l'utilisateur.
*   **Recommandations adaptées** : Suggère trois métiers d'avenir particulièrement pertinents par rapport au contexte du marché numérique en Afrique (ex: Nairobi, Lagos, Dakar, Abidjan, etc.) et au télétravail international.

### 2. 💬 AI Live Coach (Messagerie Interactive)
*   **Compagnon d'apprentissage** : Un chatbot intelligent spécialisé dans l'insertion professionnelle et l'intégration des startups.
*   **Profil Contextuel** : Le coach connaît vos compétences et vos objectifs pour vous offrir des réponses hyper-personnalisées et pragmatiques.

### 3. 🗺️ Générateur de Roadmaps d'Apprentissage
*   **Plans d'études structurés** : Crée un parcours d'apprentissage sur-mesure divisé en 4 étapes clés pures.
*   **Ressources localisées** : Intègre des initiatives locales d'excellence très réputées sur le continent (ALX Africa, Orange Digital Center, MTN Pulse, Coursera, freeCodeCamp, Microsoft Leap, etc.).

### 4. 📄 Analyseur de CV ATS Intelligent (Analyse Multimodale Réelle)
*   **Uploader de vrai CV** : Permet de glisser-déposer ou d'importer directement de vrais documents **PDF**, **TXT**, ou **MD**.
*   **Performance Multimodale** : Grâce à l'API Gemini 3.5 Flash et au paramètre `inlineData`, le fichier PDF est analysé directement à la source. L'IA évalue la cohérence de la mise en page (Formatting), la densité des mots-clés (Keywords) et la force d'impact des réalisations (Impact).
*   **Score ATS global** : Donne un score d'analyse de compatibilité sur 100 et propose 4 recommandations pragmatiques de réécriture accompagnées d'un rapport de synthèse détaillé.

### 5. 🏆 Simulateur Interactif d'Entretiens
*   **Entraînement immersif** : Simulation de questions de recrutement (techniques, comportementales ou RH) adaptées au poste et à votre niveau de séniorité.
*   **Minuteur intégré** : Évaluez votre vivacité d'esprit sous le stress temporel.
*   **Rapport de feedback (Score /100)** : Pour chaque réponse fournie, le coach IA analyse vos points forts, les éléments clés omis, et indique comment vous améliorer.

### 6. 💼 Hub d'Emplois & Générateur de Lettre de Motivation
*   **Offres d'emplois réalistes** : Des postes phares dans les plus grandes entreprises et scale-ups tech du continent africain.
*   **Générateur de Lettre IA** : Rédige instantanément une lettre de motivation percutante, personnalisable par ton et adaptée aux spécificités de l'entreprise cible.

---

## 🛠️ Stack Technique

*   **Frontend** : [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS v4](https://tailwindcss.com/) pour une interface élégante et moderne de style Bento Card, [Motion](https://motion.dev/) pour des transitions et micro-animations fluides.
*   **Backend** : [Express.js](https://expressjs.com/) sécurisé servant d'API proxy pour les transactions d'IA.
*   **Moteur d'IA** : SDK officiel moderne `@google/genai` exploitant `gemini-3.5-flash` pour des analyses textuelles et multimodales rapides et robustes.
*   **Build** : Vite au niveau client, esbuild au niveau serveur (compilation sécurisée CJS standalone).

---

## 🚀 Installation et Démarrage Local

### 1. Prérequis
Assurez-vous d'avoir [Node.js](https://nodejs.org/) installé sur votre machine.

### 2. Variables d'Environnement
Créez un fichier `.env` à la racine basé sur `.env.example` et ajoutez votre clé d'API Gemini :
```env
GEMINI_API_KEY=votre_cle_api_ici
```
> *(Ne partagez jamais cette clé ! Elle est gérée de manière ultra-sécurisée côté serveur et ne s'expose jamais au navigateur)*

### 3. Installation des dépendances
```bash
npm install
```

### 4. Lancement en mode Développement (HMR désactivé pour la stabilité IA Studio)
```bash
npm run dev
```
L'application démarre et écoute sur le port **3000** : Le proxy Express et les routes Vite fonctionnent de concert.
Ouvrez votre navigateur sur un onglet local : `http://localhost:3000`.

### 5. Build et Démarrage en Production
Génère la version distribuée optimisée (frontend compilé dans `/dist` + serveur compilé dans et exécuté depuis `dist/server.cjs`) :
```bash
npm run build
npm run start
```

---

## 📁 Architecture des Fichiers

```text
├── .env.example          # Gabarit de configuration des secrets d’API
├── .gitignore            # Fichiers exclus du versionnement (node_modules, dist, etc.)
├── package.json          # Dépendances et scripts de démarrage du projet
├── server.ts             # Serveur Express & Endpoints API connectés au SDK Gemini
├── vite.config.ts        # Configuration de bundling Vite de l'applet React
├── tsconfig.json         # Configuration TypeScript de l'application
├── metadata.json         # Métadonnées de l'application Cloud Run / AI Studio
├── src/
│   ├── main.tsx          # Point d'entrée de montage React 19
│   ├── App.tsx           # Dashboard conteneur principal (Architecture Tabs)
│   ├── index.css         # Styles globaux et configuration du thème Tailwind v4
│   ├── types.ts          # Typages stricts des réponses d'IA, profils et data
│   ├── components/       # Composants d'interface (Header, LandingTab, etc.)
│   └── data/             # Répertoires de données (ex: mockJobs, ressources locales)
```

---

*Développé avec passion pour propulser l'insertion professionnelle et la réussite des futurs leaders de l'Afrique digitale ! 💫*
