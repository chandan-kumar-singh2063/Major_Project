# apps/authentication/adapters.py
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from allauth.socialaccount.models import SocialApp
from django.core.exceptions import MultipleObjectsReturned
from django.contrib.sites.shortcuts import get_current_site

class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    """
    Custom adapter to handle cases where multiple SocialApplication entries exist.
    This fixes the MultipleObjectsReturned error when multiple Google OAuth apps are configured.
    """
    
    def get_app(self, request, provider, client_id=None):
        """
        Override to handle MultipleObjectsReturned exception.
        If multiple apps exist, return the first one that matches the current site.
        """
        try:
            return super().get_app(request, provider, client_id)
        except MultipleObjectsReturned:
            # If multiple apps exist, get the first one that matches
            # Filter by provider and optionally by client_id
            apps = SocialApp.objects.filter(provider=provider)
            
            # Filter by client_id if provided
            if client_id:
                apps = apps.filter(client_id=client_id)
            
            # Try to filter by current site first
            try:
                site = get_current_site(request)
                site_apps = apps.filter(sites=site)
                if site_apps.exists():
                    app = site_apps.first()
                    if app:
                        return app
            except Exception:
                # If site filtering fails, continue with all apps
                pass
            
            # If no site-specific app found, return the first app
            app = apps.first()
            if app:
                return app
            
            # If no app found, raise the original exception
            raise
