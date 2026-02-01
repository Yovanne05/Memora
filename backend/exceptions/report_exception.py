from werkzeug.exceptions import Forbidden, NotFound, UnprocessableEntity


class ReportNotFound(NotFound):
    def __init__(self, description: str = "Report not found."):
        super().__init__(description=description)


class ReportForbidden(Forbidden):
    def __init__(self, description: str = "You are not allowed to perform this action."):
        super().__init__(description=description)


class ReportInvalidTarget(UnprocessableEntity):
    def __init__(self, description: str = "A report must target either a note or a collection."):
        super().__init__(description=description)


class ReportTargetActionForbidden(UnprocessableEntity):
    def __init__(self, description: str = "This report is not linked to a deletable resource."):
        super().__init__(description=description)
