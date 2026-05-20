import os

filepath = 'interfaces/urls.py'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

if "UnassignedIncidentListView" not in content:
    content += """
from .views import UnassignedIncidentListView, IncidentAcceptView
urlpatterns += [
    path('incidents/unassigned/', UnassignedIncidentListView.as_view(), name='unassigned-incidents'),
    path('incidents/<int:pk>/accept/', IncidentAcceptView.as_view(), name='incident-accept'),
]
"""
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        print("urls patched")
