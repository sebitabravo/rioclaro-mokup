from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser
from .models_activity import ActivityLog


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


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'action_type', 'entity_type', 'severity', 'timestamp']
    list_filter = ['action_type', 'entity_type', 'severity', 'timestamp']
    search_fields = ['user__email', 'description', 'entity_id']
    readonly_fields = ['timestamp', 'created_at']
    date_hierarchy = 'timestamp'

    fieldsets = (
        ('Información Principal', {
            'fields': ('user', 'action_type', 'entity_type', 'entity_id', 'severity')
        }),
        ('Detalles', {
            'fields': ('description', 'details')
        }),
        ('Metadata', {
            'fields': ('ip_address', 'user_agent')
        }),
        ('Fechas', {
            'fields': ('timestamp', 'created_at'),
            'classes': ('collapse',)
        }),
    )