"""
Tests pour le service de collection (logique métier).

Ces tests vérifient la logique métier du service :
- Validation des règles métier
- Orchestration des appels aux repositories
- Transformations DAO → DTO
- Gestion des exceptions métier

Les repositories sont MOCKÉS pour isoler la logique du service.
"""
from datetime import datetime
from uuid import uuid4
from unittest.mock import Mock
from dtos.collection_dto import CollectionCreateDTO, CollectionDTO
from dtos.user_access_dto import UserAccessDTO
from utils.enums import SharePermissionEnum
from daos.collection_dao import Collection
from utils.enums import VisibilityEnum


class TestCollectionServiceCreate:
    """Tests pour la création de collection"""

    def test_create_collection_success(self, mock_collection_repository, monkeypatch):
        """Créer une collection avec des données valides."""
        from services.impl.collection.collection_service_impl import collection_service
        from daos.user_dao import User
        from utils.enums import RoleEnum

        # Arrange
        user_id = str(uuid4())
        collection_id = str(uuid4())

        mock_user = User(
            id=user_id,
            email="test@example.com",
            username="testuser",
            password_hash="hash",
            role=RoleEnum.CLIENT,
            created_at=datetime.now()
        )
        monkeypatch.setattr("services.impl.collection.collection_service_impl.get_current_user", Mock(return_value=mock_user))

        created_dao = Collection(
            id=collection_id,
            name="Test Collection",
            description="Test desc",
            owner_id=user_id,
            visibility=VisibilityEnum.PRIVATE,
            tags=[],
            notes=[],
            shares=[],
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        mock_collection_repository.add.return_value = created_dao

        mock_dto = CollectionDTO(
            id=collection_id,
            owner_id=user_id,
            name="Test Collection",
            description="Test desc",
            visibility=VisibilityEnum.PRIVATE,
            user_access=[
                UserAccessDTO(
                    user_id=user_id,
                    permission=SharePermissionEnum.WRITE,
                )
            ],
            tags=[],
            created_at=datetime.now(),
            updated_at=datetime.now(),
            notes=[],
            edges=[],
            nodes=[]
        )

        mock_mapper = Mock(return_value=mock_dto)
        monkeypatch.setattr("services.impl.collection.collection_service_impl.collection_to_dto", mock_mapper)

        dto = CollectionCreateDTO(
            name="Test Collection",
            description="Test desc",
            owner_id=user_id,
            visibility=VisibilityEnum.PRIVATE
        )

        # Act
        result = collection_service.create(dto)

        # Assert
        assert isinstance(result, CollectionDTO)
        assert result.name == "Test Collection"
        assert len(result.user_access) > 0
        assert result.user_access[0].user_id == user_id
        mock_collection_repository.add.assert_called_once()
