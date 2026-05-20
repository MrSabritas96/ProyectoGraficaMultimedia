import os

filepath = 'interfaces/views.py'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

target_put_logic = """            reporte = request.data.get('reporte_preliminar_ingeniero')
            if reporte:
                incidente.reporte_preliminar_ingeniero = reporte
                incidente.estado = 'Inspeccionado'
                from django.utils import timezone
                incidente.fecha_inspeccion = timezone.now()
                incidente.save()"""

replacement_put_logic = """            reporte = request.data.get('reporte_preliminar_ingeniero')
            if reporte:
                incidente.reporte_preliminar_ingeniero = reporte
                incidente.estado = 'Inspeccionado'
                from django.utils import timezone
                incidente.fecha_inspeccion = timezone.now()
                incidente.save()
                
                # Actualizar el equipo con el punto rojo
                x = request.data.get('x', 0)
                y = request.data.get('y', 0)
                z = request.data.get('z', 0)
                if x != 0 or y != 0 or z != 0:
                    eq = incidente.equipo
                    eq.falla_activa = True
                    eq.falla_coordenada_x = x
                    eq.falla_coordenada_y = y
                    eq.falla_coordenada_z = z
                    eq.falla_descripcion = reporte
                    eq.save()"""

if "eq = incidente.equipo" not in content:
    content = content.replace(target_put_logic, replacement_put_logic)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("views.py patched with Equipment update logic")
else:
    print("Already patched")
