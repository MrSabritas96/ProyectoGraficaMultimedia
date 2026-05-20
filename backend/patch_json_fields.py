import os

filepath = 'interfaces/views.py'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# PATCH 1: IncidentReportDetailView
target1 = """                    # Update the pending history item with the real coordinates
                    if isinstance(eq.mantenimientos_previos, list):
                        for m in eq.mantenimientos_previos:
                            if m.get('status') == 'pending':
                                m['position3D'] = [x, y, z]
                                break
                    eq.save()"""

replacement1 = """                    # Update the pending history item with the real coordinates
                    if isinstance(eq.mantenimientos_previos, list):
                        mants = list(eq.mantenimientos_previos)
                        for m in mants:
                            if m.get('status') == 'pending':
                                m['position3D'] = [x, y, z]
                                break
                        eq.mantenimientos_previos = mants
                    eq.save()"""

if target1 in content:
    content = content.replace(target1, replacement1)
    print("Patched IncidentReportDetailView JSON update")

# PATCH 2: WorkOrderFinishView
target2 = """        # Turn off falla_activa and archive in mantenimientos_previos
        equipo = django_order.equipo
        if equipo.falla_activa:
            equipo.falla_activa = False
            if isinstance(equipo.mantenimientos_previos, list):
                # find the pending one
                import datetime
                for m in equipo.mantenimientos_previos:
                    if m.get('status') == 'pending':
                        m['status'] = 'fixed'
                        if 'details' not in m:
                            m['details'] = {}
                        m['details']['fecha_resolucion'] = datetime.date.today().strftime('%d %b %Y')
                        m['details']['aprobado_por'] = request.user.first_name + " " + request.user.last_name
                        m['details']['accion_tomada'] = observaciones or "Mantenimiento completado."
            equipo.save()"""

replacement2 = """        # Turn off falla_activa and archive in mantenimientos_previos
        equipo = django_order.equipo
        if equipo.falla_activa:
            equipo.falla_activa = False
            if isinstance(equipo.mantenimientos_previos, list):
                # find the pending one
                import datetime
                mants = list(equipo.mantenimientos_previos)
                for m in mants:
                    if m.get('status') == 'pending':
                        m['status'] = 'fixed'
                        if 'details' not in m:
                            m['details'] = {}
                        m['details']['fecha_resolucion'] = datetime.date.today().strftime('%d %b %Y')
                        m['details']['aprobado_por'] = request.user.first_name + " " + request.user.last_name
                        m['details']['accion_tomada'] = observaciones or "Mantenimiento completado."
                equipo.mantenimientos_previos = mants
            equipo.save()"""

if target2 in content:
    content = content.replace(target2, replacement2)
    print("Patched WorkOrderFinishView JSON update")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
