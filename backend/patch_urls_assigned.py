import os

filepath = 'interfaces/urls.py'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

if "MyAssignedIncidentListView" not in content:
    content = content.replace("from .views import UnassignedIncidentListView, IncidentAcceptView", "from .views import UnassignedIncidentListView, IncidentAcceptView, MyAssignedIncidentListView")
    
    # Insert new url
    import re
    content = re.sub(
        r"path\('incidents/unassigned/', UnassignedIncidentListView\.as_view\(\), name='unassigned-incidents'\),",
        r"path('incidents/unassigned/', UnassignedIncidentListView.as_view(), name='unassigned-incidents'),\n    path('incidents/assigned/', MyAssignedIncidentListView.as_view(), name='assigned-incidents'),",
        content
    )
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("urls.py patched with assigned endpoint")
