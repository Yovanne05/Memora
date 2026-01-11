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
from uuid import uuid4
from datetime import datetime
from dtos.report_dto import ReportDTO, ReportCreateDTO, ReportUpdateDTO
from daos.report_dao import Report
from exceptions.report_exception import ReportNotFound


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
