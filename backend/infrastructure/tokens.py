from domain.ports import TokenService
from domain.entities import User
from rest_framework_simplejwt.tokens import RefreshToken
from .models import CustomUser

class JWTTokenService(TokenService):
    def generate_token(self, user: User) -> str:
        django_user = CustomUser.objects.get(id=user.id)
        refresh = RefreshToken.for_user(django_user)
        
        # Custom payload
        refresh['role'] = user.role.name.value if user.role else None
        
        return str(refresh.access_token)
