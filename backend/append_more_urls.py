with open('interfaces/urls.py', 'a', encoding='utf-8') as f:
    f.write('''
from .views import LogoutView, ToggleAvailabilityView
urlpatterns += [
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('users/me/availability/', ToggleAvailabilityView.as_view(), name='toggle-availability'),
]
''')
