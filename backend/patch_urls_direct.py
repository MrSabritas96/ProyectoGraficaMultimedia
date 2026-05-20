import os
import re

filepath = 'interfaces/urls.py'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

if "DirectReportView" not in content:
    content = content.replace("from .views import UnassignedIncidentListView", "from .views import DirectReportView, UnassignedIncidentListView")
    content = re.sub(
        r"path\('equipment/<int:pk>/report-fault/', ReportFaultView\.as_view\(\), name='equipment-report-fault'\),",
        r"path('equipment/<int:pk>/report-fault/', ReportFaultView.as_view(), name='equipment-report-fault'),\n    path('equipment/<int:pk>/direct-report/', DirectReportView.as_view(), name='equipment-direct-report'),",
        content
    )
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("urls.py patched with DirectReportView")
