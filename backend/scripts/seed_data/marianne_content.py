"""Contenu des notes de Marianne (Enseignante)."""

from .helpers import _text, _paragraph, _heading, _bullet_list, _ordered_list, _code_block, _doc

MARIANNE_NOTES_CONTENT = {
    "Intro Programmation": _doc(
        _heading(1, "Introduction à la programmation"),
        _heading(2, "Objectifs du cours"),
        _bullet_list(
            "Comprendre les concepts fondamentaux",
            "Apprendre à résoudre des problèmes",
            "Maîtriser un premier langage (Python)"
        ),
        _heading(2, "Qu'est-ce qu'un programme ?"),
        _paragraph(_text("Un programme est une "), _text("séquence d'instructions", bold=True), _text(" que l'ordinateur exécute pour accomplir une tâche.")),
        _heading(2, "Concepts de base"),
        _ordered_list(
            [_text("Variables", bold=True), _text(" : Stocker des données")],
            [_text("Conditions", bold=True), _text(" : Prendre des décisions")],
            [_text("Boucles", bold=True), _text(" : Répéter des actions")],
            [_text("Fonctions", bold=True), _text(" : Organiser le code")]
        ),
        _heading(2, "Premier programme"),
        _code_block("""# Mon premier programme Python
print("Hello, World!")

# Avec une variable
nom = "Alice"
print(f"Bonjour, {nom}!")""", "python")
    ),

    "Variables et Types": _doc(
        _heading(1, "Variables et types de données"),
        _heading(2, "Déclaration de variables"),
        _code_block("""# En Python, pas besoin de déclarer le type
age = 25              # int
prix = 19.99          # float
nom = "Alice"         # str
actif = True          # bool""", "python"),
        _heading(2, "Types primitifs"),
        _bullet_list(
            [_text("int", code=True), _text(" : Entier (42, -7, 0)")],
            [_text("float", code=True), _text(" : Décimal (3.14, -0.5)")],
            [_text("str", code=True), _text(" : Chaîne (\"Hello\")")],
            [_text("bool", code=True), _text(" : Booléen (True, False)")]
        ),
        _heading(2, "Conversion de types"),
        _code_block("""x = "42"
y = int(x)      # str -> int
z = float(x)    # str -> float
s = str(42)     # int -> str""", "python"),
        _heading(2, "Bonnes pratiques"),
        _bullet_list(
            [_text("Noms explicites : "), _text("age_utilisateur", code=True), _text(" plutôt que "), _text("x", code=True)],
            "snake_case en Python",
            [_text("Constantes en MAJUSCULES : "), _text("MAX_SIZE = 100", code=True)]
        )
    ),

    "Structures de contrôle": _doc(
        _heading(1, "Structures de contrôle"),
        _heading(2, "Conditions (if/elif/else)"),
        _code_block("""age = 18

if age < 18:
    print("Mineur")
elif age == 18:
    print("Tout juste majeur")
else:
    print("Majeur")""", "python"),
        _heading(2, "Opérateurs de comparaison"),
        _bullet_list(
            [_text("==", code=True), _text(" : Égalité")],
            [_text("!=", code=True), _text(" : Différence")],
            [_text("<", code=True), _text(", "), _text(">", code=True), _text(" : Inférieur, supérieur")],
            [_text("<=", code=True), _text(", "), _text(">=", code=True), _text(" : Inférieur ou égal, supérieur ou égal")]
        ),
        _heading(2, "Opérateurs logiques"),
        _code_block("""if age >= 18 and permis:
    print("Peut conduire")

if weekend or vacances:
    print("Repos!")

if not travail:
    print("Libre")""", "python")
    ),

    "Boucles": _doc(
        _heading(1, "Les boucles"),
        _heading(2, "Boucle for"),
        _code_block("""# Parcourir une liste
fruits = ["pomme", "banane", "orange"]
for fruit in fruits:
    print(fruit)

# Range
for i in range(5):      # 0, 1, 2, 3, 4
    print(i)

for i in range(2, 10, 2):  # 2, 4, 6, 8
    print(i)""", "python"),
        _heading(2, "Boucle while"),
        _code_block("""compteur = 0
while compteur < 5:
    print(compteur)
    compteur += 1""", "python"),
        _heading(2, "Contrôle de boucle"),
        _code_block("""# break : sortir de la boucle
for i in range(10):
    if i == 5:
        break
    print(i)  # 0, 1, 2, 3, 4

# continue : passer à l'itération suivante
for i in range(5):
    if i == 2:
        continue
    print(i)  # 0, 1, 3, 4""", "python"),
        _heading(2, "Exercice type"),
        _paragraph(_text("Afficher tous les nombres pairs de 1 à 20."))
    ),

    "Fonctions": _doc(
        _heading(1, "Les fonctions"),
        _heading(2, "Définition"),
        _code_block("""def saluer(nom):
    \"\"\"Affiche un message de salutation.\"\"\"
    print(f"Bonjour, {nom}!")

saluer("Alice")  # Bonjour, Alice!""", "python"),
        _heading(2, "Retour de valeur"),
        _code_block("""def addition(a, b):
    return a + b

resultat = addition(3, 5)  # 8""", "python"),
        _heading(2, "Paramètres par défaut"),
        _code_block("""def saluer(nom, message="Bonjour"):
    print(f"{message}, {nom}!")

saluer("Alice")           # Bonjour, Alice!
saluer("Bob", "Salut")    # Salut, Bob!""", "python"),
        _heading(2, "Arguments nommés"),
        _code_block("""def creer_profil(nom, age, ville):
    return f"{nom}, {age} ans, {ville}"

profil = creer_profil(age=25, ville="Paris", nom="Alice")""", "python"),
        _heading(2, "Docstrings"),
        _paragraph(_text("Toujours documenter vos fonctions !")),
        _code_block("""def calculer_moyenne(notes):
    \"\"\"
    Calcule la moyenne d'une liste de notes.

    Args:
        notes: Liste de nombres

    Returns:
        La moyenne des notes
    \"\"\"
    return sum(notes) / len(notes)""", "python")
    ),

    "Listes et Dictionnaires": _doc(
        _heading(1, "Collections : Listes et Dictionnaires"),
        _heading(2, "Listes"),
        _code_block("""# Création
fruits = ["pomme", "banane", "orange"]
nombres = [1, 2, 3, 4, 5]
mixte = [1, "deux", 3.0, True]

# Accès
print(fruits[0])     # pomme
print(fruits[-1])    # orange (dernier)

# Modification
fruits.append("kiwi")       # Ajouter
fruits.remove("banane")     # Supprimer
fruits[0] = "poire"         # Modifier""", "python"),
        _heading(2, "Slicing"),
        _code_block("""liste = [0, 1, 2, 3, 4, 5]
print(liste[1:4])    # [1, 2, 3]
print(liste[:3])     # [0, 1, 2]
print(liste[3:])     # [3, 4, 5]
print(liste[::2])    # [0, 2, 4]""", "python"),
        _heading(2, "Dictionnaires"),
        _code_block("""# Création
etudiant = {
    "nom": "Alice",
    "age": 20,
    "notes": [15, 18, 12]
}

# Accès
print(etudiant["nom"])        # Alice
print(etudiant.get("ville"))  # None (pas d'erreur)

# Modification
etudiant["age"] = 21
etudiant["ville"] = "Paris"

# Parcours
for cle, valeur in etudiant.items():
    print(f"{cle}: {valeur}")""", "python")
    ),

    "Fichiers": _doc(
        _heading(1, "Manipulation de fichiers"),
        _heading(2, "Lecture"),
        _code_block("""# Méthode recommandée (with)
with open("fichier.txt", "r") as f:
    contenu = f.read()

# Ligne par ligne
with open("fichier.txt", "r") as f:
    for ligne in f:
        print(ligne.strip())

# Toutes les lignes en liste
with open("fichier.txt", "r") as f:
    lignes = f.readlines()""", "python"),
        _heading(2, "Écriture"),
        _code_block("""# Écrire (écrase le fichier)
with open("fichier.txt", "w") as f:
    f.write("Hello World\\n")

# Ajouter (append)
with open("fichier.txt", "a") as f:
    f.write("Nouvelle ligne\\n")""", "python"),
        _heading(2, "Fichiers CSV"),
        _code_block("""import csv

# Lecture
with open("data.csv", "r") as f:
    reader = csv.DictReader(f)
    for row in reader:
        print(row["nom"], row["age"])

# Écriture
with open("data.csv", "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["nom", "age"])
    writer.writeheader()
    writer.writerow({"nom": "Alice", "age": 25})""", "python")
    ),

    "Exceptions": _doc(
        _heading(1, "Gestion des exceptions"),
        _heading(2, "Try/Except"),
        _code_block("""try:
    resultat = 10 / 0
except ZeroDivisionError:
    print("Division par zéro impossible!")""", "python"),
        _heading(2, "Plusieurs exceptions"),
        _code_block("""try:
    valeur = int(input("Entrez un nombre: "))
    resultat = 10 / valeur
except ValueError:
    print("Ce n'est pas un nombre!")
except ZeroDivisionError:
    print("Division par zéro!")
except Exception as e:
    print(f"Erreur inattendue: {e}")""", "python"),
        _heading(2, "Finally"),
        _code_block("""try:
    f = open("fichier.txt")
    # traitement...
except FileNotFoundError:
    print("Fichier non trouvé")
finally:
    f.close()  # Toujours exécuté""", "python"),
        _heading(2, "Lever une exception"),
        _code_block("""def diviser(a, b):
    if b == 0:
        raise ValueError("Le diviseur ne peut pas être zéro")
    return a / b""", "python"),
        _heading(2, "Exceptions personnalisées"),
        _code_block("""class NoteInvalideError(Exception):
    pass

def ajouter_note(note):
    if not 0 <= note <= 20:
        raise NoteInvalideError(f"Note {note} invalide")""", "python")
    ),

    "POO Bases": _doc(
        _heading(1, "Programmation Orientée Objet - Bases"),
        _heading(2, "Classe et objet"),
        _code_block("""class Etudiant:
    def __init__(self, nom, age):
        self.nom = nom
        self.age = age
        self.notes = []

    def ajouter_note(self, note):
        self.notes.append(note)

    def moyenne(self):
        if not self.notes:
            return 0
        return sum(self.notes) / len(self.notes)

# Utilisation
alice = Etudiant("Alice", 20)
alice.ajouter_note(15)
alice.ajouter_note(18)
print(alice.moyenne())  # 16.5""", "python"),
        _heading(2, "Attributs de classe vs instance"),
        _code_block("""class Compteur:
    total = 0  # Attribut de classe

    def __init__(self):
        Compteur.total += 1
        self.numero = Compteur.total  # Attribut d'instance""", "python"),
        _heading(2, "Méthodes spéciales"),
        _code_block("""class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __str__(self):
        return f"Point({self.x}, {self.y})"

    def __add__(self, other):
        return Point(self.x + other.x, self.y + other.y)""", "python")
    ),

    "POO Héritage": _doc(
        _heading(1, "Héritage en POO"),
        _heading(2, "Héritage simple"),
        _code_block("""class Animal:
    def __init__(self, nom):
        self.nom = nom

    def parler(self):
        raise NotImplementedError

class Chien(Animal):
    def parler(self):
        return "Wouf!"

class Chat(Animal):
    def parler(self):
        return "Miaou!"

rex = Chien("Rex")
print(rex.parler())  # Wouf!""", "python"),
        _heading(2, "Super()"),
        _code_block("""class Vehicule:
    def __init__(self, marque):
        self.marque = marque

class Voiture(Vehicule):
    def __init__(self, marque, nb_portes):
        super().__init__(marque)
        self.nb_portes = nb_portes""", "python"),
        _heading(2, "Polymorphisme"),
        _code_block("""def faire_parler(animal):
    print(animal.parler())

animaux = [Chien("Rex"), Chat("Minou")]
for animal in animaux:
    faire_parler(animal)""", "python"),
        _heading(2, "Classes abstraites"),
        _code_block("""from abc import ABC, abstractmethod

class Forme(ABC):
    @abstractmethod
    def aire(self):
        pass

class Rectangle(Forme):
    def __init__(self, l, L):
        self.l = l
        self.L = L

    def aire(self):
        return self.l * self.L""", "python")
    ),

    "Tests unitaires": _doc(
        _heading(1, "Tests unitaires avec pytest"),
        _heading(2, "Premier test"),
        _code_block("""# calculator.py
def addition(a, b):
    return a + b

# test_calculator.py
from calculator import addition

def test_addition():
    assert addition(2, 3) == 5
    assert addition(-1, 1) == 0
    assert addition(0, 0) == 0""", "python"),
        _heading(2, "Lancer les tests"),
        _code_block("""pytest                    # Tous les tests
pytest test_file.py       # Un fichier
pytest -v                 # Verbose
pytest -k "test_add"      # Par nom""", "bash"),
        _heading(2, "Fixtures"),
        _code_block("""import pytest

@pytest.fixture
def etudiant():
    return Etudiant("Alice", 20)

def test_ajouter_note(etudiant):
    etudiant.ajouter_note(15)
    assert len(etudiant.notes) == 1""", "python"),
        _heading(2, "Tester les exceptions"),
        _code_block("""def test_division_par_zero():
    with pytest.raises(ZeroDivisionError):
        diviser(10, 0)""", "python"),
        _heading(2, "Couverture"),
        _code_block("""pytest --cov=mon_module --cov-report=html""", "bash")
    ),

    "Bonnes pratiques": _doc(
        _heading(1, "Bonnes pratiques de programmation"),
        _heading(2, "Lisibilité"),
        _bullet_list(
            "Noms de variables explicites",
            "Fonctions courtes (< 20 lignes)",
            "Une fonction = une responsabilité",
            "Commentaires utiles, pas évidents"
        ),
        _heading(2, "PEP 8 (Python)"),
        _bullet_list(
            "Indentation : 4 espaces",
            "Lignes : max 79 caractères",
            "snake_case pour fonctions/variables",
            "PascalCase pour classes",
            "MAJUSCULES pour constantes"
        ),
        _heading(2, "DRY - Don't Repeat Yourself"),
        _code_block("""# ❌ Mauvais
def saluer_alice():
    print("Bonjour Alice!")
def saluer_bob():
    print("Bonjour Bob!")

# ✅ Bon
def saluer(nom):
    print(f"Bonjour {nom}!")""", "python"),
        _heading(2, "KISS - Keep It Simple"),
        _paragraph(_text("Préférer une solution simple à une solution complexe, même si elle est moins \"élégante\".")),
        _heading(2, "Documentation"),
        _bullet_list(
            "Docstrings pour les fonctions publiques",
            "README pour le projet",
            "Commentaires pour la logique complexe"
        )
    ),
}


