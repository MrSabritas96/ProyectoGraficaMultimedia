import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger('application')

def custom_exception_handler(exc, context):
    # Call standard DRF exception handler first to get the standard error response.
    response = exception_handler(exc, context)

    if response is None:
        # This means an unhandled exception occurred (like a DB error or 500)
        logger.error(f"Unhandled Exception: {str(exc)}", exc_info=True)
        
        return Response({
            'error': 'Ha ocurrido un error interno en el servidor.',
            'detail': 'Nuestro equipo técnico ha sido notificado.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Log identified exceptions (400, 401, 403, etc)
    logger.warning(f"Request Error: {context['view'].__class__.__name__} - {response.status_code} - {str(exc)}")
    
    return response
