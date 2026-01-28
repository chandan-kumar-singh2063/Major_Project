# apps.py
from django.apps import AppConfig

class AuthenticationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.authentication'

    def ready(self):
        import logging
        logger = logging.getLogger(__name__)
        from allauth.socialaccount.providers.oauth2.client import OAuth2Client

        if not hasattr(OAuth2Client, '_patched_for_scope_delimiter'):
            _original_init = OAuth2Client.__init__

            def _patched_init(self, *args, **kwargs):
                # Determine if scope_delimiter was passed positionally
                import inspect
                sig = inspect.signature(_original_init)
                param_names = list(sig.parameters.keys())
                # Find the index of 'scope_delimiter'
                try:
                    index = param_names.index('scope_delimiter')
                except ValueError:
                    index = None

                # If passed positionally, remove from kwargs to avoid conflict
                if index is not None and len(args) > index:
                    kwargs.pop('scope_delimiter', None)
                else:
                    # If not passed positionally, set default
                    kwargs.setdefault('scope_delimiter', ' ')

                return _original_init(self, *args, **kwargs)

            OAuth2Client.__init__ = _patched_init
            OAuth2Client._patched_for_scope_delimiter = True
            logger.info("OAuth2Client patch applied successfully")
        else:
            logger.info("OAuth2Client already patched")
