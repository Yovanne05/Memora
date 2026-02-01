"""Contenu des notes d'Andréas (Révisions)."""

from .helpers import _text, _paragraph, _heading, _bullet_list, _ordered_list, _code_block, _doc

ANDREAS_NOTES_CONTENT = {
    "Algo - Complexité": _doc(
        _heading(1, "Complexité algorithmique"),
        _heading(2, "Notations"),
        _bullet_list(
            [_text("O(1)", bold=True), _text(" : Constant - accès tableau")],
            [_text("O(log n)", bold=True), _text(" : Logarithmique - recherche binaire")],
            [_text("O(n)", bold=True), _text(" : Linéaire - parcours liste")],
            [_text("O(n log n)", bold=True), _text(" : Quasi-linéaire - tri fusion")],
            [_text("O(n²)", bold=True), _text(" : Quadratique - tri bulle")],
            [_text("O(2^n)", bold=True), _text(" : Exponentiel - Fibonacci naïf")]
        ),
        _heading(2, "Exemples courants"),
        _bullet_list(
            "Array access → O(1)",
            "Array search → O(n)",
            "Binary search → O(log n)",
            "HashMap get/set → O(1) moyen",
            "QuickSort → O(n log n) moyen"
        )
    ),

    "Algo - Tri": _doc(
        _heading(1, "Algorithmes de tri"),
        _heading(2, "Tri par sélection"),
        _paragraph(_text("Complexité : O(n²)")),
        _code_block("""for i in range(n):
    min_idx = i
    for j in range(i+1, n):
        if arr[j] < arr[min_idx]:
            min_idx = j
    arr[i], arr[min_idx] = arr[min_idx], arr[i]""", "python"),
        _heading(2, "Tri rapide (QuickSort)"),
        _paragraph(_text("Complexité : O(n log n) moyen, O(n²) pire cas")),
        _code_block("""def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr)//2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)""", "python"),
        _heading(2, "Tri fusion (MergeSort)"),
        _paragraph(_text("Complexité : O(n log n) garanti")),
        _paragraph(_text("Stable, mais O(n) espace supplémentaire."))
    ),

    "Algo - Graphes": _doc(
        _heading(1, "Algorithmes sur les graphes"),
        _heading(2, "Représentations"),
        _bullet_list(
            [_text("Matrice d'adjacence", bold=True), _text(" : O(V²) espace")],
            [_text("Liste d'adjacence", bold=True), _text(" : O(V + E) espace")]
        ),
        _heading(2, "BFS - Parcours en largeur"),
        _paragraph(_text("Complexité : O(V + E)")),
        _code_block("""def bfs(graph, start):
    visited = set([start])
    queue = [start]
    while queue:
        node = queue.pop(0)
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)""", "python"),
        _heading(2, "DFS - Parcours en profondeur"),
        _paragraph(_text("Complexité : O(V + E)")),
        _code_block("""def dfs(graph, node, visited=None):
    if visited is None:
        visited = set()
    visited.add(node)
    for neighbor in graph[node]:
        if neighbor not in visited:
            dfs(graph, neighbor, visited)""", "python"),
        _heading(2, "Dijkstra"),
        _paragraph(_text("Plus court chemin, poids positifs : O((V + E) log V)"))
    ),

    "SQL - Bases": _doc(
        _heading(1, "SQL - Requêtes essentielles"),
        _heading(2, "SELECT"),
        _code_block("""-- Sélection simple
SELECT * FROM users WHERE age > 18;

-- Colonnes spécifiques
SELECT name, email FROM users;

-- Alias
SELECT name AS nom, age AS age FROM users;""", "sql"),
        _heading(2, "JOIN"),
        _code_block("""-- INNER JOIN
SELECT u.name, o.total
FROM users u
INNER JOIN orders o ON u.id = o.user_id;

-- LEFT JOIN (tous les users même sans commande)
SELECT u.name, o.total
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;""", "sql"),
        _heading(2, "Agrégation"),
        _code_block("""SELECT COUNT(*) FROM users;
SELECT AVG(age) FROM users;
SELECT department, COUNT(*)
FROM users
GROUP BY department
HAVING COUNT(*) > 5;""", "sql")
    ),

    "SQL - Avancé": _doc(
        _heading(1, "SQL Avancé"),
        _heading(2, "Sous-requêtes"),
        _code_block("""-- Dans WHERE
SELECT * FROM users
WHERE id IN (SELECT user_id FROM orders WHERE total > 100);

-- Dans FROM
SELECT avg_total FROM (
    SELECT user_id, AVG(total) as avg_total
    FROM orders GROUP BY user_id
) subquery;""", "sql"),
        _heading(2, "CTE (Common Table Expression)"),
        _code_block("""WITH high_spenders AS (
    SELECT user_id, SUM(total) as total_spent
    FROM orders
    GROUP BY user_id
    HAVING SUM(total) > 1000
)
SELECT u.name, hs.total_spent
FROM users u
JOIN high_spenders hs ON u.id = hs.user_id;""", "sql"),
        _heading(2, "Window Functions"),
        _code_block("""SELECT name, salary,
    RANK() OVER (ORDER BY salary DESC) as rank,
    AVG(salary) OVER () as avg_salary
FROM employees;""", "sql"),
        _heading(2, "Index"),
        _code_block("""CREATE INDEX idx_users_email ON users(email);
CREATE UNIQUE INDEX idx_users_username ON users(username);""", "sql")
    ),

    "POO - Principes": _doc(
        _heading(1, "Programmation Orientée Objet"),
        _heading(2, "4 Piliers"),
        _ordered_list(
            [_text("Encapsulation", bold=True), _text(" : Cacher l'implémentation")],
            [_text("Abstraction", bold=True), _text(" : Simplifier la complexité")],
            [_text("Héritage", bold=True), _text(" : Réutiliser du code")],
            [_text("Polymorphisme", bold=True), _text(" : Même interface, comportements différents")]
        ),
        _heading(2, "SOLID"),
        _bullet_list(
            [_text("S", bold=True), _text("ingle Responsibility : Une classe = une responsabilité")],
            [_text("O", bold=True), _text("pen/Closed : Ouvert à l'extension, fermé à la modification")],
            [_text("L", bold=True), _text("iskov Substitution : Sous-classe substituable à parent")],
            [_text("I", bold=True), _text("nterface Segregation : Interfaces spécifiques > générales")],
            [_text("D", bold=True), _text("ependency Inversion : Dépendre des abstractions")]
        ),
        _heading(2, "Exemple Python"),
        _code_block("""class Animal:
    def speak(self):
        raise NotImplementedError

class Dog(Animal):
    def speak(self):
        return "Woof!"

class Cat(Animal):
    def speak(self):
        return "Meow!\"""", "python")
    ),

    "Design Patterns": _doc(
        _heading(1, "Design Patterns essentiels"),
        _heading(2, "Créationnels"),
        _bullet_list(
            [_text("Singleton", bold=True), _text(" : Instance unique")],
            [_text("Factory", bold=True), _text(" : Création déléguée")],
            [_text("Builder", bold=True), _text(" : Construction étape par étape")]
        ),
        _heading(2, "Structurels"),
        _bullet_list(
            [_text("Adapter", bold=True), _text(" : Compatibilité interfaces")],
            [_text("Decorator", bold=True), _text(" : Ajout comportements")],
            [_text("Facade", bold=True), _text(" : Interface simplifiée")]
        ),
        _heading(2, "Comportementaux"),
        _bullet_list(
            [_text("Observer", bold=True), _text(" : Notification changements")],
            [_text("Strategy", bold=True), _text(" : Algorithmes interchangeables")],
            [_text("State", bold=True), _text(" : Comportement selon état")]
        ),
        _heading(2, "Exemple Observer"),
        _code_block("""class Subject:
    def __init__(self):
        self._observers = []

    def attach(self, observer):
        self._observers.append(observer)

    def notify(self, data):
        for obs in self._observers:
            obs.update(data)""", "python")
    ),

    "Git - Commandes": _doc(
        _heading(1, "Git - Commandes essentielles"),
        _heading(2, "Basics"),
        _code_block("""git init                    # Initialiser repo
git clone <url>            # Cloner
git status                  # État actuel
git add .                   # Tout ajouter
git commit -m "message"     # Commiter""", "bash"),
        _heading(2, "Branches"),
        _code_block("""git branch                  # Lister
git branch feature          # Créer
git checkout feature        # Basculer
git checkout -b feature     # Créer + basculer
git merge feature           # Fusionner
git branch -d feature       # Supprimer""", "bash"),
        _heading(2, "Remote"),
        _code_block("""git remote -v               # Voir remotes
git fetch                   # Récupérer sans merger
git pull                    # Fetch + merge
git push origin main        # Pousser""", "bash"),
        _heading(2, "Annuler"),
        _code_block("""git checkout -- file        # Annuler modifs fichier
git reset HEAD~1            # Annuler dernier commit (garder modifs)
git reset --hard HEAD~1     # Annuler commit + modifs
git revert <commit>         # Créer commit inverse""", "bash")
    ),

    "HTTP - Protocole": _doc(
        _heading(1, "Protocole HTTP"),
        _heading(2, "Méthodes"),
        _bullet_list(
            [_text("GET", bold=True), _text(" : Récupérer ressource")],
            [_text("POST", bold=True), _text(" : Créer ressource")],
            [_text("PUT", bold=True), _text(" : Remplacer ressource")],
            [_text("PATCH", bold=True), _text(" : Modifier partiellement")],
            [_text("DELETE", bold=True), _text(" : Supprimer")]
        ),
        _heading(2, "Codes de statut"),
        _bullet_list(
            [_text("2xx", bold=True), _text(" : Succès (200 OK, 201 Created, 204 No Content)")],
            [_text("3xx", bold=True), _text(" : Redirection (301, 302, 304)")],
            [_text("4xx", bold=True), _text(" : Erreur client (400, 401, 403, 404)")],
            [_text("5xx", bold=True), _text(" : Erreur serveur (500, 502, 503)")]
        ),
        _heading(2, "Headers courants"),
        _code_block("""Content-Type: application/json
Authorization: Bearer <token>
Accept: application/json
Cache-Control: no-cache""", "text"),
        _heading(2, "REST"),
        _bullet_list(
            "Sans état (stateless)",
            "Ressources identifiées par URL",
            "Opérations via méthodes HTTP"
        )
    ),

    "React - Hooks": _doc(
        _heading(1, "React Hooks"),
        _heading(2, "useState"),
        _code_block("""const [count, setCount] = useState(0);
setCount(count + 1);
setCount(prev => prev + 1);""", "typescript"),
        _heading(2, "useEffect"),
        _code_block("""// Au mount
useEffect(() => {
    fetchData();
}, []);

// Quand dep change
useEffect(() => {
    console.log(id);
}, [id]);

// Cleanup
useEffect(() => {
    const sub = subscribe();
    return () => sub.unsubscribe();
}, []);""", "typescript"),
        _heading(2, "useContext"),
        _code_block("""const ThemeContext = createContext('light');
const theme = useContext(ThemeContext);""", "typescript"),
        _heading(2, "useMemo / useCallback"),
        _code_block("""const memoized = useMemo(() => expensive(a, b), [a, b]);
const callback = useCallback(() => doSomething(a), [a]);""", "typescript"),
        _heading(2, "Custom Hook"),
        _code_block("""function useLocalStorage(key, initial) {
    const [value, setValue] = useState(
        () => JSON.parse(localStorage.getItem(key)) || initial
    );
    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);
    return [value, setValue];
}""", "typescript")
    ),

    # Nouvelles notes Andréas
    "Algo - Structures de données": _doc(
        _heading(1, "Structures de données"),
        _heading(2, "Tableaux (Array)"),
        _bullet_list(
            "Accès O(1) par index",
            "Insertion/suppression O(n) au milieu",
            "Taille fixe ou dynamique selon le langage"
        ),
        _heading(2, "Listes chaînées (LinkedList)"),
        _bullet_list(
            "Insertion/suppression O(1) si on a le noeud",
            "Accès O(n) - parcours séquentiel",
            "Simple ou doublement chaînée"
        ),
        _heading(2, "Piles (Stack) - LIFO"),
        _code_block("""stack = []
stack.append(1)  # push
stack.append(2)
top = stack.pop()  # 2""", "python"),
        _heading(2, "Files (Queue) - FIFO"),
        _code_block("""from collections import deque
queue = deque()
queue.append(1)    # enqueue
queue.append(2)
first = queue.popleft()  # 1""", "python"),
        _heading(2, "HashMap / Dictionnaire"),
        _bullet_list(
            "Accès O(1) moyen par clé",
            "Collision gérée par chaînage ou adressage ouvert",
            "Facteur de charge < 0.75 recommandé"
        )
    ),

    "Algo - Récursivité": _doc(
        _heading(1, "Récursivité"),
        _heading(2, "Principe"),
        _paragraph(_text("Une fonction qui s'appelle elle-même jusqu'à atteindre un cas de base.")),
        _heading(2, "Structure type"),
        _code_block("""def recursive_function(params):
    # Cas de base - condition d'arrêt
    if base_condition:
        return base_value

    # Cas récursif
    return recursive_function(modified_params)""", "python"),
        _heading(2, "Exemple - Factorielle"),
        _code_block("""def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

# factorial(5) = 5 * 4 * 3 * 2 * 1 = 120""", "python"),
        _heading(2, "Exemple - Fibonacci"),
        _code_block("""def fib(n):
    if n <= 1:
        return n
    return fib(n-1) + fib(n-2)

# Attention: O(2^n) naïf!
# Optimiser avec mémoïsation""", "python"),
        _heading(2, "Récursivité vs Itération"),
        _bullet_list(
            "Récursif : Plus élégant, risque stack overflow",
            "Itératif : Plus performant, parfois moins lisible",
            "Tail recursion : Optimisable par le compilateur"
        )
    ),

    "Algo - Programmation dynamique": _doc(
        _heading(1, "Programmation dynamique"),
        _heading(2, "Principe"),
        _paragraph(_text("Résoudre des problèmes en combinant les solutions de sous-problèmes overlapping.")),
        _heading(2, "Deux approches"),
        _bullet_list(
            [_text("Top-down (Mémoïsation)", bold=True), _text(" : Récursif + cache")],
            [_text("Bottom-up (Tabulation)", bold=True), _text(" : Itératif, du plus petit au plus grand")]
        ),
        _heading(2, "Exemple - Fibonacci optimisé"),
        _code_block("""# Top-down avec mémoïsation
def fib_memo(n, memo={}):
    if n in memo:
        return memo[n]
    if n <= 1:
        return n
    memo[n] = fib_memo(n-1, memo) + fib_memo(n-2, memo)
    return memo[n]

# Bottom-up
def fib_tab(n):
    if n <= 1:
        return n
    dp = [0] * (n + 1)
    dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i-1] + dp[i-2]
    return dp[n]""", "python"),
        _heading(2, "Quand utiliser ?"),
        _bullet_list(
            "Sous-problèmes qui se répètent",
            "Structure optimale (optimal substructure)",
            "Exemples : Fibonacci, sac à dos, plus court chemin"
        )
    ),

    "SQL - Transactions": _doc(
        _heading(1, "Transactions SQL"),
        _heading(2, "ACID"),
        _bullet_list(
            [_text("A", bold=True), _text("tomicity : Tout ou rien")],
            [_text("C", bold=True), _text("onsistency : État valide avant/après")],
            [_text("I", bold=True), _text("solation : Transactions indépendantes")],
            [_text("D", bold=True), _text("urability : Changements persistants")]
        ),
        _heading(2, "Syntaxe"),
        _code_block("""BEGIN TRANSACTION;

UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;

-- Si tout OK
COMMIT;

-- Si erreur
ROLLBACK;""", "sql"),
        _heading(2, "Niveaux d'isolation"),
        _bullet_list(
            "READ UNCOMMITTED : Dirty reads possibles",
            "READ COMMITTED : Pas de dirty reads",
            "REPEATABLE READ : Pas de non-repeatable reads",
            "SERIALIZABLE : Isolation totale"
        ),
        _heading(2, "Deadlocks"),
        _paragraph(_text("Deux transactions qui s'attendent mutuellement. Solution : timeout ou détection."))
    ),

    "SQL - Modélisation": _doc(
        _heading(1, "Modélisation relationnelle"),
        _heading(2, "Formes normales"),
        _bullet_list(
            [_text("1NF", bold=True), _text(" : Valeurs atomiques, pas de répétition")],
            [_text("2NF", bold=True), _text(" : 1NF + dépendance totale de la clé primaire")],
            [_text("3NF", bold=True), _text(" : 2NF + pas de dépendance transitive")]
        ),
        _heading(2, "Relations"),
        _bullet_list(
            [_text("1-1", bold=True), _text(" : Clé étrangère unique")],
            [_text("1-N", bold=True), _text(" : FK côté N")],
            [_text("N-N", bold=True), _text(" : Table de jonction")]
        ),
        _heading(2, "Exemple table de jonction"),
        _code_block("""-- Relation N-N entre étudiants et cours
CREATE TABLE enrollments (
    student_id INT REFERENCES students(id),
    course_id INT REFERENCES courses(id),
    enrolled_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (student_id, course_id)
);""", "sql"),
        _heading(2, "Clés"),
        _bullet_list(
            "Clé primaire : Identifie uniquement une ligne",
            "Clé étrangère : Référence une autre table",
            "Clé candidate : Pourrait être primaire",
            "Clé composite : Plusieurs colonnes"
        )
    ),

    "TypeScript - Types": _doc(
        _heading(1, "TypeScript - Système de types"),
        _heading(2, "Types de base"),
        _code_block("""let name: string = "Alice";
let age: number = 25;
let active: boolean = true;
let items: string[] = ["a", "b"];
let tuple: [string, number] = ["age", 25];""", "typescript"),
        _heading(2, "Interfaces"),
        _code_block("""interface User {
    id: number;
    name: string;
    email?: string;  // Optionnel
    readonly createdAt: Date;
}

const user: User = { id: 1, name: "Alice", createdAt: new Date() };""", "typescript"),
        _heading(2, "Types utilitaires"),
        _code_block("""type PartialUser = Partial<User>;  // Tous optionnels
type RequiredUser = Required<User>;  // Tous requis
type PickedUser = Pick<User, 'id' | 'name'>;
type OmittedUser = Omit<User, 'createdAt'>;""", "typescript"),
        _heading(2, "Génériques"),
        _code_block("""function identity<T>(value: T): T {
    return value;
}

const str = identity<string>("hello");
const num = identity(42);  // Inféré comme number""", "typescript")
    ),

    "Docker - Bases": _doc(
        _heading(1, "Docker - Conteneurisation"),
        _heading(2, "Concepts clés"),
        _bullet_list(
            [_text("Image", bold=True), _text(" : Template immuable")],
            [_text("Container", bold=True), _text(" : Instance d'une image")],
            [_text("Dockerfile", bold=True), _text(" : Instructions de build")],
            [_text("Volume", bold=True), _text(" : Persistance des données")]
        ),
        _heading(2, "Commandes essentielles"),
        _code_block("""docker build -t myapp .     # Build image
docker run -p 3000:3000 myapp  # Run container
docker ps                       # Containers actifs
docker stop <id>               # Arrêter
docker logs <id>               # Voir logs""", "bash"),
        _heading(2, "Dockerfile type"),
        _code_block("""FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]""", "dockerfile"),
        _heading(2, "Docker Compose"),
        _code_block("""version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
  db:
    image: postgres:14
    environment:
      POSTGRES_PASSWORD: secret""", "yaml")
    ),

    "Réseau - OSI": _doc(
        _heading(1, "Modèle OSI"),
        _heading(2, "7 couches"),
        _ordered_list(
            [_text("Physique", bold=True), _text(" : Bits, câbles, signaux")],
            [_text("Liaison", bold=True), _text(" : Trames, MAC, Ethernet")],
            [_text("Réseau", bold=True), _text(" : Paquets, IP, routage")],
            [_text("Transport", bold=True), _text(" : Segments, TCP/UDP, ports")],
            [_text("Session", bold=True), _text(" : Établissement connexion")],
            [_text("Présentation", bold=True), _text(" : Encodage, chiffrement")],
            [_text("Application", bold=True), _text(" : HTTP, FTP, SMTP")]
        ),
        _heading(2, "TCP vs UDP"),
        _bullet_list(
            [_text("TCP", bold=True), _text(" : Fiable, ordonné, lent (HTTP, FTP)")],
            [_text("UDP", bold=True), _text(" : Rapide, non fiable (streaming, gaming)")]
        ),
        _heading(2, "Adressage IP"),
        _bullet_list(
            "IPv4 : 32 bits (192.168.1.1)",
            "IPv6 : 128 bits",
            "Masque de sous-réseau : /24 = 255.255.255.0"
        )
    ),

    "Sécurité - Bases": _doc(
        _heading(1, "Sécurité informatique - Bases"),
        _heading(2, "OWASP Top 10"),
        _bullet_list(
            "Injection (SQL, XSS)",
            "Authentification cassée",
            "Exposition de données sensibles",
            "XXE (XML External Entities)",
            "Contrôle d'accès défaillant"
        ),
        _heading(2, "Hashing vs Encryption"),
        _bullet_list(
            [_text("Hash", bold=True), _text(" : Irréversible, mot de passe (bcrypt, argon2)")],
            [_text("Chiffrement", bold=True), _text(" : Réversible avec clé (AES, RSA)")]
        ),
        _heading(2, "Authentification"),
        _bullet_list(
            "Session : Cookie + stockage serveur",
            "JWT : Stateless, signature",
            "OAuth2 : Délégation d'autorisation",
            "2FA : Facteur supplémentaire"
        ),
        _heading(2, "HTTPS"),
        _paragraph(_text("TLS/SSL chiffre la communication. Certificat vérifie l'identité du serveur."))
    ),
}

