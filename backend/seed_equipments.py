import os
import django
import pandas as pd
import numpy as np

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from infrastructure.models import MedicalEquipment

def safe_str(val):
    if pd.isna(val): return None
    return str(val)

def safe_float(val):
    if pd.isna(val): return None
    try:
        return float(val)
    except:
        return None

def safe_int(val):
    if pd.isna(val): return None
    try:
        return int(val)
    except:
        return None

def safe_date(val):
    if pd.isna(val): return None
    try:
        return pd.to_datetime(val).date()
    except:
        return None

import unicodedata

def normalize_unidad(u):
    if pd.isna(u): return 'GENERAL'
    u = str(u).upper().strip()
    u = ''.join(c for c in unicodedata.normalize('NFD', u) if unicodedata.category(c) != 'Mn')
    return u

def main():
    equipos_path = r'c:\Users\CRISTIAN MANUEL\.gemini\antigravity\scratch\hospital_system\backend\exel\EQUIPOS_MEDICOS_ESTRUCTURADO_COMPLETO.xlsx'
    df = pd.read_excel(equipos_path)
    
    MedicalEquipment.objects.all().delete()
    print("Deleted all existing equipment.")
    
    equipments = []
    imagenologia_count = 0
    
    # Predefined positions for the 8 types of geometry (fault, maint_1, maint_2)
    pos_map = {
        1: {'falla': [-1.8, 1, 0.2], 'm1': [0, 2, 0], 'm2': [1.5, 0.5, 0]},
        2: {'falla': [0, 1.5, 0], 'm1': [0, -0.6, 2], 'm2': [1.5, 0, 0]},
        3: {'falla': [0, 1.2, 0.1], 'm1': [0, 0.5, 0.5], 'm2': [0.5, -0.2, 0]},
        4: {'falla': [0.2, 0.5, 0.4], 'm1': [-0.5, 2, 0], 'm2': [0.2, 1.5, 0.4]},
        5: {'falla': [0, 2, -0.4], 'm1': [1, -0.5, 0.4], 'm2': [-1.5, 1.5, -0.8]},
        6: {'falla': [-1, 1.5, 0.4], 'm1': [1, -0.5, 0.4], 'm2': [-1, 0.5, -0.8]},
        7: {'falla': [0, 2, 0], 'm1': [2.5, 0, 0], 'm2': [0, 0.5, 1.5]},
        8: {'falla': [0, -0.2, 0.6], 'm1': [0.4, 0.5, 0.6], 'm2': [-0.5, 0.2, 0]}
    }
    
    for index, row in df.iterrows():
        descripcion_excel = safe_str(row.get('Ficha Técnica'))
        if not descripcion_excel or descripcion_excel == 'NaN' or pd.isna(row.get('Ficha Técnica')):
            marca_str = f" de la marca {safe_str(row.get('Marca'))}" if pd.notna(row.get('Marca')) else ""
            area_str = normalize_unidad(row.get('Unidad'))
            descripcion = f"Equipo médico especializado designado para el área de {area_str}. Este modelo{marca_str} es fundamental para las operaciones diarias de la unidad, requiriendo mantenimientos periódicos para asegurar su correcto funcionamiento e integridad clínica."
        else:
            descripcion = descripcion_excel

        health_score = 30 + ((index * 13) % 71)
        
        model_path = None
        mantenimientos = []
        area_lower = safe_str(row.get('Unidad', '')).lower()
        
        is_falla = False
        falla_x, falla_y, falla_z = None, None, None
        falla_desc = None
        
        imgId = 0
        
        if "imagenologia" in area_lower or "rayos x" in area_lower or "oncología" in area_lower or "radioterapia" in area_lower:
            if imagenologia_count < 8:
                imagenologia_count += 1
                imgId = imagenologia_count
                model_path = f"/models/img_{imagenologia_count}.glb"
                
                pos = pos_map.get(imgId, pos_map[1])
                
                mantenimientos = [
                    {
                        "id": index * 10 + 1, 
                        "position3D": pos['m1'], 
                        "title": "Revisión Preventiva General", 
                        "description": "Limpieza y ajuste de contactos mecánicos.", 
                        "date": "15 Feb 2026", 
                        "engineer": "Ing. Carlos Ruiz", 
                        "status": "fixed",
                        "details": {
                            "reportado_por": "Dr. Fernando Guzman",
                            "fecha_ingreso": "14 Feb 2026",
                            "fecha_resolucion": "15 Feb 2026",
                            "accion_tomada": "Se realizó despiece de la cubierta exterior y se limpiaron los actuadores. Pruebas de encendido OK.",
                            "aprobado_por": "Jefe de Unidad"
                        }
                    },
                    {
                        "id": index * 10 + 2, 
                        "position3D": pos['m2'], 
                        "title": "Cambio de Sensor", 
                        "description": "El sensor presentaba latencia en lectura.", 
                        "date": "05 Ene 2026", 
                        "engineer": "Ing. Ana Mendoza", 
                        "status": "fixed",
                        "details": {
                            "reportado_por": "Dra. Maria Perez",
                            "fecha_ingreso": "03 Ene 2026",
                            "fecha_resolucion": "05 Ene 2026",
                            "accion_tomada": "Sustitución de componente electrónico principal, calibración de software en placa base.",
                            "aprobado_por": "Jefe de Unidad"
                        }
                    }
                ]
                
        equipo_nombre = safe_str(row.get('Equipo', '')).lower()
        is_ecografo = "ecógrafo" in equipo_nombre or "ecografo" in equipo_nombre
        is_densitometro = "densitómetro" in equipo_nombre or "densitometro" in equipo_nombre
        
        if (is_ecografo and imgId == 7) or (is_densitometro and imgId == 6):
            is_falla = True
            pos = pos_map.get(imgId, pos_map[3]) # default to 3 if not mapped
            falla_x, falla_y, falla_z = pos['falla']
            falla_desc = "Transductor defectuoso. Presenta artefactos en la imagen." if is_ecografo else "Falla en brazo de escáner. Ruido anómalo al desplazar."
            
            # Agregar a mantenimientos_previos como pendiente
            mantenimientos.append({
                "id": index * 10 + 99,
                "position3D": [falla_x, falla_y, falla_z],
                "title": "Incidente Reportado",
                "description": falla_desc,
                "date": "Reciente",
                "engineer": "Sistema",
                "status": "pending",
                "details": {
                    "reportado_por": "Dr. Fernando Guzman",
                    "fecha_ingreso": "Ayer",
                    "fecha_resolucion": "Pendiente de revisión por Unidad",
                    "accion_tomada": "Evidencia reportada por el doctor.",
                    "aprobado_por": "Pendiente"
                }
            })

        eq = MedicalEquipment(
            nombre=safe_str(row.get('Equipo', 'Equipo Desconocido'))[:100] if not pd.isna(row.get('Equipo')) else 'Equipo Desconocido',
            codigo_interno=f"HC-{index+1000}",
            area=normalize_unidad(row.get('Unidad'))[:100],
            estado='Activo',
            descripcion=descripcion,
            marca=safe_str(row.get('Marca'))[:100] if safe_str(row.get('Marca')) else None,
            modelo=safe_str(row.get('Modelo'))[:100] if safe_str(row.get('Modelo')) else None,
            fecha_adquisicion=safe_date(row.get('Fecha Adquisición')),
            proveedor=safe_str(row.get('Proveedor'))[:200] if safe_str(row.get('Proveedor')) else None,
            costo=safe_float(row.get('Costo Adquisición')),
            vida_util=safe_str(row.get('Vida Útil Estimada'))[:50] if safe_str(row.get('Vida Útil Estimada')) else None,
            proximo_mantenimiento=safe_date(row.get('Próximo Mantenimiento')),
            observaciones=safe_str(row.get('Observaciones')),
            historial=f"Incidentes: {safe_str(row.get('Registro Incidentes', 'N/A'))}\nMantenimientos: {safe_str(row.get('Registro Mantenimiento', 'N/A'))}",
            caracteristicas=safe_str(row.get('Base Conocimiento')),
            salud_equipo=health_score,
            ruta_modelo_3d=model_path,
            mantenimientos_previos=mantenimientos,
            falla_activa=is_falla,
            falla_coordenada_x=falla_x,
            falla_coordenada_y=falla_y,
            falla_coordenada_z=falla_z,
            falla_descripcion=falla_desc
        )
        equipments.append(eq)
        
    MedicalEquipment.objects.bulk_create(equipments)
    print(f"Successfully seeded {len(equipments)} equipments.")

if __name__ == '__main__':
    main()
