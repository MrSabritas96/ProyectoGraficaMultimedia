from django.urls import path
from .views import LoginView

urlpatterns = [
    path('auth/login/', LoginView.as_view(), name='login'),
]

from .views import WorkOrderView
urlpatterns += [
    path('work-orders/', WorkOrderView.as_view(), name='work-orders'),
]

from .views import WorkOrderStartView, WorkOrderFinishView
urlpatterns += [
    path('work-orders/<int:pk>/start/', WorkOrderStartView.as_view(), name='work-order-start'),
    path('work-orders/<int:pk>/finish/', WorkOrderFinishView.as_view(), name='work-order-finish'),
]

from .views import EquipmentView
urlpatterns += [
    path('equipment/', EquipmentView.as_view(), name='equipment'),
]

from .views import EntityHistoryView
urlpatterns += [
    path('history/<str:entity_type>/<int:entity_id>/', EntityHistoryView.as_view(), name='entity-history'),
]

from .views import ReportStatusView, ReportRepairTimeView, ReportTopFailuresView, ReportEngineerPerformanceView
urlpatterns += [
    path('reports/orders-by-status/', ReportStatusView.as_view(), name='report-status'),
    path('reports/average-repair-time/', ReportRepairTimeView.as_view(), name='report-repair-time'),
    path('reports/top-failing-equipment/', ReportTopFailuresView.as_view(), name='report-top-failures'),
    path('reports/engineer-performance/', ReportEngineerPerformanceView.as_view(), name='report-engineer-performance'),
]

from .views import NotificationView
urlpatterns += [
    path('notifications/', NotificationView.as_view(), name='notifications'),
    path('notifications/<int:pk>/read/', NotificationView.as_view(), name='notification-read'),
]
