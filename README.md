# Memora Frontend

Application web React pour Memora - Système de gestion de notes et de révisions avec collaboration temps réel.

## Table des matières

- [Stack Technique](#stack-technique)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Scripts Disponibles](#scripts-disponibles)
- [Structure du Projet](#structure-du-projet)
- [Conventions de Code](#conventions-de-code)
- [Fonctionnalités Principales](#fonctionnalités-principales)
- [Tests](#tests)
- [Documentation UI (Storybook)](#documentation-ui-storybook)
- [Collaboration Temps Réel](#collaboration-temps-réel)
- [Contribution](#contribution)

---

## Stack Technique

### Core

- **Framework**: React 19
- **Langage**: TypeScript 5.9
- **Build Tool**: Vite 6
- **Gestionnaire de Paquets**: npm

### Routing & Data

- **Router**: TanStack Router v1 (file-based routing)
- **State Management**: TanStack Query v5 (React Query)
- **Forms**: React Hook Form + Zod 4

### UI & Styling

- **UI Components**: Radix UI
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Themes**: next-themes
- **Notifications**: Sonner

### Éditeur & Collaboration

- **Rich Text Editor**: Tiptap
- **Collaboration**: Socket.IO Client + Yjs (CRDT)
- **WebSocket Provider**: @hocuspocus/provider
- **Code Highlighting**: Lowlight

### Visualisation

- **Graphs**: ReactFlow
- **Charts**: Recharts
- **Force-Directed Graphs**: d3-force

### Qualité de Code

- **Linting**: ESLint 9
- **Formatting**: Prettier 3
- **Pre-commit Hooks**: Husky + Lint-staged
- **Tests**: Vitest + Testing Library
- **Coverage**: Vitest Coverage (v8)

### Documentation & Monitoring

- **Documentation UI**: Storybook 8
- **Error Tracking**: Sentry

### Drag & Drop

- **DnD**: @dnd-kit (core, sortable, utilities)

---

## Architecture

Memora suit une **architecture feature-based** pour une meilleure scalabilité et maintenabilité.

### Principes SOLID

Le projet respecte strictement les principes SOLID :

- **Single Responsibility**: Chaque composant, hook, et service a une responsabilité unique
- **Open/Closed**: Extensions facilitées sans modification du code existant
- **Liskov Substitution**: Composants substituables via interfaces communes
- **Interface Segregation**: Interfaces petites et spécifiques
- **Dependency Inversion**: Dépendances via abstractions, pas implémentations concrètes

### Séparation des Responsabilités

```
┌─────────────────┐
│   Components    │  ← UI uniquement (max 100 lignes)
└────────┬────────┘
         │
┌────────▼────────┐
│     Hooks       │  ← Logique métier, state, effets
└────────┬────────┘
         │
┌────────▼────────┐
│    Services     │  ← Communication API
└────────┬────────┘
         │
┌────────▼────────┐
│   Mappers       │  ← Transformation DTO ↔ Model
└────────┬────────┘
         │
┌────────▼────────┐
│   DTO/Models    │  ← Typage strict
└─────────────────┘
```

---

## Installation

### Prérequis

- Node.js >= 18.x
- npm >= 9.x
- Backend Memora en cours d'exécution

### Installation des dépendances

```bash
cd memora_front
npm install
```

---

## Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine du projet frontend :

```bash
cp .env.example .env
```

Variables requises :

```env
# API Backend
VITE_API_URL=http://localhost:5000

# WebSocket Collaboration

# Environnement

```

### Configuration HTTP Client

Le client HTTP est configuré avec :

- **Timeout par défaut**: 10 secondes
- **Retries**: 3 tentatives avec backoff exponentiel
- **Rate limiting**: Protection contre les surcharges
- **Intercepteurs**: Auth, logging, gestion d'erreurs

Configuration dans [src/lib/http-client.ts](src/lib/http-client.ts).

---

## Scripts Disponibles

### Développement

```bash
# Démarrer le serveur de développement
npm run dev
# → http://localhost:5173
```

### Build

```bash
# Build de production
npm run build

# Prévisualiser le build
npm run preview
```

### Tests

```bash
# Lancer les tests en mode watch
npm run test

# Générer le coverage
npm run coverage
```

### Qualité de Code

```bash
# Linter
npm run lint

# Format (via pre-commit hooks)
git commit  # Husky + lint-staged s'exécuteront automatiquement
```

### Documentation

```bash
# Lancer Storybook
npm run storybook
# → http://localhost:6006

# Build Storybook
npm run build-storybook
```

---

## Structure du Projet

```
memora_front/
├── src/
│   ├── features/              # Features organisées par domaine
│   │   ├── auth/             # Authentification
│   │   ├── notes/            # Gestion des notes
│   │   ├── collections/      # Collections de notes
│   │   ├── flashcards/       # Flashcards
│   │   ├── revision/         # Système de révision espacée
│   │   ├── dashboard/        # Dashboard principal
│   │   ├── statistics/       # Statistiques utilisateur
│   │   ├── users/            # Gestion utilisateurs
│   │   ├── search/           # Recherche globale
│   │   ├── settings/         # Paramètres
│   │   ├── visualization/    # Graphes de relations
│   │   ├── workspace/        # Workspace
│   │   ├── collaboration/    # Collaboration temps réel
│   │   └── report/           # Rapports
│   │
│   ├── components/           # Composants UI réutilisables
│   │   ├── ui/              # Composants de base (Radix UI)
│   │   └── shared/          # Composants métier partagés
│   │
│   ├── lib/                  # Utilitaires globaux
│   │   ├── http-client.ts   # Client HTTP centralisé
│   │   ├── logger.ts        # Logger (remplace console.*)
│   │   ├── error-handler.ts # Gestion centralisée des erreurs
│   │   ├── config.ts        # Configuration globale
│   │   └── ...
│   │
│   ├── routes/              # Routes TanStack Router
│   │   ├── __root.tsx       # Layout racine
│   │   ├── index.tsx        # Page d'accueil
│   │   └── ...
│   │
│   ├── routing/             # Configuration routing
│   ├── hooks/               # Hooks globaux
│   ├── types/               # Types globaux
│   ├── assets/              # Assets statiques
│   └── main.tsx             # Point d'entrée
│
├── public/                   # Fichiers publics
├── .storybook/              # Configuration Storybook
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

### Structure d'une Feature

Chaque feature suit une structure standardisée :

```
features/example/
├── components/        # Composants UI de la feature
│   ├── ExampleCard.tsx
│   ├── ExampleForm.tsx
│   └── ExampleList.tsx
│
├── hooks/            # Hooks métier
│   ├── useExample.ts
│   ├── useExampleMutation.ts
│   └── useExampleQuery.ts
│
├── models/           # Types/modèles TypeScript
│   └── example.model.ts
│
├── dtos/             # DTOs (format API)
│   └── example.dto.ts
│
├── mappers/          # Transformation DTO ↔ Model
│   └── example.mapper.ts
│
├── schemas/          # Validation Zod
│   └── example.schema.ts
│
├── services/         # Appels API
│   └── example.service.ts
│
├── lib/              # Utilitaires de la feature
│   └── example.utils.ts
│
└── types/            # Types spécifiques
    └── example.types.ts
```

---

## Conventions de Code

### Composants

- **Taille maximale**: 100 lignes
- **Responsabilité unique**: UI uniquement
- **Pas de logique métier**: Déléguée aux hooks
- **Props typées**: Interfaces explicites
- **Réutilisables**: Découplés du contexte

### Hooks

- **Logique métier**: State, effets, appels API
- **Pas de JSX complexe**
- **Nommage**: `use[Feature][Action]` (ex: `useNoteQuery`, `useCreateNoteMutation`)
- **Responsabilité unique**

### Services

- **Communication API uniquement**
- **Retourne**: DTO ou modèles mappés
- **Pas d'affichage**
- **Utilise**: `httpClient` centralisé

### Mappers

- **Transformation**: API ↔ Frontend
- **Bidirectionnel**: `toDto()` et `fromDto()`
- **Pas de logique métier**
- **Typage strict**

### Logging

**INTERDICTION** d'utiliser `console.log`, `console.error`, etc.

Utiliser le logger centralisé :

```typescript
import { logger } from '@/lib/logger'

// Autorisé dans : hooks, services, lib
logger.info('Message informatif')
logger.warn('Avertissement')
logger.error('Erreur', error)
logger.debug('Debug', { context })
```

**Jamais dans les composants UI** sauf cas exceptionnel justifié.

### Documentation (Storybook)

**OBLIGATOIRE** pour :

- Composants partagés
- Composants complexes
- Composants de design system
- Composants avec logique conditionnelle visible

```typescript
// ExampleButton.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { ExampleButton } from './ExampleButton'

const meta: Meta<typeof ExampleButton> = {
  title: 'Components/ExampleButton',
  component: ExampleButton,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ExampleButton>

export const Default: Story = {
  args: {
    label: 'Click me',
  },
}

export const Loading: Story = {
  args: {
    label: 'Loading...',
    isLoading: true,
  },
}

export const Disabled: Story = {
  args: {
    label: 'Disabled',
    disabled: true,
  },
}
```

### Nommage

- **Composants**: PascalCase (`NoteCard.tsx`)
- **Hooks**: camelCase avec préfixe `use` (`useNoteQuery.ts`)
- **Services**: camelCase avec suffixe `.service` (`note.service.ts`)
- **Types/Interfaces**: PascalCase (`Note`, `NoteDto`)
- **Constantes**: UPPER_SNAKE_CASE (`MAX_NOTES`)

---

## Fonctionnalités Principales

### Authentification

- Connexion / Inscription
- Gestion du token JWT
- Refresh automatique
- Redirection non-autorisée

### Notes

- Création / Édition / Suppression
- Éditeur riche (Tiptap)
- Support Markdown
- Tags et catégories
- Recherche full-text

### Collections

- Organisation hiérarchique
- Drag & Drop
- Partage
- Permissions

### Flashcards

- Génération automatique depuis notes
- Mode révision
- Algorithme de répétition espacée

### Révision Espacée

- Algorithme SM-2
- Statistiques de progression
- Calendrier de révisions
- Performance tracking

### Collaboration Temps Réel

- Édition collaborative (CRDT avec Yjs)
- Synchronisation automatique
- Présence utilisateurs
- Gestion des conflits

### Visualisation

- Graphe de relations entre notes
- Visualisation interactive (ReactFlow)
- Force-directed layout (d3-force)

### Statistiques

- Dashboard de progression
- Graphiques (Recharts)
- Exportation de données

---

## Tests

### Structure des tests

```typescript
// example.test.tsx
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { ExampleComponent } from './ExampleComponent'

describe('ExampleComponent', () => {
  it('should render correctly', () => {
    render(<ExampleComponent />)
    expect(screen.getByText('Example')).toBeInTheDocument()
  })

  it('should handle click events', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(<ExampleComponent onClick={handleClick} />)

    await user.click(screen.getByRole('button'))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### Commandes

```bash
# Tests en mode watch
npm run test

# Coverage
npm run coverage

# Tests spécifiques
npm run test -- example.test.tsx
```

---

## Documentation UI (Storybook)

Storybook permet de visualiser et tester les composants UI de manière isolée.

### Lancer Storybook

```bash
npm run storybook
```

Ouvrir [http://localhost:6006](http://localhost:6006)

### Créer une Story

```typescript
import type { Meta, StoryObj } from '@storybook/react'
import { ComponentName } from './ComponentName'

const meta: Meta<typeof ComponentName> = {
  title: 'Features/ComponentName',
  component: ComponentName,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ComponentName>

export const Default: Story = {}
```

---

## Collaboration Temps Réel

### Architecture CRDT (Conflict-free Replicated Data Types)

Memora utilise **Yjs** pour la collaboration sans conflits.

### Flux de Collaboration

1. **Connexion**: Client se connecte via WebSocket (`/collaboration` namespace)
2. **Join**: Émission de `join_collaboration` avec `noteId`
3. **Sync**: Réception de `collaboration_session` et `crdt_sync_reply`
4. **Updates**: Émission de `crdt_update` pour chaque modification locale
5. **Propagation**: Réception de `collaboration_event` avec updates des autres utilisateurs
6. **Leave**: Émission de `leave_collaboration` à la déconnexion

### Hooks de Collaboration

#### `useCollaborationCRDT`

Provider de collaboration CRDT.

```typescript
import { useCollaborationCRDT } from '@/features/collaboration/hooks/useCollaborationCRDT'

function CollaborativeNote({ noteId }: { noteId: string }) {
  const { doc, provider, isConnected } = useCollaborationCRDT(noteId)

  // doc: Yjs document partagé
  // provider: WebSocket provider
  // isConnected: état de connexion
}
```

#### `useCollaborativeEditorCRDT`

Binding Tiptap + Yjs.

```typescript
import { useCollaborativeEditorCRDT } from '@/features/collaboration/hooks/useCollaborativeEditorCRDT'

function Editor({ noteId }: { noteId: string }) {
  const editor = useCollaborativeEditorCRDT({
    noteId,
    content: initialContent,
  })

  return <EditorContent editor={editor} />
}
```

### Événements WebSocket

#### Émis par le Client

- `join_collaboration`: Rejoindre une session
- `leave_collaboration`: Quitter une session
- `crdt_update`: Envoyer une modification CRDT (Yjs base64)
- `crdt_sync_request`: Demander une synchronisation (state vector)

#### Reçus par le Client

- `collaboration_session`: État de la session (liste des collaborateurs)
- `collaboration_event`: Événements de présence et updates CRDT
- `crdt_sync_reply`: Réponse de synchronisation (delta Yjs)

### Résolution des Problèmes

#### Collaboration lente

**Symptômes**: Délai entre frappe et affichage chez les collaborateurs.

**Solutions**:

1. Vérifier que `useCollaborativeEditorCRDT` est actif
2. Vérifier les logs du WebSocket (événements `crdt_update`)
3. Vérifier la réception de `crdt_sync_reply` au début de la session
4. Vérifier les handlers backend dans `realtime_collaboration_crdt_handlers.py`

#### Conflits de version

**Symptômes**: Perte de texte, duplication.

**Solutions**:

1. Vérifier que Yjs est bien initialisé (`doc` non null)
2. Vérifier la synchronisation initiale (`crdt_sync_request` → `crdt_sync_reply`)
3. Vérifier les services CRDT backend dans `services/impl/realtime/crdt/`

---

## Contribution

### Workflow

1. Créer une branche depuis `main`
2. Implémenter la feature/fix
3. Écrire les tests
4. Documenter les composants (Storybook)
5. Commit (hooks de pre-commit s'exécutent automatiquement)
6. Push et créer une Pull Request

### Pre-commit Hooks

Configurés avec Husky + Lint-staged :

- **ESLint**: Correction automatique
- **Prettier**: Formatage automatique
- **TypeScript**: Vérification de type

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css}": ["prettier --write"]
  }
}
```

### Checklist PR

- [ ] Tests passent (`npm run test`)
- [ ] Pas d'erreurs de lint (`npm run lint`)
- [ ] Build réussit (`npm run build`)
- [ ] Storybook mis à jour si composants UI modifiés
- [ ] Pas de `console.*` (utiliser `logger`)
- [ ] Respect de l'architecture feature-based
- [ ] Composants < 100 lignes
- [ ] Typage strict

---

## Ressources

- [React Documentation](https://react.dev)
- [TanStack Router](https://tanstack.com/router)
- [TanStack Query](https://tanstack.com/query)
- [Radix UI](https://www.radix-ui.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Tiptap](https://tiptap.dev)
- [Yjs](https://docs.yjs.dev)
- [Storybook](https://storybook.js.org)
- [Vitest](https://vitest.dev)

---

## Licence

Projet académique - IUT

---

**Niveau attendu**: Senior React Developer

**Principes**: SOLID, Clean Code, Maintenabilité, Scalabilité
