import os

filepath = 'interfaces/serializers.py'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

target = "falla_descripcion = serializers.CharField(read_only=True, required=False)"
replacement = "falla_descripcion = serializers.CharField(read_only=True, required=False)\n    mantenimientos_previos = serializers.JSONField(read_only=True, required=False)"

if "mantenimientos_previos =" not in content:
    content = content.replace(target, replacement)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("serializers.py patched")
else:
    print("Already patched")
