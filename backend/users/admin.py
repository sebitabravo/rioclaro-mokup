from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ['email', 'username', 'first_name', 'last_name', 'role', 'is_active', 'created_at']
    list_filter = ['role', 'is_active', 'is_staff', 'created_at']
    search_fields = ['email', 'username', 'first_name', 'last_name']
    ordering = ['email']
    readonly_fields = ['created_at', 'updated_at']

    fieldsets = UserAdmin.fieldsets + (
        ('Información Adicional', {
            'fields': ('role', 'created_at', 'updated_at')
        }),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Información Adicional', {
            'fields': ('email', 'first_name', 'last_name', 'role')
        }),
    )