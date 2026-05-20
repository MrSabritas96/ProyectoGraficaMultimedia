import os

filepath = 'interfaces/views.py'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

target = """        # 1. Actualizar el equipo con el punto rojo
        equipo.falla_activa = True
        equipo.falla_coordenada_x = x
        equipo.falla_coordenada_y = y
        equipo.falla_coordenada_z = z
        equipo.falla_descripcion = desc
        equipo.save()"""

replacement = """        # 1. Actualizar el equipo con el punto rojo
        equipo.falla_activa = True
        equipo.falla_coordenada_x = x
        equipo.falla_coordenada_y = y
        equipo.falla_coordenada_z = z
        equipo.falla_descripcion = desc
        
        # Inyectar el incidente pendiente al historial
        import random
        nuevo_incidente = {
            "id": random.randint(1000, 9999),
            "position3D": [x, y, z],
            "title": "Falla Directa",
            "status": "pending",
        }
        mants = list(equipo.mantenimientos_previos) if isinstance(equipo.mantenimientos_previos, list) else []
        mants.append(nuevo_incidente)
        equipo.mantenimientos_previos = mants
        equipo.save()"""

if target in content:
    content = content.replace(target, replacement)
    print("Patched DirectReportView successfully.")
else:
    print("Target not found.")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
