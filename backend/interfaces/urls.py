from django.urls import path
from .views import LoginView, EngineerListView, DoctorListView, UserProfileView

urlpatterns = [
    path('auth/login/', LoginView.as_view(), name='login'),
    path('users/me/', UserProfileView.as_view(), name='user-profile'),
    path('engineers/', EngineerListView.as_view(), name='engineers'),
    path('doctors/', DoctorListView.as_view(), name='doctors'),
]

from .views import WorkOrderView, WorkOrderDetailView
urlpatterns += [
    path('work-orders/', WorkOrderView.as_view(), name='work-orders'),
    path('work-orders/<int:pk>/', WorkOrderDetailView.as_view(), name='work-order-detail'),
]

from .views import WorkOrderStartView, WorkOrderFinishView, WorkOrderAddLogView
urlpatterns += [
    path('work-orders/<int:pk>/start/', WorkOrderStartView.as_view(), name='work-order-start'),
    path('work-orders/<int:pk>/finish/', WorkOrderFinishView.as_view(), name='work-order-finish'),
    path('work-orders/<int:pk>/log/', WorkOrderAddLogView.as_view(), name='work-order-log'),
]

from .views import EquipmentView, EquipmentDetailView, ReportFaultView, DirectReportView
urlpatterns += [
    path('equipment/', EquipmentView.as_view(), name='equipment'),
    path('equipment/<int:pk>/', EquipmentDetailView.as_view(), name='equipment-detail'),
    path('equipment/<int:pk>/report-fault/', ReportFaultView.as_view(), name='equipment-report-fault'),
    path('equipment/<int:pk>/direct-report/', DirectReportView.as_view(), name='equipment-direct-report'),
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

from .views import UserAdminListCreateView, UserAdminDetailView, RoleAdminListView, RoleAdminDetailView
urlpatterns += [
    path('admin/users/', UserAdminListCreateView.as_view(), name='admin-users'),
    path('admin/users/<int:pk>/', UserAdminDetailView.as_view(), name='admin-user-detail'),
    path('admin/roles/', RoleAdminListView.as_view(), name='admin-roles'),
    path('admin/roles/<int:pk>/', RoleAdminDetailView.as_view(), name='admin-role-detail'),
]

from .views import IncidentReportView, IncidentReportDetailView, EngineerAvailabilityView
urlpatterns += [
    path('incidents/', IncidentReportView.as_view(), name='incidents'),
    path('incidents/<int:pk>/', IncidentReportDetailView.as_view(), name='incident-detail'),
    path('engineers/availability/', EngineerAvailabilityView.as_view(), name='engineer-availability'),
]

from .views import LogoutView, ToggleAvailabilityView
urlpatterns += [
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('users/me/availability/', ToggleAvailabilityView.as_view(), name='toggle-availability'),
]

from .views import DirectReportView, UnassignedIncidentListView, IncidentAcceptView, MyAssignedIncidentListView
urlpatterns += [
    path('incidents/unassigned/', UnassignedIncidentListView.as_view(), name='unassigned-incidents'),
    path('incidents/assigned/', MyAssignedIncidentListView.as_view(), name='assigned-incidents'),
    path('incidents/<int:pk>/accept/', IncidentAcceptView.as_view(), name='incident-accept'),
]

from .views import TQAAutomationView
urlpatterns += [
    path('admin/tqa/automation/', TQAAutomationView.as_view(), name='admin-tqa-automation'),
]