ANDREAS_FLASHCARDS = [
    ("Quelle est la complexité d'une recherche binaire ?",
     [("O(log n)", True),
      ("O(n)", False),
      ("O(n²)", False),
      ("O(1)", False)]),
    ("Quelle est la complexité moyenne du QuickSort ?",
     [("O(n log n)", True),
      ("O(n²)", False),
      ("O(n)", False)]),
    ("Quel algorithme de parcours utilise une file (queue) ?",
     [("BFS (Breadth-First Search)", True),
      ("DFS (Depth-First Search)", False),
      ("Dijkstra", False)]),
    ("Quelle commande SQL permet de filtrer les groupes après un GROUP BY ?",
     [("HAVING", True),
      ("WHERE", False),
      ("FILTER", False)]),
    ("Quel principe SOLID signifie 'Ouvert à l'extension, fermé à la modification' ?",
     [("Open/Closed Principle", True),
      ("Single Responsibility", False),
      ("Liskov Substitution", False)]),
    ("Quel design pattern garantit une instance unique d'une classe ?",
     [("Singleton", True),
      ("Factory", False),
      ("Observer", False)]),
    ("Quelle commande Git permet d'annuler le dernier commit en gardant les modifications ?",
     [("git reset HEAD~1", True),
      ("git revert HEAD", False),
      ("git checkout HEAD~1", False)]),
    ("Quel code HTTP indique une ressource créée avec succès ?",
     [("201 Created", True),
      ("200 OK", False),
      ("204 No Content", False)]),
    ("Quel hook React permet d'effectuer des effets de bord ?",
     [("useEffect", True),
      ("useState", False),
      ("useMemo", False)]),
    ("Quelle méthode HTTP est idempotente et remplace entièrement une ressource ?",
     [("PUT", True),
      ("POST", False),
      ("PATCH", False)]),
]
