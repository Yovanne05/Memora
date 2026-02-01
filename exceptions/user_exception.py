from werkzeug.exceptions import Conflict, NotFound, Forbidden


class UserNotFound(NotFound):
    def __init__(self, description: str = "Utilisateur introuvable."):
        super().__init__(description=description)


class UserEmailConflict(Conflict):
    def __init__(
        self, description: str = "Cette adresse e-mail est déjà utilisée."
    ):
        super().__init__(description=description)


class UserUsernameConflict(Conflict):
    def __init__(
        self, description: str = "Ce nom d'utilisateur est déjà pris."
    ):
        super().__init__(description=description)


class UserPermissionDenied(Forbidden):
    def __init__(self, description: str = "Non autorise."):
        super().__init__(description=description)
