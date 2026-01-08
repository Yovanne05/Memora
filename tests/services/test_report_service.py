"""
Tests pour le service report (logique métier).

Ces tests vérifient :
- Signaler une note
- Signaler une collection
- Lister les signalements (admin uniquement)
- Mettre à jour un signalement (admin uniquement)
- Validation des permissions

Les repositories sont MOCKÉS.
"""
import pytest
from uuid import uuid4
from datetime import datetime

from dtos.report_dto import ReportDTO, ReportCreateDTO, ReportUpdateDTO
from daos.report_dao import Report
from exceptions.report_exception import ReportNotFound


class TestReportServiceReportNote:
    """Tests pour signaler une note"""

    def test_report_note_success(self, mock_report_repository, mock_note_repository, monkeypatch):
        """Signaler une note avec succès."""
        from services.impl.report_service_impl import report_service
        from daos.note_dao import Note
        from daos.user_dao import User
        from utils.enums import RoleEnum, ReportStatusEnum, ReportReasonEnum

        # Arrange
        user_id = str(uuid4())
        note_id = str(uuid4())

        current_user = User(
            id=user_id, email="user@example.com", username="user",
            password_hash="hash", role=RoleEnum.CLIENT, created_at=datetime.now()
        )
        monkeypatch.setattr("services.impl.report_service_impl.get_current_user", lambda: current_user)
        monkeypatch.setattr("domain_services.report_domain_service.permission_domain_service.can_read_note", lambda *args: True)

        note = Note(
            id=note_id, title="Test Note", content="", owner_id=str(uuid4()),
            collection_id=str(uuid4()), tags=[], shares=[], share_links=[],
            flashcards=[], reports=[], outgoing_links=[], incoming_links=[],
            created_at=datetime.now(), updated_at=datetime.now()
        )
        mock_note_repository.get_for_user.return_value = note

        report = Report(
            id=str(uuid4()),
            note_id=note_id,
            reporter_id=user_id,
            reason=ReportReasonEnum.SPAM_OR_ABUSE,
            description="Contenu inapproprié",
            status=ReportStatusEnum.PENDING,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        mock_report_repository.add.return_value = report

        payload = ReportCreateDTO(reason=ReportReasonEnum.SPAM_OR_ABUSE, description="Contenu inapproprié")

        # Act
        result = report_service.report_note(note_id, payload)

        # Assert
        assert isinstance(result, ReportDTO)
        assert result.note_id == note_id
        mock_report_repository.add.assert_called_once()


class TestReportServiceReportCollection:
    """Tests pour signaler une collection"""

    def test_report_collection_success(self, mock_report_repository, mock_collection_repository, monkeypatch):
        """Signaler une collection avec succès."""
        from services.impl.report_service_impl import report_service
        from daos.collection_dao import Collection
        from daos.user_dao import User
        from utils.enums import RoleEnum, ReportStatusEnum, ReportReasonEnum

        # Arrange
        user_id = str(uuid4())
        collection_id = str(uuid4())

        current_user = User(
            id=user_id, email="user@example.com", username="user",
            password_hash="hash", role=RoleEnum.CLIENT, created_at=datetime.now()
        )
        monkeypatch.setattr("services.impl.report_service_impl.get_current_user", lambda: current_user)
        monkeypatch.setattr("domain_services.report_domain_service.permission_domain_service.can_read_collection", lambda *args: True)

        collection = Collection(
            id=collection_id, name="Test Collection", owner_id=str(uuid4()),
            tags=[], notes=[], shares=[],
            created_at=datetime.now(), updated_at=datetime.now()
        )
        mock_collection_repository.get_for_user.return_value = collection

        report = Report(
            id=str(uuid4()),
            collection_id=collection_id,
            reporter_id=user_id,
            reason=ReportReasonEnum.SHOCKING_OR_INAPPROPRIATE,
            description="Collection inappropriée",
            status=ReportStatusEnum.PENDING,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        mock_report_repository.add.return_value = report

        payload = ReportCreateDTO(reason=ReportReasonEnum.SHOCKING_OR_INAPPROPRIATE, description="Collection inappropriée")

        # Act
        result = report_service.report_collection(collection_id, payload)

        # Assert
        assert isinstance(result, ReportDTO)
        assert result.collection_id == collection_id
        mock_report_repository.add.assert_called_once()


class TestReportServiceList:
    """Tests pour lister les signalements"""

    def test_find_many_admin_only(self, mock_report_repository, monkeypatch):
        """Lister les signalements (admin uniquement)."""
        from services.impl.report_service_impl import report_service
        from daos.user_dao import User
        from utils.enums import RoleEnum, ReportStatusEnum, ReportReasonEnum
        from repositorys.report_repository import ReportSearchParams

        # Arrange
        admin_id = str(uuid4())
        current_user = User(
            id=admin_id, email="admin@example.com", username="admin",
            password_hash="hash", role=RoleEnum.ADMIN, created_at=datetime.now()
        )
        monkeypatch.setattr("services.impl.report_service_impl.get_current_user", lambda: current_user)

        reports = [
            Report(
                id=str(uuid4()),
                note_id=str(uuid4()),
                reporter_id=str(uuid4()),
                reason=ReportReasonEnum.SPAM_OR_ABUSE,
                description="Test",
                status=ReportStatusEnum.PENDING,
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
        ]
        mock_report_repository.find_many.return_value = (reports, 1)

        params = ReportSearchParams()

        # Act
        result_reports, total = report_service.find_many(params)

        # Assert
        assert total == 1
        assert len(result_reports) == 1


class TestReportServiceUpdate:
    """Tests pour mettre à jour un signalement"""

    def test_update_report_success(self, mock_report_repository, monkeypatch):
        """Mettre à jour un signalement."""
        from services.impl.report_service_impl import report_service
        from daos.user_dao import User
        from utils.enums import RoleEnum, ReportStatusEnum, ReportReasonEnum

        # Arrange
        admin_id = str(uuid4())
        report_id = str(uuid4())

        current_user = User(
            id=admin_id, email="admin@example.com", username="admin",
            password_hash="hash", role=RoleEnum.ADMIN, created_at=datetime.now()
        )
        monkeypatch.setattr("services.impl.report_service_impl.get_current_user", lambda: current_user)

        report = Report(
            id=report_id,
            note_id=str(uuid4()),
            reporter_id=str(uuid4()),
            reason=ReportReasonEnum.SPAM_OR_ABUSE,
            description="Test",
            status=ReportStatusEnum.PENDING,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        mock_report_repository.find_one.return_value = report
        mock_report_repository.update.return_value = report

        payload = ReportUpdateDTO(status=ReportStatusEnum.RESOLVED)

        # Act
        result = report_service.update(report_id, payload)

        # Assert
        assert isinstance(result, ReportDTO)
        mock_report_repository.update.assert_called_once()

    def test_update_nonexistent_report_raises_exception(self, mock_report_repository, monkeypatch):
        """Mettre à jour un signalement inexistant lève ReportNotFound."""
        from services.impl.report_service_impl import report_service
        from daos.user_dao import User
        from utils.enums import RoleEnum, ReportStatusEnum

        # Arrange
        admin_id = str(uuid4())
        report_id = str(uuid4())

        current_user = User(
            id=admin_id, email="admin@example.com", username="admin",
            password_hash="hash", role=RoleEnum.ADMIN, created_at=datetime.now()
        )
        monkeypatch.setattr("services.impl.report_service_impl.get_current_user", lambda: current_user)

        mock_report_repository.find_one.return_value = None

        payload = ReportUpdateDTO(status=ReportStatusEnum.RESOLVED)

        # Act & Assert
        with pytest.raises(ReportNotFound):
            report_service.update(report_id, payload)
