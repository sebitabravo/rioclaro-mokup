from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import EmailValidator


class UserRole(models.TextChoices):
    ADMIN = 'admin', 'Administrador'
    TECHNICIAN = 'technician', 'Técnico'
    OBSERVER = 'observer', 'Observador'


class CustomUser(AbstractUser):
    email = models.EmailField(
        unique=True,
        validators=[EmailValidator()],
        error_messages={
            'unique': 'Ya existe un usuario con este email.',
        }
    )
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.OBSERVER,
        verbose_name='Rol'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    class Meta:
        db_table = 'users'
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
        ordering = ['email']

    def __str__(self):
        return f"{self.get_full_name()} ({self.email}) - {self.get_role_display()}"

    def is_admin(self):
        return self.role == UserRole.ADMIN

    def is_technician(self):
        return self.role == UserRole.TECHNICIAN

    def is_observer(self):
        return self.role == UserRole.OBSERVER