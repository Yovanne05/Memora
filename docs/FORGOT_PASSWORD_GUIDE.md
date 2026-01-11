# Guide - Fonctionnalité "Mot de passe oublié"

## 🎯 Fonctionnalité implémentée

Une fonctionnalité complète de réinitialisation de mot de passe a été ajoutée à Memora.

### Pour l'utilisateur

1. **Sur la page de connexion** : Un lien "Mot de passe oublié ?" est disponible
2. **Page de réinitialisation** : L'utilisateur entre son email
3. **Email automatique** : Un mot de passe temporaire est généré et envoyé par email
4. **Connexion** : L'utilisateur se connecte avec le mot de passe temporaire
5. **Changement obligatoire** : L'utilisateur doit aller dans **Paramètres > Sécurité** pour changer son mot de passe

## 📁 Fichiers créés

### Frontend

1. **Service API** : `src/features/auth/services/password-reset.service.ts`
   - Appelle l'endpoint `/auth/forgot-password`
   - Gère la communication avec le backend

2. **Hook** : `src/features/auth/hooks/useForgotPassword.ts`
   - Gère le formulaire et l'état
   - Affiche les messages de succès/erreur

3. **Page** : `src/features/auth/pages/forgot-password/ForgotPasswordPage.tsx`
   - Formulaire pour entrer l'email
   - Page de confirmation avec instructions détaillées

4. **Route** : `src/routes/auth/forgot-password.tsx`
   - Route accessible via `/auth/forgot-password`

5. **Composant UI** : `src/components/ui/alert.tsx`
   - Composant Alert pour afficher les messages importants

6. **Mise à jour** : `src/features/auth/pages/login/LoginForm.tsx`
   - Ajout du lien "Mot de passe oublié ?" sous le champ mot de passe

## 🔧 Backend à implémenter

Le backend doit créer l'endpoint suivant :

### POST `/auth/forgot-password`

**Corps de la requête :**

```json
{
  "email": "user@example.com"
}
```

**Processus :**

1. Vérifier que l'email existe
2. Générer un mot de passe temporaire sécurisé (12 caractères, 1 majuscule, 1 chiffre, 1 caractère spécial)
3. Hasher et mettre à jour le mot de passe dans la BD
4. Envoyer le mot de passe par email à l'utilisateur
5. Retourner une réponse de succès

**Réponse de succès (200) :**

```json
{
  "message": "Un nouveau mot de passe temporaire a été envoyé à votre adresse e-mail",
  "success": true
}
```

**Réponse d'erreur (404) :**

```json
{
  "message": "Aucun compte associé à cette adresse e-mail",
  "success": false
}
```

📄 **Documentation complète** : Voir `docs/PASSWORD_RESET_BACKEND.md`

## ✨ Caractéristiques

### Sécurité

- ✅ Mot de passe temporaire de 12 caractères
- ✅ Au moins 1 majuscule
- ✅ Au moins 1 chiffre
- ✅ Au moins 1 caractère spécial (!@#$%^&\*)
- ✅ Mot de passe hashé avant stockage
- ✅ Envoi uniquement par email

### UX/UI

- ✅ Interface claire et intuitive
- ✅ Messages d'erreur explicites
- ✅ Page de confirmation avec instructions détaillées
- ✅ Lien "Retour à la connexion" à chaque étape
- ✅ Possibilité de renvoyer un email
- ✅ Instructions pour changer le mot de passe dans Paramètres > Sécurité

### Responsive

- ✅ Design adaptatif mobile/desktop
- ✅ Composants Shadcn/ui cohérents avec le reste de l'application

## 🧪 Tests

✅ Build : OK
✅ Tests unitaires : OK (66 tests passent)
✅ Compilation TypeScript : OK

## 📝 Template d'email recommandé

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Réinitialisation de votre mot de passe - Memora</title>
  </head>
  <body
    style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"
  >
    <div
      style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;"
    >
      <h1 style="color: white; margin: 0;">Memora</h1>
    </div>

    <div
      style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;"
    >
      <h2 style="color: #333; margin-top: 0;">
        Réinitialisation de votre mot de passe
      </h2>

      <p>Bonjour <strong>{username}</strong>,</p>

      <p>
        Vous avez demandé la réinitialisation de votre mot de passe sur Memora.
      </p>

      <p>Votre nouveau mot de passe temporaire est :</p>

      <div
        style="background: white; padding: 20px; border-radius: 5px; border: 2px dashed #667eea; text-align: center; margin: 20px 0;"
      >
        <p
          style="font-size: 24px; font-weight: bold; color: #667eea; margin: 0; font-family: 'Courier New', monospace;"
        >
          {temp_password}
        </p>
      </div>

      <div
        style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;"
      >
        <p style="margin: 0; font-weight: bold; color: #856404;">
          ⚠️ Important :
        </p>
        <ul style="margin: 10px 0; color: #856404;">
          <li>Ce mot de passe est temporaire et sécurisé</li>
          <li>Connectez-vous sur <a href="https://memora.app">Memora</a></li>
          <li>
            Changez-le immédiatement dans
            <strong>Paramètres &gt; Sécurité</strong>
          </li>
        </ul>
      </div>

      <p style="color: #666; font-size: 14px; margin-top: 30px;">
        Si vous n'avez pas demandé cette réinitialisation, contactez-nous
        immédiatement à
        <a href="mailto:infoiut@iut.univ-paris8.fr"
          >infoiut@iut.univ-paris8.fr</a
        >
      </p>

      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;" />

      <p style="color: #999; font-size: 12px; text-align: center;">
        © 2026 Memora - IUT de Montreuil<br />
        Cet email a été envoyé automatiquement, merci de ne pas y répondre.
      </p>
    </div>
  </body>
</html>
```

## 🚀 Prochaines étapes

1. **Implémenter l'endpoint backend** (voir `docs/PASSWORD_RESET_BACKEND.md`)
2. **Configurer Flask-Mail** avec les credentials SMTP
3. **Tester le flux complet** :
   - Demander une réinitialisation
   - Recevoir l'email
   - Se connecter avec le mot de passe temporaire
   - Changer le mot de passe dans Paramètres > Sécurité
4. **Optionnel** : Ajouter une limite de tentatives pour éviter le spam

## 📞 Support

Pour toute question, contactez : **infoiut@iut.univ-paris8.fr**
