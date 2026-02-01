"""Contenu des notes de Luc (Projet étudiant)."""

from .helpers import _text, _paragraph, _heading, _bullet_list, _ordered_list, _code_block, _doc

LUC_NOTES_CONTENT = {
    "Architecture projet": _doc(
        _heading(1, "Architecture du projet - Application de gestion de tâches"),
        _heading(2, "Stack technique"),
        _bullet_list(
            [_text("Frontend", bold=True), _text(" : React + TypeScript + Vite")],
            [_text("Backend", bold=True), _text(" : Node.js + Express + Prisma")],
            [_text("Base de données", bold=True), _text(" : PostgreSQL")],
            [_text("Auth", bold=True), _text(" : JWT + Refresh tokens")]
        ),
        _heading(2, "Structure des dossiers"),
        _code_block("""project/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── services/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   └── middleware/""", "text"),
        _heading(2, "Conventions"),
        _bullet_list(
            "Commits : Conventional Commits",
            "Branches : feature/, bugfix/, hotfix/",
            "PRs : Review obligatoire par 1 membre"
        )
    ),

    "API REST - Endpoints": _doc(
        _heading(1, "Documentation API REST"),
        _heading(2, "Base URL"),
        _paragraph(_text("https://api.projet.com/v1", code=True)),
        _heading(2, "Authentification"),
        _code_block("""POST /auth/login
POST /auth/register
POST /auth/refresh
POST /auth/logout""", "text"),
        _heading(2, "Tâches"),
        _code_block("""GET    /tasks          # Liste des tâches
POST   /tasks          # Créer une tâche
GET    /tasks/:id      # Détail d'une tâche
PUT    /tasks/:id      # Modifier une tâche
DELETE /tasks/:id      # Supprimer une tâche
PATCH  /tasks/:id/status  # Changer le statut""", "text"),
        _heading(2, "Projets"),
        _code_block("""GET    /projects
POST   /projects
GET    /projects/:id
PUT    /projects/:id
DELETE /projects/:id
GET    /projects/:id/tasks""", "text"),
        _heading(2, "Codes de retour"),
        _bullet_list(
            "200 : Succès",
            "201 : Créé",
            "400 : Erreur de validation",
            "401 : Non authentifié",
            "403 : Non autorisé",
            "404 : Non trouvé"
        )
    ),

    "Modèle de données": _doc(
        _heading(1, "Modèle de données"),
        _heading(2, "User"),
        _code_block("""model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String
  avatar    String?
  role      Role     @default(MEMBER)
  tasks     Task[]
  projects  ProjectMember[]
  createdAt DateTime @default(now())
}""", "prisma"),
        _heading(2, "Project"),
        _code_block("""model Project {
  id          String   @id @default(uuid())
  name        String
  description String?
  status      ProjectStatus @default(ACTIVE)
  members     ProjectMember[]
  tasks       Task[]
  createdAt   DateTime @default(now())
}""", "prisma"),
        _heading(2, "Task"),
        _code_block("""model Task {
  id          String   @id @default(uuid())
  title       String
  description String?
  status      TaskStatus @default(TODO)
  priority    Priority   @default(MEDIUM)
  dueDate     DateTime?
  assignee    User?    @relation(fields: [assigneeId])
  assigneeId  String?
  project     Project  @relation(fields: [projectId])
  projectId   String
  createdAt   DateTime @default(now())
}""", "prisma")
    ),

    "Guide React hooks": _doc(
        _heading(1, "Guide des hooks React du projet"),
        _heading(2, "useAuth"),
        _code_block("""const { user, login, logout, isAuthenticated } = useAuth();

// Login
await login(email, password);

// Logout
logout();

// Vérifier l'auth
if (isAuthenticated) { ... }""", "typescript"),
        _heading(2, "useTasks"),
        _code_block("""const {
  tasks,
  isLoading,
  createTask,
  updateTask,
  deleteTask
} = useTasks(projectId);

// Créer une tâche
await createTask({ title, description, priority });

// Mettre à jour
await updateTask(taskId, { status: 'DONE' });""", "typescript"),
        _heading(2, "useProjects"),
        _code_block("""const { projects, createProject } = useProjects();

// Créer un projet
await createProject({ name, description });""", "typescript"),
        _heading(2, "Conventions"),
        _bullet_list(
            [_text("Tous les hooks sont dans ", italic=False), _text("src/hooks/", code=True)],
            "Un hook par fonctionnalité",
            "Utiliser React Query pour le cache"
        )
    ),

    "Réunion Sprint 1": _doc(
        _heading(1, "Compte-rendu Sprint 1"),
        _heading(2, "Participants"),
        _bullet_list(
            "Luc (Frontend)",
            "Emma (Backend)",
            "Thomas (Full-stack)",
            "Julie (Design)"
        ),
        _heading(2, "Réalisations"),
        _bullet_list(
            "✅ Setup projet frontend/backend",
            "✅ Authentification JWT",
            "✅ CRUD tâches basique",
            "✅ Maquettes validées"
        ),
        _heading(2, "En cours"),
        _bullet_list(
            "🔄 Interface liste de tâches",
            "🔄 Drag & drop Kanban"
        ),
        _heading(2, "Bloqueurs"),
        _bullet_list(
            "⚠️ Problème CORS en dev (Thomas)",
            "⚠️ Design système incomplet"
        ),
        _heading(2, "Actions Sprint 2"),
        _ordered_list(
            "Finir le Kanban",
            "Ajouter les projets",
            "Notifications temps réel"
        )
    ),

    "Réunion Sprint 2": _doc(
        _heading(1, "Compte-rendu Sprint 2"),
        _heading(2, "Review Sprint 1"),
        _paragraph(_text("Vélocité : 34 points / 40 prévus (85%)")),
        _heading(2, "Réalisations"),
        _bullet_list(
            "✅ Kanban drag & drop",
            "✅ Gestion des projets",
            "✅ Assignation des tâches",
            "✅ Filtres et recherche"
        ),
        _heading(2, "Démonstration"),
        _paragraph(_text("Démo réussie devant le prof. Feedback positif sur l'UX.")),
        _heading(2, "Retro"),
        _heading(3, "Ce qui a bien marché"),
        _bullet_list(
            "Communication quotidienne",
            "Code reviews rapides"
        ),
        _heading(3, "À améliorer"),
        _bullet_list(
            "Tests unitaires insuffisants",
            "Documentation à jour"
        ),
        _heading(2, "Sprint 3 - Objectifs"),
        _ordered_list(
            "Notifications WebSocket",
            "Dashboard statistiques",
            "Export PDF"
        )
    ),

    "Setup environnement": _doc(
        _heading(1, "Guide de setup environnement"),
        _heading(2, "Prérequis"),
        _bullet_list(
            "Node.js 18+",
            "pnpm 8+",
            "PostgreSQL 14+",
            "Redis (optionnel, pour les sessions)"
        ),
        _heading(2, "Installation"),
        _code_block("""# Cloner le repo
git clone git@github.com:equipe/projet.git
cd projet

# Backend
cd backend
cp .env.example .env
pnpm install
pnpm prisma migrate dev
pnpm dev

# Frontend (nouveau terminal)
cd frontend
cp .env.example .env
pnpm install
pnpm dev""", "bash"),
        _heading(2, "Variables d'environnement"),
        _heading(3, "Backend (.env)"),
        _code_block("""DATABASE_URL=postgresql://user:pass@localhost:5432/db
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret""", "text"),
        _heading(3, "Frontend (.env)"),
        _code_block("""VITE_API_URL=http://localhost:3000""", "text"),
        _heading(2, "Ports"),
        _bullet_list(
            "Frontend : 5173",
            "Backend : 3000",
            "PostgreSQL : 5432"
        )
    ),

    "Tests - Guide": _doc(
        _heading(1, "Guide des tests"),
        _heading(2, "Structure"),
        _code_block("""tests/
├── unit/           # Tests unitaires
├── integration/    # Tests d'intégration
└── e2e/           # Tests end-to-end""", "text"),
        _heading(2, "Lancer les tests"),
        _code_block("""# Tous les tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage

# E2E
pnpm test:e2e""", "bash"),
        _heading(2, "Conventions"),
        _bullet_list(
            [_text("Fichier test : ", italic=False), _text("*.test.ts", code=True), _text(" ou "), _text("*.spec.ts", code=True)],
            "Un describe par fonctionnalité",
            "Nommage : \"should [action] when [condition]\""
        ),
        _heading(2, "Exemple"),
        _code_block("""describe('TaskService', () => {
  describe('createTask', () => {
    it('should create a task with valid data', async () => {
      const task = await taskService.create({
        title: 'Test',
        projectId: 'xxx'
      });
      expect(task.id).toBeDefined();
    });

    it('should throw when title is empty', async () => {
      await expect(
        taskService.create({ title: '', projectId: 'xxx' })
      ).rejects.toThrow('Title required');
    });
  });
});""", "typescript")
    ),

    "Déploiement CI/CD": _doc(
        _heading(1, "Pipeline CI/CD"),
        _heading(2, "GitHub Actions"),
        _paragraph(_text("Fichier : "), _text(".github/workflows/ci.yml", code=True)),
        _heading(2, "Étapes"),
        _ordered_list(
            [_text("Lint", bold=True), _text(" : ESLint + Prettier")],
            [_text("Test", bold=True), _text(" : Unit + Integration")],
            [_text("Build", bold=True), _text(" : Frontend + Backend")],
            [_text("Deploy", bold=True), _text(" : Sur merge main")]
        ),
        _heading(2, "Environnements"),
        _bullet_list(
            [_text("Preview", bold=True), _text(" : Chaque PR (Vercel)")],
            [_text("Staging", bold=True), _text(" : Branch develop")],
            [_text("Production", bold=True), _text(" : Branch main")]
        ),
        _heading(2, "Secrets GitHub"),
        _code_block("""DATABASE_URL
JWT_SECRET
VERCEL_TOKEN""", "text"),
        _heading(2, "Déploiement manuel"),
        _code_block("""# Build production
pnpm build

# Deploy (si besoin)
pnpm deploy:prod""", "bash")
    ),

    "Design System": _doc(
        _heading(1, "Design System du projet"),
        _heading(2, "Couleurs"),
        _code_block("""--primary: #3B82F6;      /* Blue 500 */
--primary-dark: #2563EB; /* Blue 600 */
--success: #10B981;      /* Green 500 */
--warning: #F59E0B;      /* Amber 500 */
--error: #EF4444;        /* Red 500 */
--gray-50: #F9FAFB;
--gray-900: #111827;""", "css"),
        _heading(2, "Typography"),
        _bullet_list(
            "Font : Inter",
            "Headings : 600-700 weight",
            "Body : 400 weight"
        ),
        _heading(2, "Spacing"),
        _paragraph(_text("Base : 4px (Tailwind scale)")),
        _bullet_list(
            "xs: 4px",
            "sm: 8px",
            "md: 16px",
            "lg: 24px",
            "xl: 32px"
        ),
        _heading(2, "Composants"),
        _bullet_list(
            "Button : Primary, Secondary, Ghost",
            "Input : Text, Select, Checkbox",
            "Card : Default, Elevated",
            "Modal : Standard, Fullscreen"
        )
    ),

    # Nouvelles notes Luc - Projet
    "WebSocket - Temps réel": _doc(
        _heading(1, "Notifications temps réel avec WebSocket"),
        _heading(2, "Architecture"),
        _paragraph(_text("Utilisation de Socket.io pour les notifications en temps réel.")),
        _heading(2, "Événements serveur"),
        _code_block("""// Backend - événements émis
io.emit('task:created', task);
io.emit('task:updated', task);
io.emit('task:deleted', taskId);
io.to(projectId).emit('project:updated', project);""", "typescript"),
        _heading(2, "Client - Écoute"),
        _code_block("""// Hook useSocket
const socket = useSocket();

useEffect(() => {
  socket.on('task:created', (task) => {
    queryClient.invalidateQueries(['tasks']);
  });
  return () => socket.off('task:created');
}, []);""", "typescript"),
        _heading(2, "Rooms par projet"),
        _paragraph(_text("Chaque utilisateur rejoint la room de son projet pour recevoir uniquement les updates pertinentes."))
    ),

    "Authentification JWT": _doc(
        _heading(1, "Système d'authentification JWT"),
        _heading(2, "Flow d'authentification"),
        _ordered_list(
            "User envoie email/password",
            "Backend vérifie credentials",
            "Backend génère access token (15min) + refresh token (7j)",
            "Client stocke tokens",
            "Access token envoyé dans Authorization header"
        ),
        _heading(2, "Middleware auth"),
        _code_block("""const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};""", "typescript"),
        _heading(2, "Refresh token"),
        _code_block("""// Endpoint refresh
POST /auth/refresh
Body: { refreshToken: string }
Response: { accessToken: string, refreshToken: string }""", "text"),
        _heading(2, "Sécurité"),
        _bullet_list(
            "Refresh token en httpOnly cookie",
            "Access token en mémoire (pas localStorage)",
            "Rotation des refresh tokens"
        )
    ),

    "Gestion d'erreurs": _doc(
        _heading(1, "Gestion centralisée des erreurs"),
        _heading(2, "Classes d'erreur personnalisées"),
        _code_block("""class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(\`\${resource} not found\`, 404);
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}""", "typescript"),
        _heading(2, "Middleware global"),
        _code_block("""const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational
    ? err.message
    : 'Internal server error';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};""", "typescript"),
        _heading(2, "Usage dans les controllers"),
        _code_block("""const getTask = async (req, res, next) => {
  try {
    const task = await taskService.findById(req.params.id);
    if (!task) throw new NotFoundError('Task');
    res.json(task);
  } catch (error) {
    next(error);
  }
};""", "typescript")
    ),

    "React Query - Cache": _doc(
        _heading(1, "Gestion du cache avec React Query"),
        _heading(2, "Configuration"),
        _code_block("""const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      refetchOnWindowFocus: false,
    },
  },
});""", "typescript"),
        _heading(2, "Queries"),
        _code_block("""const useTasks = (projectId) => {
  return useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => api.getTasks(projectId),
    enabled: !!projectId,
  });
};""", "typescript"),
        _heading(2, "Mutations avec optimistic update"),
        _code_block("""const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (task) => api.updateTask(task.id, task),
    onMutate: async (newTask) => {
      await queryClient.cancelQueries(['tasks']);
      const previous = queryClient.getQueryData(['tasks']);
      queryClient.setQueryData(['tasks'], (old) =>
        old.map(t => t.id === newTask.id ? newTask : t)
      );
      return { previous };
    },
    onError: (err, newTask, context) => {
      queryClient.setQueryData(['tasks'], context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['tasks']);
    },
  });
};""", "typescript")
    ),

    "Kanban - Drag & Drop": _doc(
        _heading(1, "Implémentation du Kanban"),
        _heading(2, "Librairie utilisée"),
        _paragraph(_text("@dnd-kit/core", code=True), _text(" pour le drag & drop accessible.")),
        _heading(2, "Structure des colonnes"),
        _code_block("""const columns = {
  TODO: { id: 'TODO', title: 'À faire', tasks: [] },
  IN_PROGRESS: { id: 'IN_PROGRESS', title: 'En cours', tasks: [] },
  REVIEW: { id: 'REVIEW', title: 'Review', tasks: [] },
  DONE: { id: 'DONE', title: 'Terminé', tasks: [] },
};""", "typescript"),
        _heading(2, "Handler de drop"),
        _code_block("""const handleDragEnd = (event) => {
  const { active, over } = event;
  if (!over) return;

  const taskId = active.id;
  const newStatus = over.id;

  // Optimistic update local
  moveTask(taskId, newStatus);

  // API call
  updateTask({ id: taskId, status: newStatus });
};""", "typescript"),
        _heading(2, "Animations"),
        _bullet_list(
            "Transition CSS pour le déplacement fluide",
            "Feedback visuel sur la zone de drop",
            "Placeholder pendant le drag"
        )
    ),

    "Réunion Sprint 3": _doc(
        _heading(1, "Compte-rendu Sprint 3"),
        _heading(2, "Review Sprint 2"),
        _paragraph(_text("Vélocité : 38 points / 40 prévus (95%)")),
        _heading(2, "Réalisations"),
        _bullet_list(
            "✅ Notifications WebSocket",
            "✅ Dashboard avec statistiques",
            "✅ Export PDF des tâches",
            "✅ Mode sombre"
        ),
        _heading(2, "Démonstration finale"),
        _paragraph(_text("Présentation réussie. Note : 17/20. Félicitations de l'équipe pédagogique pour l'UX.")),
        _heading(2, "Retro finale"),
        _heading(3, "Points positifs"),
        _bullet_list(
            "Excellente communication d'équipe",
            "Architecture propre et maintenable",
            "Tests automatisés complets"
        ),
        _heading(3, "Améliorations pour le prochain projet"),
        _bullet_list(
            "Commencer les tests plus tôt",
            "Mieux documenter les décisions techniques"
        )
    ),

    "Performance - Optimisations": _doc(
        _heading(1, "Optimisations de performance"),
        _heading(2, "Frontend"),
        _bullet_list(
            [_text("React.memo", code=True), _text(" sur les composants lourds")],
            [_text("useMemo/useCallback", code=True), _text(" pour éviter les re-renders")],
            "Lazy loading des routes avec React.lazy",
            "Virtualisation des longues listes (react-window)"
        ),
        _heading(2, "Backend"),
        _bullet_list(
            "Pagination des requêtes (limit/offset)",
            "Index sur les colonnes fréquemment requêtées",
            "Cache Redis pour les données fréquentes",
            "Compression gzip des réponses"
        ),
        _heading(2, "Métriques"),
        _bullet_list(
            "Time to First Byte (TTFB) < 200ms",
            "First Contentful Paint (FCP) < 1.5s",
            "Lighthouse score > 90"
        )
    ),

    "Validation - Zod": _doc(
        _heading(1, "Validation des données avec Zod"),
        _heading(2, "Schémas de validation"),
        _code_block("""import { z } from 'zod';

const taskSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  dueDate: z.string().datetime().optional(),
  assigneeId: z.string().uuid().optional(),
});

type Task = z.infer<typeof taskSchema>;""", "typescript"),
        _heading(2, "Middleware de validation"),
        _code_block("""const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    next(new ValidationError(error.errors[0].message));
  }
};

// Usage
router.post('/tasks', validate(taskSchema), createTask);""", "typescript"),
        _heading(2, "Validation côté client"),
        _code_block("""// Avec react-hook-form
const { register, handleSubmit } = useForm({
  resolver: zodResolver(taskSchema),
});""", "typescript")
    ),
}
