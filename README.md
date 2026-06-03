# DataPipe — Frontend

Interface React pour l’éditeur de pipeline ETL (React Flow + Recharts).

## Démarrage

```bash
cd frontend
npm install
npm run dev
```

App : http://localhost:5173

En local, `.env.development` utilise `VITE_API_URL=/api` : le proxy Vite redirige vers le backend déployé sur Hugging Face.

## Backend (Aries DataPipe)

- Space : [AHMED-X-18/Aries-Datapipe](https://huggingface.co/spaces/AHMED-X-18/Aries-Datapipe)
- API live : https://ahmed-x-18-aries-datapipe.hf.space
- Swagger : https://ahmed-x-18-aries-datapipe.hf.space/docs

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/health` | GET | `{ "status": "ok" }` |
| `/upload` | POST | `multipart/form-data` champ `file` → `file_id`, `columns`, `preview`… |
| `/pipeline` | POST | `{ nodes[], edges[{source,target}], output_node_id? }` → `result_type`, `data`, `chart_spec`, `row_count` |
| `/generate` | POST | `{ description, columns? }` → `{ code, block_type?, params? }` |

Le `file_id` CSV est transmis dans les **params du nœud CSV** (`params.file_id`), pas à la racine du body `/pipeline`.

## Variables d’environnement

Copier `.env.example` vers `.env` pour pointer directement le Space (build preview / prod) :

```
VITE_API_URL=https://ahmed-x-18-aries-datapipe.hf.space
```

Développement (proxy, défaut dans `.env.development`) :

```
VITE_API_URL=/api
```

## Structure

- `src/api/client.ts` — client HTTP + mapping `chart_spec` → `chart`
- `src/api/schema.ts` — types OpenAPI
- `src/components/FlowCanvas.tsx` — canevas React Flow
- `src/components/PropertiesPanel.tsx` — paramètres + import CSV
- `src/components/ExecutionPanel.tsx` — exécution pipeline
- `src/components/CopilotSidebar.tsx` — copilote IA (`/generate`)

## Parcours

1. Glisser **CSV** → cliquer → importer un fichier (`/upload`)
2. Connecter Filtre / Grouper / graphique
3. **Valider le pipeline** (`/pipeline`)
4. **Copilote** : règle en français (`/generate` avec colonnes connues)
