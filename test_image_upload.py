#!/usr/bin/env python3
"""Script pour tester l'upload d'image."""

import os
from uuid import uuid4

os.environ["APP_ENV"] = "test"

from app import create_app

# Créer l'app
app = create_app()
client = app.test_client()

# 1. Créer un utilisateur
print("1. Création d'un utilisateur...")
unique_suffix = str(uuid4())[:8]

user_response = client.post('/users', json={
    "email": f"imagetest-{unique_suffix}@example.com",
    "username": f"imagetest-{unique_suffix}",
    "display_name": "Image Test",
    "password": "testpassword123"
})
print(f"   Status: {user_response.status_code}")
user_data = user_response.get_json()
user_id = user_data.get('id')

if not user_id:
    print(f"   ✗ Erreur: {user_data}")
    exit(1)
print(f"   ✓ User ID: {user_id}")

# 2. Créer une note
print("\n2. Création d'une note...")
note_response = client.post('/notes', json={
    "title": f"Note de test pour images {unique_suffix}",
    "content": "Cette note va contenir des images",
    "owner_id": user_id,
    "visibility": "private"
})
print(f"   Status: {note_response.status_code}")
note_data = note_response.get_json()
note_id = note_data.get('id')

if not note_id:
    print(f"   ✗ Erreur: {note_data}")
    exit(1)
print(f"   ✓ Note ID: {note_id}")

# 3. Uploader l'image
print("\n3. Upload de l'image...")
image_path = "/home/ary/Copies d'écran/Titre nouvelle histoire/1ère scène.png"

with open(image_path, 'rb') as f:
    upload_response = client.post(
        f'/notes/{note_id}/images',
        data={'image': (f, '1ère scène.png')},
        content_type='multipart/form-data'
    )

print(f"   Status: {upload_response.status_code}")
upload_data = upload_response.get_json()

if upload_response.status_code == 201:
    print(f"   ✓ Image uploadée avec succès!")
    print(f"      Filepath: {upload_data.get('filepath')}")
    print(f"      Filename: {upload_data.get('filename')}")

    # 4. Vérifier que l'image est dans la note
    print("\n4. Vérification de la note...")
    note_check = client.get(f'/notes/{note_id}')
    note_updated = note_check.get_json()
    images = note_updated.get('images', [])
    print(f"   Images dans la note: {images}")
    if images:
        print(f"   ✓ Le champ images contient {len(images)} image(s)")
    else:
        print(f"   ✗ Le champ images est vide (problème de mapping)")
else:
    print(f"   ✗ Erreur lors de l'upload: {upload_data}")
