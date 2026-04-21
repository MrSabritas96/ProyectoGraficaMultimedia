from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

class Role(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)

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
    codigo_interno = models.CharField(max_length=50, unique=True)
    area = models.CharField(max_length=100)
    estado = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Activo')
    descripcion = models.TextField()
    fecha_registro = models.DateTimeField(auto_now_add=True)

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

    def __str__(self):
        return f"Orden {self.id} - {self.tipo_mantenimiento}"

class AuditLog(models.Model):
    usuario = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    accion = models.CharField(max_length=100)
    entidad_afectada = models.CharField(max_length=100)
    entidad_id = models.IntegerField()
    descripcion = models.TextField()
    fecha = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.usuario.email} - {self.accion} on {self.entidad_afectada}"

class Notification(models.Model):
    usuario = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='notifications')
    titulo = models.CharField(max_length=100)
    mensaje = models.TextField()
    leida = models.BooleanField(default=False)
    fecha = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notif to {self.usuario.email}: {self.titulo}"
