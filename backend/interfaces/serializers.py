from rest_framework import serializers

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    codigo_unico = serializers.CharField()
    password = serializers.CharField(write_only=True)

class WorkOrderSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    tipo_mantenimiento = serializers.CharField()
    estado = serializers.CharField(read_only=True)
    descripcion = serializers.CharField()
    observaciones_tecnicas = serializers.CharField(required=False, allow_null=True)
    equipo_id = serializers.IntegerField()
    creado_por_id = serializers.IntegerField(read_only=True)
    ingeniero_asignado_id = serializers.IntegerField(required=False, allow_null=True)
    fecha_creacion = serializers.DateTimeField(read_only=True)
    fecha_inicio = serializers.DateTimeField(read_only=True)
    fecha_fin = serializers.DateTimeField(read_only=True)
    
    # 3D
    coordenada_3d_x = serializers.FloatField(required=False, allow_null=True)
    coordenada_3d_y = serializers.FloatField(required=False, allow_null=True)
    coordenada_3d_z = serializers.FloatField(required=False, allow_null=True)
    
    # Historico
    costo_reparacion = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, allow_null=True)
    repuestos_usados = serializers.JSONField(required=False, allow_null=True)
    repuestos_disponibles = serializers.BooleanField(required=False, default=True)
    problema_real_encontrado = serializers.CharField(required=False, allow_null=True)
    acciones_realizadas = serializers.CharField(required=False, allow_null=True)
    recomendaciones = serializers.CharField(required=False, allow_null=True)

class UserProfileSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    first_name = serializers.CharField(required=False, allow_null=True)
    last_name = serializers.CharField(required=False, allow_null=True)
    ci = serializers.CharField(read_only=True)
    matricula = serializers.CharField(read_only=True)
    email = serializers.EmailField(read_only=True)
    codigo_unico = serializers.CharField(read_only=True)
    cellphone = serializers.CharField(required=False, allow_null=True)
    photo = serializers.ImageField(required=False, allow_null=True)
    especialidades = serializers.JSONField(read_only=True)
    descripcion_perfil = serializers.CharField(required=False, allow_null=True)
    role_name = serializers.SerializerMethodField()

    def get_role_name(self, obj):
        return obj.role.name if obj.role else None

class EquipmentSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    nombre = serializers.CharField()
    codigo_interno = serializers.CharField()
    area = serializers.CharField()
    estado = serializers.CharField(read_only=True)
    descripcion = serializers.CharField()
    falla_activa = serializers.BooleanField(read_only=True, required=False)
    falla_coordenada_x = serializers.FloatField(read_only=True, required=False)
    falla_coordenada_y = serializers.FloatField(read_only=True, required=False)
    falla_coordenada_z = serializers.FloatField(read_only=True, required=False)
    falla_descripcion = serializers.CharField(read_only=True, required=False)
    mantenimientos_previos = serializers.JSONField(read_only=True, required=False)

class RoleSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    name = serializers.CharField()
    description = serializers.CharField(required=False, allow_blank=True)
    permisos = serializers.JSONField(required=False, default=dict)

class UserAdminSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    email = serializers.EmailField()
    codigo_unico = serializers.CharField(required=False, allow_blank=True)
    first_name = serializers.CharField(required=False, allow_null=True)
    last_name = serializers.CharField(required=False, allow_null=True)
    role_id = serializers.IntegerField(required=False, allow_null=True)
    role_name = serializers.SerializerMethodField()
    is_active = serializers.BooleanField(required=False, default=True)
    last_login = serializers.DateTimeField(read_only=True)
    date_joined = serializers.DateTimeField(read_only=True)
    photo = serializers.ImageField(read_only=True)
    estado_operativo = serializers.SerializerMethodField()

    def get_role_name(self, obj):
        return obj.role.name if obj.role else None
        
    def get_estado_operativo(self, obj):
        if hasattr(obj, 'availability'):
            return obj.availability.estado
        return "Desconectado"


class EngineerAvailabilitySerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    ingeniero_id = serializers.IntegerField(read_only=True)
    ingeniero_nombre = serializers.SerializerMethodField()
    estado = serializers.CharField()
    ubicacion_actual = serializers.CharField(required=False, allow_null=True)
    ultima_actualizacion = serializers.DateTimeField(read_only=True)

    def get_ingeniero_nombre(self, obj):
        return f"{obj.ingeniero.first_name or ''} {obj.ingeniero.last_name or ''}".strip() or obj.ingeniero.email

class IncidentReportSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    doctor_id = serializers.IntegerField(read_only=True)
    doctor_nombre = serializers.SerializerMethodField()
    equipo_id = serializers.IntegerField()
    equipo_nombre = serializers.SerializerMethodField()
    problema_visible = serializers.CharField()
    prioridad = serializers.CharField()
    descripcion = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    estado = serializers.CharField(read_only=True)
    ingeniero_asignado_id = serializers.IntegerField(read_only=True)
    ingeniero_asignado_nombre = serializers.SerializerMethodField()
    reporte_preliminar_ingeniero = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    orden_trabajo_relacionada_id = serializers.IntegerField(read_only=True)
    fecha_reporte = serializers.DateTimeField(read_only=True)
    fecha_inspeccion = serializers.DateTimeField(read_only=True)
    orden_trabajo_info = serializers.SerializerMethodField()

    def get_orden_trabajo_info(self, obj):
        if obj.orden_trabajo_relacionada:
            wo = obj.orden_trabajo_relacionada
            return {
                'ingeniero': f"{wo.ingeniero_asignado.first_name} {wo.ingeniero_asignado.last_name}" if wo.ingeniero_asignado else 'N/A',
                'jefe': f"{wo.creada_por.first_name} {wo.creada_por.last_name}" if wo.creada_por else 'N/A',
                'tiempo_estimado': wo.tiempo_estimado if hasattr(wo, 'tiempo_estimado') else 'Por definir',
                'estado': wo.estado
            }
        return None

    def get_doctor_nombre(self, obj):
        return f"{obj.doctor.first_name or ''} {obj.doctor.last_name or ''}".strip() or obj.doctor.email

    def get_equipo_nombre(self, obj):
        return obj.equipo.nombre

    def get_ingeniero_asignado_nombre(self, obj):
        if obj.ingeniero_asignado:
            return f"{obj.ingeniero_asignado.first_name or ''} {obj.ingeniero_asignado.last_name or ''}".strip() or obj.ingeniero_asignado.email
        return None
