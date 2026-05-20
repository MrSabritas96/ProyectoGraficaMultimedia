import os

filepath = 'interfaces/serializers.py'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

target = "fecha_inspeccion = serializers.DateTimeField(read_only=True)"
replacement = """fecha_inspeccion = serializers.DateTimeField(read_only=True)
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
        return None"""

if "def get_orden_trabajo_info" not in content:
    content = content.replace(target, replacement)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("serializers.py patched with orden_trabajo_info")
else:
    print("Already patched")
