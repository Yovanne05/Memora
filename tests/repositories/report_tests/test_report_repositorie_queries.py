"""
Tests pour le repository report (accès base de données).

Ces tests vérifient :
- Ajouter un signalement
- Récupérer un signalement par ID
- Lister les signalements
- Mettre à jour un signalement

La vraie base de données (SQLite in-memory) est utilisée via test_factory.
"""
from uuid import uuid4
from daos.report_dao import Report
from repositorys import report_repository
from utils.enums import ReportStatusEnum, ReportReasonEnum


class TestReportRepositoryFind:
    """Tests pour récupérer un signalement"""

    def test_find_one_by_id(self, test_factory):
        """Récupérer un signalement par ID."""
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
        result = report_repository.find_one(added.id)

        # Assert
        assert result is not None
        assert result.id == added.id
        assert result.reason == ReportReasonEnum.SPAM_OR_ABUSE


class TestReportRepositoryList:
    """Tests pour lister les signalements"""

    def test_find_many_returns_all_reports(self, test_factory):
        """Lister tous les signalements."""
        from repositorys.report_repository import ReportSearchParams

        # Arrange
        reporter_id = test_factory.create_user(label="reporter")
        owner_id = test_factory.create_user(label="owner")
        collection_id = test_factory.create_collection(owner_id=owner_id)
        note_id = test_factory.create_note(owner_id=owner_id, collection_id=collection_id)

        report1 = Report(
            id=str(uuid4()),
            note_id=note_id,
            reporter_id=reporter_id,
            reason=ReportReasonEnum.SPAM_OR_ABUSE,
            description="Test 1",
            status=ReportStatusEnum.PENDING
        )
        report2 = Report(
            id=str(uuid4()),
            collection_id=collection_id,
            reporter_id=reporter_id,
            reason=ReportReasonEnum.SHOCKING_OR_INAPPROPRIATE,
            description="Test 2",
            status=ReportStatusEnum.PENDING
        )
        report_repository.add(report1)
        report_repository.add(report2)

        params = ReportSearchParams()

        # Act
        reports, total = report_repository.find_many(params)

        # Assert
        assert total == 2
        assert len(reports) == 2
