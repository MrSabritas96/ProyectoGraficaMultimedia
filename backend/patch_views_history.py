import os
import re

filepath = 'interfaces/views.py'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# PATCH 1: IncidentReportDetailView (updating mantenimientos_previos position3D)
target1 = """                    eq.falla_coordenada_z = z
                    eq.falla_descripcion = reporte
                    eq.save()"""

replacement1 = """                    eq.falla_coordenada_z = z
                    eq.falla_descripcion = reporte
                    
                    # Update the pending history item with the real coordinates
                    if isinstance(eq.mantenimientos_previos, list):
                        for m in eq.mantenimientos_previos:
                            if m.get('status') == 'pending':
                                m['position3D'] = [x, y, z]
                                break
                    eq.save()"""

if target1 in content:
    content = content.replace(target1, replacement1)
    print("Patched IncidentReportDetailView")

# PATCH 2: WorkOrderStartView (updating IncidentReport status)
target2 = """        order.estado = OrderStatus.EN_PROCESO
        order.fecha_inicio = datetime.now()
        saved = self.work_order_repository.save(order)"""

replacement2 = """        order.estado = OrderStatus.EN_PROCESO
        order.fecha_inicio = datetime.now()
        saved = self.work_order_repository.save(order)
        
        # Update IncidentReport status if linked
        from infrastructure.models import IncidentReport as DjangoIncidentModel
        incident = DjangoIncidentModel.objects.filter(orden_trabajo_relacionada__id=order.id).first()
        if incident:
            incident.estado = 'En Progreso'
            incident.save()"""

if target2 in content:
    content = content.replace(target2, replacement2)
    print("Patched WorkOrderStartView")

# PATCH 3: WorkOrderFinishView (updating IncidentReport status to Resuelto)
target3 = """            equipo.save()
            
        return Response({'status': order.estado.value}, status=status.HTTP_200_OK)"""

replacement3 = """            equipo.save()
            
        # Update IncidentReport status to Resuelto
        from infrastructure.models import IncidentReport as DjangoIncidentModel
        incident = DjangoIncidentModel.objects.filter(orden_trabajo_relacionada__id=order.id).first()
        if incident:
            incident.estado = 'Resuelto'
            incident.save()
            
        return Response({'status': order.estado.value}, status=status.HTTP_200_OK)"""

if target3 in content:
    content = content.replace(target3, replacement3)
    print("Patched WorkOrderFinishView")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