# =============================================================================

MARIANNE_FLASHCARDS = [
    ("En Python, quel est le type de la valeur 3.14 ?",
     [("float", True),
      ("int", False),
      ("str", False),
      ("decimal", False)]),
    ("Quelle structure de contrôle permet de répéter une action tant qu'une condition est vraie ?",
     [("while", True),
      ("for", False),
      ("if", False)]),
    ("Comment ajouter un élément à la fin d'une liste en Python ?",
     [("liste.append(element)", True),
      ("liste.add(element)", False),
      ("liste.push(element)", False)]),
    ("Quel mot-clé permet de sortir d'une boucle prématurément ?",
     [("break", True),
      ("continue", False),
      ("return", False),
      ("exit", False)]),
    ("Comment accéder à la valeur associée à la clé 'nom' dans un dictionnaire d ?",
     [("d['nom'] ou d.get('nom')", True),
      ("d.nom", False),
      ("d(nom)", False)]),
    ("Quel est le mode d'ouverture de fichier pour ajouter du contenu sans écraser ?",
     [("'a' (append)", True),
      ("'w' (write)", False),
      ("'r' (read)", False)]),
    ("Quel bloc est toujours exécuté, qu'il y ait une exception ou non ?",
     [("finally", True),
      ("except", False),
      ("else", False)]),
    ("Comment appeler le constructeur de la classe parente en Python ?",
     [("super().__init__()", True),
      ("parent.__init__()", False),
      ("self.parent()", False)]),
    ("Quel décorateur pytest permet de créer des données de test réutilisables ?",
     [("@pytest.fixture", True),
      ("@pytest.mark", False),
      ("@pytest.setup", False)]),
    ("Que signifie le principe DRY ?",
     [("Don't Repeat Yourself", True),
      ("Do Repeat Yourself", False),
      ("Don't Run Yourself", False)]),
]
