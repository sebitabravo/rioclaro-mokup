from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token

class Command(BaseCommand):
    help = 'Crear token de autenticación para el simulador Arduino'

    def add_arguments(self, parser):
        parser.add_argument(
            '--username',
            type=str,
            default='simulator',
            help='Nombre de usuario para el simulador'
        )
        parser.add_argument(
            '--email',
            type=str,
            default='simulator@rioclaro.com',
            help='Email del usuario simulador'
        )

    def handle(self, *args, **options):
        User = get_user_model()
        username = options['username']
        email = options['email']

        # Crear o obtener usuario
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'email': email,
                'is_staff': False,
                'is_superuser': False
            }
        )

        if created:
            user.set_password('simulator123')
            user.save()
            self.stdout.write(
                self.style.SUCCESS(f'✅ Usuario "{username}" creado exitosamente')
            )
        else:
            self.stdout.write(
                self.style.WARNING(f'⚠️ Usuario "{username}" ya existe')
            )

        # Crear o obtener token
        token, token_created = Token.objects.get_or_create(user=user)

        if token_created:
            self.stdout.write(
                self.style.SUCCESS(f'✅ Token creado exitosamente')
            )
        else:
            self.stdout.write(
                self.style.WARNING(f'⚠️ Token ya existe')
            )

        self.stdout.write('\n' + '='*50)
        self.stdout.write(f'🔑 TOKEN PARA SIMULADOR: {token.key}')
        self.stdout.write('='*50)
        self.stdout.write(f'👤 Usuario: {user.username}')
        self.stdout.write(f'📧 Email: {user.email}')
        self.stdout.write(f'🔐 Password: simulator123')
        self.stdout.write('='*50)
        self.stdout.write('\n💡 Usar este token en el simulador:')
        self.stdout.write(f'   python3 mock_arduino.py --token {token.key}')
