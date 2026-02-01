"""
Tests pour la mise à jour de signalement (repository).

La vraie base de données (SQLite in-memory) est utilisée via test_factory.
"""
from uuid import uuid4
from daos.report_dao import Report
from repositorys import report_repository
from utils.enums import ReportStatusEnum, ReportReasonEnum


class TestReportRepositoryUpdate:
    """Tests pour mettre à jour un signalement"""

    def test_update_report_success(self, test_factory):
        """Mettre à jour le statut d'un signalement."""
        # Arrange
        reporter_id = test_factory.create_user(label="reporter")
        owner_id = test_factory.create_user(label="owner")
        collection_id = test_factory.create_collection(owner_id=owner_id)
        note_id = test_factory.create_note(owner_id=owner_id, collection_id=collection_id)

        report = Report(
            id=str(uuid4()),
            note_id=note_id,
            reporter_id=reporter_id,
            reason=ReportReasonEnum.SPAM_OR_ABUSE,
            description="Test",
            status=ReportStatusEnum.PENDING
        )
        added = report_repository.add(report)

        # Act
        added.status = ReportStatusEnum.RESOLVED
        result = report_repository.update(added)

        # Assert
        assert result.status == ReportStatusEnum.RESOLVED

        # Verify in DB
        found = report_repository.find_one(added.id)
        assert found.status == ReportStatusEnum.RESOLVED
