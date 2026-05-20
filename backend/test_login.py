import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from interfaces.views import LoginView
from rest_framework.test import APIRequestFactory
from rest_framework import status

factory = APIRequestFactory()
view = LoginView.as_view()

data = {
    "email": "admin@gmail.com",
    "unique_code": "ADM001",
    "password": "password123"
}

request = factory.post('/api/auth/login/', data, format='json')
response = view(request)

print(f"Status Code: {response.status_code}")
print(f"Response Data: {response.data}")

if response.status_code == 200:
    print("LOGIN SUCCESSFUL!")
else:
    print("LOGIN FAILED.")
