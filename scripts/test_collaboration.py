"""
Script de test pour la collaboration en temps réel.

Usage:
    python scripts/test_collaboration.py --token YOUR_JWT_TOKEN --note-id YOUR_NOTE_ID

Ce script se connecte au serveur de collaboration et simule un utilisateur qui :
1. Rejoint une session collaborative
2. Envoie des opérations d'édition
3. Écoute les événements des autres collaborateurs
"""

import argparse
import time
import socketio
from datetime import datetime


class CollaborationTester:
    def __init__(self, base_url: str, token: str, note_id: str):
        self.base_url = base_url
        self.token = token
        self.note_id = note_id
        self.sio = socketio.Client()
        self.current_version = 0
        self.username = "Test User"

        self._setup_handlers()

    def _setup_handlers(self):
        """Configure les handlers d'événements Socket.IO."""

        @self.sio.event
        def connect():
            print(f"✅ [{self._timestamp()}] Connecté au serveur")
            print(f"📝 Note ID: {self.note_id}")
            print("-" * 60)

        @self.sio.event
        def disconnect():
            print(f"❌ [{self._timestamp()}] Déconnecté du serveur")

        @self.sio.on("collaboration_session")
        def on_session(data):
            print(f"\n📋 [{self._timestamp()}] Session collaborative")
            print(f"   Collaborateurs actifs: {data['active_users_count']}")
            for collab in data["collaborators"]:
                print(f"   - {collab['username']} (ID: {collab['user_id'][:8]}...)")
            print("-" * 60)

        @self.sio.on("collaboration_event")
        def on_event(event):
            event_type = event["event_type"]
            username = event["username"]
            timestamp = self._timestamp()

            if event_type == "user_joined":
                print(f"👋 [{timestamp}] {username} a rejoint la session")

            elif event_type == "user_left":
                print(f"👋 [{timestamp}] {username} a quitté la session")

            elif event_type == "content_changed":
                op = event.get("operation", {})
                op_type = op.get("operation_type")
                position = op.get("position")
                content = op.get("content", "")[:20]
                print(
                    f"✏️  [{timestamp}] {username} a modifié: {op_type} à pos {position}"
                )
                if content:
                    print(f"   Contenu: '{content}...'")
                self.current_version = op.get("version", self.current_version)

            elif event_type == "cursor_moved":
                pos = event.get("cursor_position")
                print(f"🖱️  [{timestamp}] {username} curseur à position {pos}")

            elif event_type == "user_typing":
                print(f"⌨️  [{timestamp}] {username} est en train de taper...")

            elif event_type == "user_stopped_typing":
                print(f"⏸️  [{timestamp}] {username} a arrêté de taper")

        @self.sio.on("operation_acknowledged")
        def on_ack(data):
            version = data.get("version")
            print(f"✅ [{self._timestamp()}] Opération confirmée (version {version})")
            self.current_version = version

        @self.sio.on("error")
        def on_error(error):
            msg = error.get("message", "Unknown error")
            error_type = error.get("type", "")
            print(f"❌ [{self._timestamp()}] ERREUR: {msg}")
            if error_type:
                print(f"   Type: {error_type}")

    def _timestamp(self) -> str:
        """Retourne un timestamp formaté."""
        return datetime.now().strftime("%H:%M:%S")

    def connect(self):
        """Se connecte au serveur."""
        print(f"🔌 Connexion à {self.base_url}/collaboration...")
        self.sio.connect(
            f"{self.base_url}/collaboration",
            headers={"Authorization": f"Bearer {self.token}"},
        )

    def join_collaboration(self):
        """Rejoint la session collaborative."""
        print(f"\n📥 Envoi de join_collaboration...")
        self.sio.emit("join_collaboration", {"note_id": self.note_id})
        time.sleep(1)  # Attendre la réponse

    def send_operation(self, op_type: str, position: int, content: str = "", length: int = 0):
        """Envoie une opération d'édition."""
        operation = {
            "operation_type": op_type,
            "position": position,
            "content": content,
            "length": length,
            "version": self.current_version + 1,
        }

        print(f"\n📤 Envoi d'opération: {op_type} à position {position}")
        self.sio.emit(
            "send_operation", {"note_id": self.note_id, "operation": operation}
        )
        time.sleep(0.5)  # Attendre l'ACK

    def send_cursor_position(self, position: int):
        """Envoie la position du curseur."""
        print(f"\n🖱️  Envoi position curseur: {position}")
        self.sio.emit(
            "cursor_position", {"note_id": self.note_id, "position": position}
        )
        time.sleep(0.2)

    def send_typing_status(self, is_typing: bool):
        """Envoie le statut de frappe."""
        status = "typing" if is_typing else "stopped typing"
        print(f"\n⌨️  Envoi statut: {status}")
        self.sio.emit(
            "typing_status",
            {"note_id": self.note_id, "is_typing": is_typing},
        )
        time.sleep(0.2)

    def leave_collaboration(self):
        """Quitte la session collaborative."""
        print(f"\n📤 Envoi de leave_collaboration...")
        self.sio.emit("leave_collaboration", {"note_id": self.note_id})
        time.sleep(1)

    def disconnect(self):
        """Se déconnecte du serveur."""
        print(f"\n🔌 Déconnexion...")
        self.sio.disconnect()

    def run_interactive_test(self):
        """Lance un test interactif."""
        try:
            self.connect()
            self.join_collaboration()

            print("\n" + "=" * 60)
            print("Mode interactif - Commandes disponibles:")
            print("  insert <pos> <text>  - Insérer du texte")
            print("  delete <pos> <len>   - Supprimer du texte")
            print("  replace <pos> <len> <text> - Remplacer du texte")
            print("  cursor <pos>         - Déplacer le curseur")
            print("  typing               - Indiquer qu'on tape")
            print("  stop                 - Arrêter de taper")
            print("  leave                - Quitter la session")
            print("  quit                 - Quitter le test")
            print("=" * 60)

            while True:
                try:
                    cmd = input("\n> ").strip().split()
                    if not cmd:
                        continue

                    action = cmd[0].lower()

                    if action == "insert" and len(cmd) >= 3:
                        pos = int(cmd[1])
                        text = " ".join(cmd[2:])
                        self.send_operation("insert", pos, content=text)

                    elif action == "delete" and len(cmd) == 3:
                        pos = int(cmd[1])
                        length = int(cmd[2])
                        self.send_operation("delete", pos, length=length)

                    elif action == "replace" and len(cmd) >= 4:
                        pos = int(cmd[1])
                        length = int(cmd[2])
                        text = " ".join(cmd[3:])
                        self.send_operation("replace", pos, content=text, length=length)

                    elif action == "cursor" and len(cmd) == 2:
                        pos = int(cmd[1])
                        self.send_cursor_position(pos)

                    elif action == "typing":
                        self.send_typing_status(True)

                    elif action == "stop":
                        self.send_typing_status(False)

                    elif action == "leave":
                        self.leave_collaboration()

                    elif action == "quit":
                        break

                    else:
                        print("❌ Commande invalide")

                except ValueError:
                    print("❌ Paramètres invalides")
                except KeyboardInterrupt:
                    break

        finally:
            self.disconnect()

    def run_automated_test(self):
        """Lance un test automatisé."""
        try:
            self.connect()
            self.join_collaboration()

            print("\n" + "=" * 60)
            print("🤖 Test automatisé en cours...")
            print("=" * 60)

            # Test 1: Insérer du texte
            print("\n📝 Test 1: Insertion de texte")
            self.send_operation("insert", 0, content="Hello, World! ")
            time.sleep(1)

            # Test 2: Insérer plus de texte
            print("\n📝 Test 2: Insertion de texte supplémentaire")
            self.send_operation("insert", 14, content="This is a test. ")
            time.sleep(1)

            # Test 3: Déplacer le curseur
            print("\n📝 Test 3: Déplacement du curseur")
            self.send_cursor_position(10)
            time.sleep(0.5)
            self.send_cursor_position(20)
            time.sleep(0.5)

            # Test 4: Statut de frappe
            print("\n📝 Test 4: Statut de frappe")
            self.send_typing_status(True)
            time.sleep(2)
            self.send_typing_status(False)
            time.sleep(1)

            # Test 5: Suppression
            print("\n📝 Test 5: Suppression de texte")
            self.send_operation("delete", 0, length=7)
            time.sleep(1)

            # Test 6: Remplacement
            print("\n📝 Test 6: Remplacement de texte")
            self.send_operation("replace", 0, content="Hi", length=5)
            time.sleep(1)

            print("\n" + "=" * 60)
            print("✅ Test automatisé terminé !")
            print("=" * 60)

            # Attendre un peu avant de quitter
            time.sleep(2)
            self.leave_collaboration()

        finally:
            self.disconnect()


def main():
    parser = argparse.ArgumentParser(description="Test de collaboration temps réel")
    parser.add_argument(
        "--token", required=True, help="JWT token pour l'authentification"
    )
    parser.add_argument("--note-id", required=True, help="ID de la note à éditer")
    parser.add_argument(
        "--base-url",
        default="http://localhost:5000",
        help="URL de base du serveur (défaut: http://localhost:5000)",
    )
    parser.add_argument(
        "--mode",
        choices=["interactive", "auto"],
        default="interactive",
        help="Mode de test: interactive ou auto (défaut: interactive)",
    )

    args = parser.parse_args()

    tester = CollaborationTester(args.base_url, args.token, args.note_id)

    if args.mode == "interactive":
        tester.run_interactive_test()
    else:
        tester.run_automated_test()


if __name__ == "__main__":
    main()
