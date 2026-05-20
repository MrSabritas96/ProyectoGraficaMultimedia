import os

filepath = 'infrastructure/models.py'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

if "enlace_destino =" not in content:
    content = content.replace(
        "fecha = models.DateTimeField(auto_now_add=True)",
        "fecha = models.DateTimeField(auto_now_add=True)\n    enlace_destino = models.CharField(max_length=255, blank=True, null=True)"
    )
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("models.py patched")
else:
    print("Already patched")
