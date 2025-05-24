from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Profile, UserSettings, UserActivity

# Register your models here.
admin.site.register(User, UserAdmin)
admin.site.register(Profile)
admin.site.register(UserSettings)
admin.site.register(UserActivity)