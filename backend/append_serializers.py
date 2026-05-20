with open('interfaces/serializers.py', 'a', encoding='utf-8') as f:
    f.write('''

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

    def get_doctor_nombre(self, obj):
        return f"{obj.doctor.first_name or ''} {obj.doctor.last_name or ''}".strip() or obj.doctor.email

    def get_equipo_nombre(self, obj):
        return obj.equipo.nombre

    def get_ingeniero_asignado_nombre(self, obj):
        if obj.ingeniero_asignado:
            return f"{obj.ingeniero_asignado.first_name or ''} {obj.ingeniero_asignado.last_name or ''}".strip() or obj.ingeniero_asignado.email
        return None
''')
