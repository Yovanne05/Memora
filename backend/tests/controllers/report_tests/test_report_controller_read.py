"""
Tests pour le controller report (routing et HTTP).

Ces tests vérifient :
- POST /notes/<id>/reports (signaler une note)
- POST /collections/<id>/reports (signaler une collection)
- GET /reports (liste des signalements - admin)
- GET /reports/<id> (récupérer un signalement - admin)
- PATCH /reports/<id> (mettre à jour un signalement - admin)

Le service report_service est MOCKÉ.
"""
from uuid import uuid4
from http import HTTPStatus
from datetime import datetime
from utils.enums import ReportReasonEnum, ReportStatusEnum, ReportTargetEnum


class TestReportControllerList:
    """Tests pour GET /reports"""

    def test_list_reports_returns_200(self, admin_client, mock_report_service):
        """Le endpoint GET /reports retourne 200."""
        from dtos.report_dto import ReportDTO

        # Arrange
        reports = [
            ReportDTO(
                id=str(uuid4()),
                target_type=ReportTargetEnum.NOTE,
                note_id=str(uuid4()),
                reporter_id=str(uuid4()),
                reason=ReportReasonEnum.SPAM_OR_ABUSE,
                description="Test",
                status=ReportStatusEnum.PENDING,
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
        ]
        mock_report_service.find_many.return_value = (reports, 1)

        # Act
        response = admin_client.get("/reports")

        # Assert
        assert response.status_code == HTTPStatus.OK
        body = response.get_json()
        assert "items" in body
        assert "total" in body
        assert body["total"] == 1


class TestReportControllerGet:
    """Tests pour GET /reports/<id>"""

    def test_get_report_returns_200(self, admin_client, mock_report_service):
        """Le endpoint GET /reports/<id> retourne 200."""
        from dtos.report_dto import ReportDTO

        # Arrange
        report_id = str(uuid4())
        report = ReportDTO(
            id=report_id,
            target_type=ReportTargetEnum.NOTE,
            note_id=str(uuid4()),
            reporter_id=str(uuid4()),
            reason=ReportReasonEnum.SPAM_OR_ABUSE,
            description="Test",
            status=ReportStatusEnum.PENDING,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        mock_report_service.find_one.return_value = report

        # Act
        response = admin_client.get(f"/reports/{report_id}")

        # Assert
        assert response.status_code == HTTPStatus.OK
        body = response.get_json()
        assert body["id"] == report_id
        mock_report_service.find_one.assert_called_once_with(report_id)
