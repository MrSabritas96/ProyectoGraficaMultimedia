with open('interfaces/urls.py', 'a', encoding='utf-8') as f:
    f.write('''
from .views import IncidentReportView, IncidentReportDetailView, EngineerAvailabilityView
urlpatterns += [
    path('incidents/', IncidentReportView.as_view(), name='incidents'),
    path('incidents/<int:pk>/', IncidentReportDetailView.as_view(), name='incident-detail'),
    path('engineers/availability/', EngineerAvailabilityView.as_view(), name='engineer-availability'),
]
''')
