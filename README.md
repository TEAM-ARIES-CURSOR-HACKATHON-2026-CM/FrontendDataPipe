# DataPipe — Frontend

Interface **React 19 + Vite** pour l'éditeur de pipeline ETL visuel. Canevas **React Flow** (`@xyflow/react`), graphiques **Recharts**, copilote IA et RAG documentaire.

## Démarrage

```bash
cd frontend
npm install
npm run dev
```

App : http://localhost:5173

Build production :

```bash
npm run build
npm run preview   # test du build local
```

## Architecture

```
src/
├── App.tsx                      # Layout principal, état global du pipeline
├── api/
│   ├── config.ts                # URL backend ETL (VITE_API_URL)
│   ├── aiConfig.ts              # URL assistant IA (VITE_AI_API_URL)
│   ├── client.ts                # Client HTTP pipeline + upload
│   ├── aiClient.ts              # Client HTTP IA (generate, ask, upload-doc)
│   ├── schema.ts                # Types API backend
│   ├── aiSchema.ts              # Types API IA
│   └── paramsMapping.ts         # Mapping params front ↔ backend
├── components/
│   ├── FlowCanvas.tsx           # Canevas React Flow (nœuds, arêtes)
│   ├── Palette.tsx              # Blocs glissables
│   ├── PropertiesPanel.tsx      # Paramètres du bloc sélectionné + import CSV
│   ├── ExecutionPanel.tsx       # Exécution et validation du pipeline
│   ├── ResultsPanel.tsx         # Affichage tableau / graphiques
│   ├── CopilotSidebar.tsx       # Copilote IA (génération Pandas)
│   ├── AiAssistant.tsx          # Formulaire de génération IA
│   ├── RagUploadPanel.tsx       # Upload documents RAG (PDF, TXT, MD)
│   ├── RagAskPanel.tsx          # Questions sur documents indexés
│   ├── charts/
│   │   ├── BarChartView.tsx
│   │   ├── PieChartView.tsx
│   │   └── DataTable.tsx
│   └── nodes/BlockNode.tsx      # Rendu d'un bloc sur le canevas
├── constants/
│   ├── blocks.ts                # Définition des blocs ETL
│   ├── pipelineLibrary.ts       # Modèles de pipelines prédéfinis
│   └── guide.ts                 # Textes d'aide / onboarding
├── hooks/                       # Raccourcis clavier, toasts, redimensionnement
├── utils/
│   ├── pipelineValidation.ts    # Règles de connexion entre blocs
│   ├── pandasToBlock.ts         # Code IA → nœud sur le canevas
│   ├── pipelinePersistence.ts   # Sauvegarde locale du pipeline
│   └── exportReporting.ts       # Export CSV / PNG
└── styles/
    └── flow-theme.css           # Thème visuel React Flow
```

## Backends consommés

### Backend ETL (pipelines)

| Endpoint | Méthode | Usage frontend |
|----------|---------|----------------|
| `/health` | GET | Vérification disponibilité |
| `/upload` | POST | Import CSV dans le panneau propriétés |
| `/pipeline` | POST | Bouton « Valider le pipeline » |
| `/generate` | POST | Fallback si service IA indisponible |

- Space HF : [AHMED-X-18/Aries-Datapipe](https://huggingface.co/spaces/AHMED-X-18/Aries-Datapipe)
- API : https://ahmed-x-18-aries-datapipe.hf.space
- Swagger : https://ahmed-x-18-aries-datapipe.hf.space/docs

Le `file_id` retourné par `/upload` est stocké dans **`params.file_id`** du nœud CSV.

### Assistant IA (copilote + RAG)

| Endpoint | Méthode | Composant |
|----------|---------|-----------|
| `/generate` | POST | `CopilotSidebar` / `AiAssistant` |
| `/upload-doc` | POST | `RagUploadPanel` |
| `/ask` | POST | `RagAskPanel` |
| `/health` | GET | Vérification disponibilité |

- Service : https://datapipe-ai-assistant.onrender.com
- Documentation : [`../arise_rag_cursor_hack/ai-assistant/README.md`](../arise_rag_cursor_hack/ai-assistant/README.md)

## Variables d'environnement

Copier `.env.example` vers `.env` pour un build preview / production :

```env
VITE_API_URL=https://ahmed-x-18-aries-datapipe.hf.space
VITE_AI_API_URL=https://datapipe-ai-assistant.onrender.com
```

Développement (défaut dans `.env.development`) — proxy Vite :

```env
VITE_API_URL=/api
VITE_AI_API_URL=/ai-api
```

Le proxy est configuré dans `vite.config.ts` :

- `/api/*` → backend ETL (HF par défaut, surcharge via `VITE_API_PROXY_TARGET`)
- `/ai-api/*` → assistant IA Render (surcharge via `VITE_AI_API_PROXY_TARGET`)

Pour pointer vers des backends locaux :

```env
VITE_API_URL=/api
VITE_AI_API_URL=/ai-api
VITE_API_PROXY_TARGET=http://localhost:8000
VITE_AI_API_PROXY_TARGET=http://localhost:8001
```

## Parcours utilisateur

1. **Importer des données** — Glisser un bloc **CSV** → cliquer → choisir un fichier (`/upload`).
2. **Construire le pipeline** — Connecter Filtre, Grouper, Trier, Ajouter colonne.
3. **Visualiser** — Terminer par Tableau, Graphique barres ou circulaire.
4. **Exécuter** — « Valider le pipeline » (`/pipeline`) → résultats dans le panneau inférieur.
5. **Copilote IA** — Décrire une règle en français → code Pandas + ajout automatique de bloc(s).
6. **RAG** — Charger un PDF/TXT/MD → poser des questions métier sur le document.

## Blocs disponibles

| Bloc | Type API | Description |
|------|----------|-------------|
| CSV | `csv` | Source de données (fichier uploadé) |
| Filtre | `filter` | Filtrage par colonne / opérateur / valeur |
| Grouper | `group` | Agrégation (sum, mean, count) |
| Trier | `sort` | Tri ascendant / descendant |
| Ajouter colonne | `add_column` | Formule calculée |
| Afficher tableau | `table` | Résultat tabulaire |
| Graphique barres | `bar_chart` | Bar chart Recharts |
| Graphique circulaire | `pie_chart` | Pie chart Recharts |

Le frontend valide les connexions (pas de cycles, ordre CSV → transformations → visualisation).

## Déploiement (Render)

1. [Render](https://render.com) → **New Static Site** → repo GitHub
2. **Root directory** : `frontend`
3. **Build** : `npm install && npm run build`
4. **Publish directory** : `dist`
5. Variables : `VITE_API_URL`, `VITE_AI_API_URL` (voir `.env.production`)

Le fichier `render.yaml` est inclus pour un déploiement Blueprint.

## Stack technique

| Technologie | Usage |
|-------------|-------|
| React 19 + TypeScript | UI |
| Vite 8 | Build et dev server |
| @xyflow/react | Éditeur de pipeline visuel |
| Recharts | Graphiques barres / circulaire |
| html-to-image | Export PNG des graphiques |
| xlsx | Export Excel |

## Logo et branding

Favicon et en-tête : `public/logo.svg`, `public/favicon.svg`.

## Documentation complémentaire

- Vue d'ensemble du projet : [`../README.md`](../README.md)
- Backend ETL : [`../BackendDataPipe/README.md`](../BackendDataPipe/README.md)
- Assistant IA : [`../arise_rag_cursor_hack/ai-assistant/README.md`](../arise_rag_cursor_hack/ai-assistant/README.md)
