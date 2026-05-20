from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

class Role(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    permisos = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return self.name

class CustomUserManager(BaseUserManager):
    def create_user(self, email, codigo_unico, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        if not codigo_unico:
            raise ValueError('The Unique Code field must be set')
        
        email = self.normalize_email(email)
        user = self.model(email=email, codigo_unico=codigo_unico, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, codigo_unico, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, codigo_unico, password, **extra_fields)

class CustomUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    codigo_unico = models.CharField(max_length=20, unique=True)
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True, related_name='users')
    
    first_name = models.CharField(max_length=50, null=True, blank=True)
    second_name = models.CharField(max_length=50, null=True, blank=True)
    last_name = models.CharField(max_length=50, null=True, blank=True)
    maternal_last_name = models.CharField(max_length=50, null=True, blank=True)
    ci = models.CharField(max_length=20, null=True, blank=True)
    matricula = models.CharField(max_length=50, null=True, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    cellphone = models.CharField(max_length=20, null=True, blank=True)
    photo = models.ImageField(upload_to='profiles/', default='profiles/default.png', null=True, blank=True)
    fecha_bajas = models.DateField(null=True, blank=True)
    especialidades = models.JSONField(null=True, blank=True, default=list)
    descripcion_perfil = models.TextField(null=True, blank=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['codigo_unico']

    def __str__(self):
        return self.email

class MedicalEquipment(models.Model):
    STATUS_CHOICES = [
        ('Activo', 'Activo'),
        ('En Mantenimiento', 'En Mantenimiento'),
        ('Fuera de Servicio', 'Fuera de Servicio'),
        ('Dado de Baja', 'Dado de Baja'),
    ]

    nombre = models.CharField(max_length=100)
    codigo_interno = models.CharField(max_length=50, unique=True, null=True, blank=True)
    area = models.CharField(max_length=100)
    estado = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Activo')
    descripcion = models.TextField(null=True, blank=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)

    # Expanded Fields from Excel
    marca = models.CharField(max_length=100, null=True, blank=True)
    modelo = models.CharField(max_length=100, null=True, blank=True)
    numero_serie = models.CharField(max_length=100, null=True, blank=True)
    fecha_adquisicion = models.DateField(null=True, blank=True)
    proveedor = models.CharField(max_length=200, null=True, blank=True)
    costo = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    vida_util = models.CharField(max_length=50, null=True, blank=True)
    requisitos_energia = models.CharField(max_length=100, null=True, blank=True)
    dimensiones = models.CharField(max_length=100, null=True, blank=True)
    peso = models.CharField(max_length=50, null=True, blank=True)
    materiales = models.CharField(max_length=200, null=True, blank=True)
    frecuencia_mantenimiento = models.IntegerField(null=True, blank=True, help_text="En dias")
    proximo_mantenimiento = models.DateField(null=True, blank=True)
    caracteristicas = models.TextField(null=True, blank=True)
    condiciones_uso = models.TextField(null=True, blank=True)
    certificaciones = models.CharField(max_length=200, null=True, blank=True)
    mantenimiento_preventivo = models.TextField(null=True, blank=True)
    mantenimiento_correctivo = models.TextField(null=True, blank=True)
    mantenimiento_predictivo = models.TextField(null=True, blank=True)
    historial = models.TextField(null=True, blank=True)
    observaciones = models.TextField(null=True, blank=True)

    # Extended DB Fields for AI Expert Analysis
    salud_equipo = models.IntegerField(null=True, blank=True, help_text="0-100")
    ruta_modelo_3d = models.CharField(max_length=255, null=True, blank=True)
    mantenimientos_previos = models.JSONField(default=list, blank=True)

    # Campos de falla en tiempo real (reportados por ingenieros)
    falla_activa = models.BooleanField(default=False)
    falla_coordenada_x = models.FloatField(null=True, blank=True)
    falla_coordenada_y = models.FloatField(null=True, blank=True)
    falla_coordenada_z = models.FloatField(null=True, blank=True)
    falla_descripcion = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.nombre} ({self.codigo_interno})"

class WorkOrder(models.Model):
    MAINTENANCE_CHOICES = [
        ('Preventivo', 'Preventivo'),
        ('Correctivo', 'Correctivo'),
    ]
    STATUS_CHOICES = [
        ('Pendiente', 'Pendiente'),
        ('En Proceso', 'En Proceso'),
        ('Finalizado', 'Finalizado'),
    ]

    equipo = models.ForeignKey(MedicalEquipment, on_delete=models.CASCADE, related_name='work_orders')
    tipo_mantenimiento = models.CharField(max_length=20, choices=MAINTENANCE_CHOICES)
    estado = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pendiente')
    descripcion = models.TextField()
    observaciones_tecnicas = models.TextField(null=True, blank=True)
    
    creado_por = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='orders_created')
    ingeniero_asignado = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders_assigned')
    
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_inicio = models.DateTimeField(null=True, blank=True)
    fecha_fin = models.DateTimeField(null=True, blank=True)

    # 3D Coordinates for visual fault representation
    coordenada_3d_x = models.FloatField(null=True, blank=True)
    coordenada_3d_y = models.FloatField(null=True, blank=True)
    coordenada_3d_z = models.FloatField(null=True, blank=True)
    
    # Detailed report data
    costo_reparacion = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    repuestos_usados = models.JSONField(null=True, blank=True, default=list)
    repuestos_disponibles = models.BooleanField(default=True)
    problema_real_encontrado = models.TextField(null=True, blank=True)
    acciones_realizadas = models.TextField(null=True, blank=True)
    recomendaciones = models.TextField(null=True, blank=True)
    
    # Progress logs added by engineer
    bitacoras_ingeniero = models.JSONField(null=True, blank=True, default=list)

    def __str__(self):
        return f"Orden {self.id} - {self.tipo_mantenimiento}"

class AuditLog(models.Model):
    usuario = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    accion = models.CharField(max_length=100)
    entidad_afectada = models.CharField(max_length=100)
    entidad_id = models.IntegerField()
    descripcion = models.TextField()
    fecha = models.DateTimeField(auto_now_add=True)
    enlace_destino = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"{self.usuario.email} - {self.accion} on {self.entidad_afectada}"

class Notification(models.Model):
    usuario = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='notifications')
    titulo = models.CharField(max_length=100)
    mensaje = models.TextField()
    leida = models.BooleanField(default=False)
    fecha = models.DateTimeField(auto_now_add=True)
    enlace_destino = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"Notif to {self.usuario.email}: {self.titulo}"

