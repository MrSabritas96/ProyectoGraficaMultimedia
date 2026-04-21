from django.core.management.base import BaseCommand
from infrastructure.models import Role, CustomUser, MedicalEquipment, WorkOrder
from django.utils import timezone
import random

class Command(BaseCommand):
    help = 'Puebla la base de datos con datos realistas para la demostración'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Iniciando generación de datos demo..."))

        # 1. Crear Roles
        roles_data = [
            ('Administrador', 'Control total del sistema'),
            ('Secretario', 'Gestión de inventario y personal'),
            ('Jefe de Unidad', 'Creación y seguimiento de órdenes'),
            ('Ingeniero Electronico', 'Ejecución de mantenimientos'),
            ('Doctor', 'Consulta de estado de equipos'),
        ]
        roles = {}
        for name, desc in roles_data:
            role, _ = Role.objects.get_or_create(name=name, defaults={'description': desc})
            roles[name] = role

        # 2. Crear Usuarios Demo
        users_to_create = [
            ('admin@hospital.com', 'ADM-001', 'Administrador'),
            ('jefe@hospital.com', 'JEF-001', 'Jefe de Unidad'),
            ('ingeniero@hospital.com', 'ING-001', 'Ingeniero Electronico'),
            ('doctor@hospital.com', 'DOC-001', 'Doctor'),
        ]
        demo_users = {}
        for email, code, rname in users_to_create:
            user, created = CustomUser.objects.get_or_create(
                email=email,
                defaults={
                    'codigo_unico': code,
                    'role': roles[rname],
                    'is_staff': True if rname == 'Administrador' else False
                }
            )
            if created:
                user.set_password('demo1234')
                user.save()
            demo_users[rname] = user

        # 3. Crear Equipos Médicos
        equipments_data = [
            ('Resonador Magnético Tesla 3', 'IMG-RM-01', 'Imagenología'),
            ('Ventilador Mecánico Hamilton', 'UCI-VM-05', 'Cuidados Intensivos'),
            ('Monitor Signos Vitales Mindray', 'URG-MS-12', 'Urgencias'),
            ('Desfibrilador Zoll R Series', 'URG-DF-03', 'Urgencias'),
            ('Máquina Anestesia Dräger', 'QX-MA-02', 'Quirófano'),
        ]
        demo_equipments = []
        for nombre, codigo, area in equipments_data:
            eq, _ = MedicalEquipment.objects.get_or_create(
                codigo_interno=codigo,
                defaults={
                    'nombre': nombre,
                    'area': area,
                    'estado': 'Activo',
                    'descripcion': f"Equipo médico de alta precisión para el área de {area}."
                }
            )
            demo_equipments.append(eq)

        # 4. Crear Órdenes de Trabajo (Historial)
        if WorkOrder.objects.count() < 5:
            # Orden Finalizada
            WorkOrder.objects.create(
                equipo=demo_equipments[0],
                tipo_mantenimiento='Preventivo',
                estado='Finalizado',
                descripcion='Mantenimiento semestral preventivo.',
                creado_por=demo_users['Jefe de Unidad'],
                ingeniero_asignado=demo_users['Ingeniero Electronico'],
                fecha_inicio=timezone.now() - timezone.timedelta(days=2),
                fecha_fin=timezone.now() - timezone.timedelta(days=1),
                observaciones_tecnicas='Se realizó limpieza de filtros y calibración de bobinas. Todo en orden.'
            )

            # Orden En Proceso
            WorkOrder.objects.create(
                equipo=demo_equipments[1],
                tipo_mantenimiento='Correctivo',
                estado='En Proceso',
                descripcion='Falla en el sensor de flujo de aire.',
                creado_por=demo_users['Jefe de Unidad'],
                ingeniero_asignado=demo_users['Ingeniero Electronico'],
                fecha_inicio=timezone.now() - timezone.timedelta(hours=5)
            )

            # Órdenes Pendientes
            for i in range(2):
                WorkOrder.objects.create(
                    equipo=demo_equipments[i+2],
                    tipo_mantenimiento=random.choice(['Preventivo', 'Correctivo']),
                    estado='Pendiente',
                    descripcion='Revisión de rutina solicitada por el personal de enfermería.',
                    creado_por=demo_users['Jefe de Unidad']
                )

        self.stdout.write(self.style.SUCCESS("¡Datos demo generados exitosamente!"))
        self.stdout.write(self.style.NOTICE(f"--- Credenciales de acceso ---"))
        self.stdout.write("Usuario: jefe@hospital.com | Pass: demo1234")
        self.stdout.write("Usuario: ingeniero@hospital.com | Pass: demo1234")
