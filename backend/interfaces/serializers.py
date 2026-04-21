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
    equipo_id = serializers.IntegerField()
    creado_por_id = serializers.IntegerField(read_only=True)
    ingeniero_asignado_id = serializers.IntegerField(required=False, allow_null=True)
    fecha_creacion = serializers.DateTimeField(read_only=True)

class EquipmentSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    nombre = serializers.CharField()
    codigo_interno = serializers.CharField()
    area = serializers.CharField()
    estado = serializers.CharField(read_only=True)
    descripcion = serializers.CharField()
