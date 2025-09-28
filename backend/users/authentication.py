from django.contrib.auth.backends import BaseBackend
from django.contrib.auth import get_user_model
from django.db.models import Q

User = get_user_model()


class EmailOrUsernameBackend(BaseBackend):
    """
    Authentication backend que permite iniciar sesión con email o username.
    """

    def authenticate(self, request, username=None, password=None, **kwargs):
        if not username or not password:
            return None

        try:
            # Intentar buscar el usuario por email o username
            user = User.objects.get(
                Q(email=username) | Q(username=username)
            )

            # Verificar la contraseña
            if user.check_password(password) and user.is_active:
                return user
        except User.DoesNotExist:
            # Devolver None si el usuario no existe
            return None
        except User.MultipleObjectsReturned:
            # Si hay múltiples usuarios, usar el primer resultado por email
            user = User.objects.filter(
                Q(email=username) | Q(username=username)
            ).first()

            if user and user.check_password(password) and user.is_active:
                return user

        return None

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None