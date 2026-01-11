# Implémentation Backend - Réinitialisation de Mot de Passe

## Endpoint requis

### POST `/auth/forgot-password`

Cet endpoint doit gérer la réinitialisation automatique du mot de passe.

#### Requête

```json
{
  "email": "user@example.com"
}
```

#### Processus Backend

1. **Vérifier que l'email existe** dans la base de données
   - Si l'email n'existe pas, retourner une erreur 404 ou 400

2. **Générer un mot de passe temporaire sécurisé**

   ```python
   import random
   import string

   def generate_temp_password():
       # 12 caractères minimum
       uppercase = random.choice(string.ascii_uppercase)
       digit = random.choice(string.digits)
       special = random.choice('!@#$%^&*')

       # Compléter avec des caractères aléatoires
       remaining = ''.join(random.choices(
           string.ascii_letters + string.digits + '!@#$%^&*',
           k=9
       ))

       # Mélanger tous les caractères
       temp_password = list(uppercase + digit + special + remaining)
       random.shuffle(temp_password)

       return ''.join(temp_password)
   ```

3. **Hasher et stocker** le nouveau mot de passe

   ```python
   from werkzeug.security import generate_password_hash

   temp_password = generate_temp_password()
   hashed_password = generate_password_hash(temp_password)

   # Mettre à jour la base de données
   user.password = hashed_password
   db.session.commit()
   ```

4. **Envoyer l'email** avec le mot de passe temporaire

   ```python
   from flask_mail import Message, Mail

   msg = Message(
       subject="Votre nouveau mot de passe temporaire - Memora",
       recipients=[user.email],
       html=f"""
       <html>
         <body>
           <h2>Réinitialisation de votre mot de passe</h2>
           <p>Bonjour {user.username},</p>

           <p>Vous avez demandé la réinitialisation de votre mot de passe sur Memora.</p>

           <p>Votre nouveau mot de passe temporaire est :</p>
           <p style="font-size: 18px; font-weight: bold; padding: 10px; background: #f0f0f0; border-radius: 5px;">
             {temp_password}
           </p>

           <p><strong>Important :</strong></p>
           <ul>
             <li>Ce mot de passe est temporaire et sécurisé (12 caractères, majuscule, chiffre, caractère spécial)</li>
             <li>Connectez-vous avec ce mot de passe sur <a href="https://memora.app">Memora</a></li>
             <li>Changez-le immédiatement dans <strong>Paramètres > Sécurité</strong></li>
           </ul>

           <p>Si vous n'avez pas demandé cette réinitialisation, contactez-nous immédiatement à infoiut@iut.univ-paris8.fr</p>

           <p>Cordialement,<br>L'équipe Memora</p>
         </body>
       </html>
       """
   )
   mail.send(msg)
   ```

5. **Retourner une réponse**

#### Réponse Succès (200)

```json
{
  "message": "Un nouveau mot de passe temporaire a été envoyé à votre adresse e-mail",
  "success": true
}
```

#### Réponses d'erreur

**Email non trouvé (404)**

```json
{
  "message": "Aucun compte associé à cette adresse e-mail",
  "success": false
}
```

**Erreur serveur (500)**

```json
{
  "message": "Erreur lors de l'envoi de l'e-mail. Veuillez réessayer.",
  "success": false
}
```

## Configuration Email (Flask-Mail)

Assurez-vous que Flask-Mail est configuré dans votre application :

```python
from flask_mail import Mail

app.config['MAIL_SERVER'] = 'smtp.gmail.com'  # ou votre serveur SMTP
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'votre.email@example.com'
app.config['MAIL_PASSWORD'] = 'votre_mot_de_passe'
app.config['MAIL_DEFAULT_SENDER'] = 'Memora <noreply@memora.app>'

mail = Mail(app)
```

## Exemple d'implémentation Flask

```python
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
import random
import string

auth_bp = Blueprint('auth', __name__)

def generate_temp_password():
    uppercase = random.choice(string.ascii_uppercase)
    digit = random.choice(string.digits)
    special = random.choice('!@#$%^&*')
    remaining = ''.join(random.choices(
        string.ascii_letters + string.digits + '!@#$%^&*',
        k=9
    ))
    temp_password = list(uppercase + digit + special + remaining)
    random.shuffle(temp_password)
    return ''.join(temp_password)

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    try:
        data = request.get_json()
        email = data.get('email')

        if not email:
            return jsonify({
                'message': 'Adresse e-mail requise',
                'success': False
            }), 400

        # Chercher l'utilisateur
        user = User.query.filter_by(email=email).first()

        if not user:
            return jsonify({
                'message': 'Aucun compte associé à cette adresse e-mail',
                'success': False
            }), 404

        # Générer et hasher le nouveau mot de passe
        temp_password = generate_temp_password()
        user.password = generate_password_hash(temp_password)
        db.session.commit()

        # Envoyer l'email
        msg = Message(
            subject="Votre nouveau mot de passe temporaire - Memora",
            recipients=[user.email],
            html=f"""
            <html>
              <body>
                <h2>Réinitialisation de votre mot de passe</h2>
                <p>Bonjour {user.username},</p>

                <p>Votre nouveau mot de passe temporaire est :</p>
                <p style="font-size: 18px; font-weight: bold; padding: 10px; background: #f0f0f0;">
                  {temp_password}
                </p>

                <p><strong>Changez-le immédiatement dans Paramètres > Sécurité</strong></p>

                <p>Si vous n'avez pas demandé cette réinitialisation, contactez-nous à infoiut@iut.univ-paris8.fr</p>
              </body>
            </html>
            """
        )
        mail.send(msg)

        return jsonify({
            'message': 'Un nouveau mot de passe temporaire a été envoyé à votre adresse e-mail',
            'success': True
        }), 200

    except Exception as e:
        return jsonify({
            'message': 'Erreur lors de l\'envoi de l\'e-mail. Veuillez réessayer.',
            'success': False
        }), 500
```

## Sécurité

- ✅ Le mot de passe généré contient 12 caractères
- ✅ Au moins 1 majuscule
- ✅ Au moins 1 chiffre
- ✅ Au moins 1 caractère spécial
- ✅ Le mot de passe est hashé avant stockage
- ✅ L'utilisateur doit le changer immédiatement
- ✅ Pas de token de réinitialisation (le mot de passe est directement changé)

## Frontend

Le frontend a été implémenté et inclut :

- ✅ Page `/auth/forgot-password` avec formulaire d'email
- ✅ Lien "Mot de passe oublié ?" sur la page de connexion
- ✅ Page de confirmation avec instructions
- ✅ Service API prêt à appeler l'endpoint backend
- ✅ Instructions claires pour changer le mot de passe dans Paramètres > Sécurité
