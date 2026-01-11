"""
Tests pour POST /notes/<id>/reports et POST /collections/<id>/reports (create report).

Le service report_service est MOCKE pour isoler le controller.
"""
from uuid import uuid4
from http import HTTPStatus
from datetime import datetime
from utils.enums import ReportReasonEnum, ReportStatusEnum, ReportTargetEnum


class TestReportControllerReportNote:
    """Tests pour POST /notes/<id>/reports"""

    def test_report_note_returns_201(self, authenticated_client, mock_report_service):
        """Le endpoint POST /notes/<id>/reports retourne 201."""
        from dtos.report_dto import ReportDTO

        # Arrange
        note_id = str(uuid4())
        report = ReportDTO(
            id=str(uuid4()),
            target_type=ReportTargetEnum.NOTE,
            note_id=note_id,
            reporter_id=str(uuid4()),
            reason=ReportReasonEnum.SPAM_OR_ABUSE,
            description="Contenu inapproprie",
            status=ReportStatusEnum.PENDING,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        mock_report_service.report_note.return_value = report

        payload = {
            "reason": "spam_or_abuse",
            "description": "Contenu inapproprie"
        }

        # Act
        response = authenticated_client.post(f"/notes/{note_id}/reports", json=payload)

        # Assert
        assert response.status_code == HTTPStatus.CREATED
        body = response.get_json()
        assert body["note_id"] == note_id
        mock_report_service.report_note.assert_called_once()


class TestReportControllerReportCollection:
    """Tests pour POST /collections/<id>/reports"""

    def test_report_collection_returns_201(self, authenticated_client, mock_report_service):
        """Le endpoint POST /collections/<id>/reports retourne 201."""
        from dtos.report_dto import ReportDTO

        # Arrange
        collection_id = str(uuid4())
        report = ReportDTO(
            id=str(uuid4()),
            target_type=ReportTargetEnum.COLLECTION,
            collection_id=collection_id,
            reporter_id=str(uuid4()),
            reason=ReportReasonEnum.SHOCKING_OR_INAPPROPRIATE,
            description="Collection inappropriee",
            status=ReportStatusEnum.PENDING,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        mock_report_service.report_collection.return_value = report

        payload = {
            "reason": "shocking_or_inappropriate",
            "description": "Collection inappropriee"
        }

        # Act
        response = authenticated_client.post(f"/collections/{collection_id}/reports", json=payload)

        # Assert
        assert response.status_code == HTTPStatus.CREATED
        body = response.get_json()
        assert body["collection_id"] == collection_id
        mock_report_service.report_collection.assert_called_once()
