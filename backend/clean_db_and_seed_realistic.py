import os
import django
import random
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from infrastructure.models import Role, CustomUser, MedicalEquipment, WorkOrder, Notification, IncidentReport, EngineerAvailability

def run():
    print("Iniciando limpieza y siembra de base de datos realista...")

    # 1. Asegurar roles
    roles_list = ['Administrador', 'Jefe de Unidad', 'Secretario', 'Ingeniero Electrónico', 'Doctor']
    roles_db = {}
    for rname in roles_list:
        role, _ = Role.objects.get_or_create(name=rname)
        roles_db[rname] = role

    # Asegurar rol de Ingeniero Electrónico / Electronico para evitar incompatibilidades
    role_ing_alt = Role.objects.filter(name__icontains='Ingeniero').first()
    if not role_ing_alt:
        role_ing_alt = Role.objects.create(name='Ingeniero Electrónico')
    roles_db['Ingeniero Electrónico'] = role_ing_alt

    # 2. Limpieza de tablas conflictivas
    Notification.objects.all().delete()
    WorkOrder.objects.all().delete()
    IncidentReport.objects.all().delete()
    print("Tablas de Notificaciones, Órdenes de Trabajo e Incidentes limpiadas.")

    # 3. Asegurar usuarios principales
    users_data = [
        {
            'email': 'admin@gmail.com',
            'codigo_unico': 'ADM-00001',
            'role': roles_db['Administrador'],
            'first_name': 'Admin',
            'last_name': 'Sistema',
            'is_staff': True,
            'is_superuser': True,
            'ci': '1234567 LP',
            'cellphone': '70000000',
        },
        {
            'email': 'jefe@gmail.com',
            'codigo_unico': 'JEF-001',
            'role': roles_db['Jefe de Unidad'],
            'first_name': 'Carlos',
            'last_name': 'Vargas',
            'is_staff': False,
            'ci': '5432123 LP',
            'cellphone': '76543210',
        },
        {
            'email': 'ingeniero@gmail.com',
            'codigo_unico': 'ING-001',
            'role': roles_db['Ingeniero Electrónico'],
            'first_name': 'Miguel',
            'last_name': 'Choque',
            'is_staff': False,
            'ci': '7654321 LP',
            'cellphone': '71111111',
        },
        {
            'email': 'secretario@gmail.com',
            'codigo_unico': 'SEC-00044',
            'role': roles_db['Secretario'],
            'first_name': 'Ana',
            'last_name': 'Lopez',
            'is_staff': False,
            'ci': '8765432 LP',
            'cellphone': '72222222',
        },
        {
            'email': 'fguzman@gmail.com',
            'codigo_unico': 'DOC-00034',
            'role': roles_db['Doctor'],
            'first_name': 'Fernando',
            'last_name': 'Guzman',
            'is_staff': False,
            'ci': '9876543 LP',
            'cellphone': '73333333',
            'especialidades': [{"nombre": "IMAGENOLOGIA", "descripcion": "Área de Imagenología Médica"}]
        }
    ]

    users_db = {}
    for udata in users_data:
        email = udata['email']
        user = CustomUser.objects.filter(email=email).first()
        if not user:
            user = CustomUser.objects.create_user(
                email=email,
                codigo_unico=udata['codigo_unico'],
                password='Hospital123*'
            )
        user.role = udata['role']
        user.first_name = udata['first_name']
        user.last_name = udata['last_name']
        user.is_staff = udata.get('is_staff', False)
        user.is_superuser = udata.get('is_superuser', False)
        user.is_active = True
        user.photo = 'profiles/default.png'
        if 'ci' in udata:
            user.ci = udata['ci']
        if 'cellphone' in udata:
            user.cellphone = udata['cellphone']
        if 'especialidades' in udata:
            user.especialidades = udata['especialidades']
        user.save()
        user.set_password('Hospital123*')
        user.save()
        users_db[email] = user
        print(f"Usuario verificado/creado: {email} ({user.role.name})")

    # 4. Asegurar que todos los demás usuarios tengan la foto por defecto, CI y teléfono si les falta
    for u in CustomUser.objects.all():
        u.photo = 'profiles/default.png'
        u.is_active = True
        if not u.ci:
            u.ci = f"{random.randint(4000000, 15000000)} LP"
        if not u.cellphone:
            u.cellphone = f"{random.randint(60000000, 79999999)}"
        u.save()

    # 5. Asignar áreas a todos los doctores
    doctores_list = CustomUser.objects.filter(role__name='Doctor')
    areas_disponibles = ['IMAGENOLOGIA', 'CARDIOLOGIA', 'TERAPIA INTENSIVA', 'QUIROFANO', 'EMERGENCIAS', 'LABORATORIO']
    for idx, doc in enumerate(doctores_list):
        if doc.email == 'fguzman@gmail.com':
            doc.especialidades = [{"nombre": "IMAGENOLOGIA", "descripcion": "Área de Imagenología Médica"}]
        else:
            area = areas_disponibles[idx % len(areas_disponibles)]
            doc.especialidades = [{"nombre": area, "descripcion": f"Área de {area}"}]
        doc.save()

    # 6. Obtener algunos equipos médicos
    equipos = list(MedicalEquipment.objects.all())
    if len(equipos) < 5:
        print("ADVERTENCIA: Hay menos de 5 equipos médicos en el sistema. Asegúrate de correr seed_equipments.py primero.")
        return

    # Buscar equipos específicos por área
    equipo_imagenologia = next((e for e in equipos if e.area == 'IMAGENOLOGIA'), equipos[0])
    equipo_terapia = next((e for e in equipos if e.area == 'TERAPIA INTENSIVA'), equipos[1 % len(equipos)])
    equipo_urgencias = next((e for e in equipos if e.area in ['URGENCIAS', 'EMERGENCIAS']), equipos[2 % len(equipos)])
    equipo_laboratorio = next((e for e in equipos if e.area == 'LABORATORIO'), equipos[3 % len(equipos)])

    # 7. Crear Órdenes de Trabajo realistas para el Ingeniero Demo (Miguel Choque - ING-001)
    ing_demo = users_db['ingeniero@gmail.com']
    jefe = users_db['jefe@gmail.com']

    # Orden Finalizada 1
    wo1 = WorkOrder.objects.create(
        equipo=equipo_imagenologia,
        tipo_mantenimiento='Preventivo',
        estado='Finalizado',
        descripcion='Mantenimiento semestral preventivo y calibración del tomógrafo.',
        observaciones_tecnicas='Se realizó desensamble de la carcasa, limpieza de conductos de aire de ventilación y calibración de bobinas de RF.',
        creado_por=jefe,
        ingeniero_asignado=ing_demo,
        fecha_creacion=timezone.now() - timezone.timedelta(days=10),
        fecha_inicio=timezone.now() - timezone.timedelta(days=9, hours=2),
        fecha_fin=timezone.now() - timezone.timedelta(days=9),
        costo_reparacion=120.00,
        repuestos_usados=[{"nombre": "Filtro de Aire", "cantidad": 2, "costo": 60.00}],
        repuestos_disponibles=True,
        problema_real_encontrado='Filtros obstruidos por polvo, lo que aumentaba ligeramente la temperatura de operación.',
        acciones_realizadas='Reemplazo de filtros de entrada y recalibración de sistemas de enfriamiento.',
        recomendaciones='Limpieza externa del tomógrafo semanalmente.'
    )

    # Orden Finalizada 2
    wo2 = WorkOrder.objects.create(
        equipo=equipo_terapia,
        tipo_mantenimiento='Correctivo',
        estado='Finalizado',
        descripcion='Falla en módulo de sensores de flujo del ventilador.',
        observaciones_tecnicas='Se detectó lectura errónea en sensor de oxígeno. Se reemplazó el sensor de celda O2 por uno nuevo.',
        creado_por=jefe,
        ingeniero_asignado=ing_demo,
        fecha_creacion=timezone.now() - timezone.timedelta(days=5),
        fecha_inicio=timezone.now() - timezone.timedelta(days=4, hours=4),
        fecha_fin=timezone.now() - timezone.timedelta(days=4),
        costo_reparacion=280.00,
        repuestos_usados=[{"nombre": "Celda de Oxígeno O2", "cantidad": 1, "costo": 280.00}],
        repuestos_disponibles=True,
        problema_real_encontrado='Celda de oxígeno agotada debido al tiempo de uso continuo en UCI.',
        acciones_realizadas='Sustitución de celda y calibración a 21% y 100% de oxígeno.',
        recomendaciones='Verificar niveles de celda en cada mantenimiento de rutina.'
    )

    # Orden En Proceso 3
    wo3 = WorkOrder.objects.create(
        equipo=equipo_urgencias,
        tipo_mantenimiento='Correctivo',
        estado='En Proceso',
        descripcion='Monitor de signos vitales no enciende, se apaga aleatoriamente al mover el cable.',
        creado_por=jefe,
        ingeniero_asignado=ing_demo,
        fecha_creacion=timezone.now() - timezone.timedelta(days=1),
        fecha_inicio=timezone.now() - timezone.timedelta(hours=4),
        coordenada_3d_x=0.5,
        coordenada_3d_y=1.2,
        coordenada_3d_z=-0.2
    )

    # 8. Crear órdenes de trabajo para otros ingenieros en el sistema
    ingenieros_adicionales = list(CustomUser.objects.filter(role__name__icontains='Ingeniero').exclude(email='ingeniero@gmail.com'))
    
    if ingenieros_adicionales:
        # Sembrar 2 órdenes finalizadas y 2 pendientes distribuidas
        for i, ing in enumerate(ingenieros_adicionales[:4]):
            eq_target = equipos[(i + 4) % len(equipos)]
            status_order = 'Finalizado' if i < 2 else 'Pendiente'
            ing_assigned = ing if status_order == 'Finalizado' else None
            
            wo_other = WorkOrder.objects.create(
                equipo=eq_target,
                tipo_mantenimiento='Preventivo',
                estado=status_order,
                descripcion=f'Revisión y mantenimiento preventivo periódico del equipo.',
                creado_por=jefe,
                ingeniero_asignado=ing_assigned,
                fecha_creacion=timezone.now() - timezone.timedelta(days=3),
                observaciones_tecnicas='Limpieza externa e interna general y verificación de encendido.' if status_order == 'Finalizado' else None,
                fecha_inicio=timezone.now() - timezone.timedelta(days=2) if status_order == 'Finalizado' else None,
                fecha_fin=timezone.now() - timezone.timedelta(days=1) if status_order == 'Finalizado' else None
            )
            print(f"Creada orden {status_order} para equipo {eq_target.nombre} (Ingeniero: {ing.email if ing_assigned else 'Sin Asignar'})")

    # 9. Notificaciones realistas (pocos registros para evitar saturación)
    # Notificaciones para el Jefe
    Notification.objects.create(
        usuario=jefe,
        titulo="Mantenimiento Finalizado: Tomógrafo",
        mensaje="El Ing. Miguel Choque ha finalizado con éxito la orden del tomógrafo de Imagenología.",
        leida=False,
        enlace_destino="/dashboard/reports"
    )
    Notification.objects.create(
        usuario=jefe,
        titulo="Celda de Oxígeno Reemplazada",
        mensaje="Se cerró la orden de trabajo para el Ventilador Hamilton. Operando normalmente.",
        leida=False,
        enlace_destino="/dashboard/reports"
    )

    # Notificaciones para el Ingeniero Demo
    Notification.objects.create(
        usuario=ing_demo,
        titulo="Nueva Orden Asignada",
        mensaje="Se le ha asignado la Orden de Trabajo de Emergencia para el Monitor de Signos Vitales de Urgencias.",
        leida=False,
        enlace_destino="/dashboard/work-orders"
    )

    # Notificaciones para el Doctor Fernando Guzman
    Notification.objects.create(
        usuario=users_db['fguzman@gmail.com'],
        titulo="Equipo Operativo",
        mensaje="El mantenimiento del tomógrafo en tu área ha finalizado. El equipo se encuentra Activo y operativo.",
        leida=False,
        enlace_destino="/dashboard/doctor/tracking"
    )

    # 10. Crear un incidente de ejemplo para el Doctor Guzman
    IncidentReport.objects.create(
        doctor=users_db['fguzman@gmail.com'],
        equipo=equipo_imagenologia,
        problema_visible="El tomógrafo emite un zumbido fuerte al girar.",
        prioridad="Media",
        descripcion="Se reporta ruido excesivo en el gantry al realizar la rotación durante el escaneo.",
        estado="Inspeccionado",
        ingeniero_asignado=ing_demo,
        orden_trabajo_relacionada=wo1
    )

    print("Siembra y limpieza realista completadas exitosamente.")

if __name__ == '__main__':
    run()
