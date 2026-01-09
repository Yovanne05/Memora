"""
Tests pour PATCH /reports/<id> (update report).

Le service report_service est MOCKE pour isoler le controller.
"""
from uuid import uuid4
from http import HTTPStatus
from datetime import datetime
from utils.enums import ReportReasonEnum, ReportStatusEnum, ReportTargetEnum


class TestReportControllerUpdate:
    """Tests pour PATCH /reports/<id>"""

    def test_update_report_returns_200(self, authenticated_client, mock_report_service):
        """Le endpoint PATCH /reports/<id> retourne 200."""
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
            status=ReportStatusEnum.RESOLVED,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        mock_report_service.update.return_value = report

        payload = {
            "status": "resolved"
        }

        # Act
        response = authenticated_client.patch(f"/reports/{report_id}", json=payload)

        # Assert
        assert response.status_code == HTTPStatus.OK
        body = response.get_json()
        assert body["status"] == "resolved"
        mock_report_service.update.assert_called_once()
