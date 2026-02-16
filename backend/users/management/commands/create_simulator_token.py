import secrets

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
            default='simulator@example.invalid',
            help='Email del usuario simulador'
        )
        parser.add_argument(
            '--password',
            type=str,
            default='',
            help='Password opcional para el usuario simulador'
        )

    def handle(self, *args, **options):
        User = get_user_model()
        username = options['username']
        email = options['email']
        input_password = options['password']

        # Crear o obtener usuario
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'email': email,
                'is_staff': False,
                'is_superuser': False
            }
        )

        generated_password = ''
        password_updated = False

        if created:
            password = input_password or secrets.token_urlsafe(16)
            user.set_password(password)
            user.save()
            generated_password = password if not input_password else ''
            self.stdout.write(
                self.style.SUCCESS(f'✅ Usuario "{username}" creado exitosamente')
            )
        else:
            self.stdout.write(
                self.style.WARNING(f'⚠️ Usuario "{username}" ya existe')
            )
            if input_password:
                user.set_password(input_password)
                user.save()
                password_updated = True
                self.stdout.write(
                    self.style.SUCCESS('✅ Password del usuario actualizado')
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
        if generated_password:
            self.stdout.write(f'🔐 Password temporal generado: {generated_password}')
            self.stdout.write('⚠️ Guarda este password y cámbialo después del primer uso.')
        elif password_updated:
            self.stdout.write('🔐 Password actualizado desde el argumento --password.')
        self.stdout.write('='*50)
        self.stdout.write('\n💡 Usar este token en el simulador:')
        self.stdout.write(f'   python3 mock_arduino.py --token {token.key}')
