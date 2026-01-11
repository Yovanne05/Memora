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
