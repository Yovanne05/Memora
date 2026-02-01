"""
Tests pour l'ajout de signalement (repository).

La vraie base de données (SQLite in-memory) est utilisée via test_factory.
"""
from uuid import uuid4
from daos.report_dao import Report
from repositorys import report_repository
from utils.enums import ReportStatusEnum, ReportReasonEnum


class TestReportRepositoryAdd:
    """Tests pour ajouter un signalement"""

    def test_add_note_report_success(self, test_factory):
        """Ajouter un signalement de note."""
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
            description="Contenu inapproprié",
            status=ReportStatusEnum.PENDING
        )

        # Act
        result = report_repository.add(report)

        # Assert
        assert result.id is not None
        assert result.note_id == note_id
        assert result.status == ReportStatusEnum.PENDING

    def test_add_collection_report_success(self, test_factory):
        """Ajouter un signalement de collection."""
        # Arrange
        reporter_id = test_factory.create_user(label="reporter")
        owner_id = test_factory.create_user(label="owner")
        collection_id = test_factory.create_collection(owner_id=owner_id)

        report = Report(
            id=str(uuid4()),
            collection_id=collection_id,
            reporter_id=reporter_id,
            reason=ReportReasonEnum.SHOCKING_OR_INAPPROPRIATE,
            description="Collection inappropriée",
            status=ReportStatusEnum.PENDING
        )

        # Act
        result = report_repository.add(report)

        # Assert
        assert result.id is not None
        assert result.collection_id == collection_id
        assert result.status == ReportStatusEnum.PENDING
