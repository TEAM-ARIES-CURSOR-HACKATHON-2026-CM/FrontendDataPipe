# DataPipe — Frontend

Interface React pour l’éditeur de pipeline ETL (React Flow + Recharts).

## Démarrage

```bash
cd frontend
npm install
npm run dev
```

App : http://localhost:5173  
Les appels API passent par le proxy Vite vers `http://localhost:8000` (préfixe `/api`).

## Contrat API (équipe backend)

| Endpoint | Méthode | Corps | Réponse attendue |
|----------|---------|-------|------------------|
| `/upload` | POST | `multipart/form-data` fichier `file` | `{ file_id, columns: string[] }` |
| `/pipeline` | POST | `{ file_id, nodes[], edges[], output_node_id? }` | `{ result_type, data, chart? }` |
| `/generate` | POST | `{ description }` | `{ code, block_type?, params? }` |

`result_type` : `table` | `bar_chart` | `pie_chart`  
Pour les graphiques, renvoyer aussi `chart: { xKey, yKey }` ou `{ categoryKey, valueKey }`.

## Structure

- `src/components/Palette.tsx` — blocs drag & drop
- `src/components/FlowCanvas.tsx` — canevas React Flow
- `src/components/PropertiesPanel.tsx` — paramètres du bloc sélectionné
- `src/components/ExecutionPanel.tsx` — upload, exécution, résultats
- `src/components/AiAssistant.tsx` — génération IA
- `src/utils/pipelineValidation.ts` — règles de connexion

## Pipeline de démo

Utiliser `data/transactions.csv` à la racine du repo et le bouton **Charger pipeline démo** :  
CSV → Filtre (`montant > 5000`) → Grouper → Barres.

## Variable d’environnement

`.env` optionnel :

```
VITE_API_URL=http://localhost:8000
```

Sans variable, le proxy `/api` est utilisé en développement.