class EngineerAvailability(models.Model):
    STATUS_CHOICES = [
        ('Disponible', 'Disponible'),
        ('Ocupado', 'Ocupado'),
        ('Fuera de Unidad', 'Fuera de Unidad'),
        ('Desconectado', 'Desconectado')
    ]
    ingeniero = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='availability')
    estado = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Disponible')
    ubicacion_actual = models.CharField(max_length=100, null=True, blank=True)
    ultima_actualizacion = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.ingeniero.email} - {self.estado}"

class IncidentReport(models.Model):
    PRIORITY_CHOICES = [
        ('Baja', 'Baja'),
        ('Media', 'Media'),
        ('Alta', 'Alta'),
        ('Critica', 'Crítica')
    ]
    STATUS_CHOICES = [
        ('Pendiente de Inspeccion', 'Pendiente de Inspección'),
        ('Inspeccionado', 'Inspeccionado'),
        ('Orden Generada', 'Orden Generada'),
        ('Rechazado', 'Rechazado')
    ]

    doctor = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='incidentes_reportados')
    equipo = models.ForeignKey(MedicalEquipment, on_delete=models.CASCADE, related_name='incidentes')
    problema_visible = models.CharField(max_length=200)
    prioridad = models.CharField(max_length=20, choices=PRIORITY_CHOICES)
    descripcion = models.TextField(null=True, blank=True)
    
    estado = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Pendiente de Inspeccion')
    
    ingeniero_asignado = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='incidentes_asignados')
    reporte_preliminar_ingeniero = models.TextField(null=True, blank=True)
    
    orden_trabajo_relacionada = models.ForeignKey('WorkOrder', on_delete=models.SET_NULL, null=True, blank=True, related_name='incidente_origen')
    
    fecha_reporte = models.DateTimeField(auto_now_add=True)
    fecha_inspeccion = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Incidente {self.id} - {self.equipo.nombre} ({self.estado})"
