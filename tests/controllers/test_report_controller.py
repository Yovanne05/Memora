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
import pytest
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
            description="Contenu inapproprié",
            status=ReportStatusEnum.PENDING,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        mock_report_service.report_note.return_value = report

        payload = {
            "reason": "spam_or_abuse",
            "description": "Contenu inapproprié"
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
            description="Collection inappropriée",
            status=ReportStatusEnum.PENDING,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        mock_report_service.report_collection.return_value = report

        payload = {
            "reason": "shocking_or_inappropriate",
            "description": "Collection inappropriée"
        }

        # Act
        response = authenticated_client.post(f"/collections/{collection_id}/reports", json=payload)

        # Assert
        assert response.status_code == HTTPStatus.CREATED
        body = response.get_json()
        assert body["collection_id"] == collection_id
        mock_report_service.report_collection.assert_called_once()


class TestReportControllerList:
    """Tests pour GET /reports"""

    def test_list_reports_returns_200(self, authenticated_client, mock_report_service):
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
        response = authenticated_client.get("/reports")

        # Assert
        assert response.status_code == HTTPStatus.OK
        body = response.get_json()
        assert "items" in body
        assert "total" in body
        assert body["total"] == 1


class TestReportControllerGet:
    """Tests pour GET /reports/<id>"""

    def test_get_report_returns_200(self, authenticated_client, mock_report_service):
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
        response = authenticated_client.get(f"/reports/{report_id}")

        # Assert
        assert response.status_code == HTTPStatus.OK
        body = response.get_json()
        assert body["id"] == report_id
        mock_report_service.find_one.assert_called_once_with(report_id)


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
