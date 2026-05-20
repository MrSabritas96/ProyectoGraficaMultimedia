import pandas as pd

def main():
    equipos_path = r'c:\Users\CRISTIAN MANUEL\.gemini\antigravity\scratch\hospital_system\backend\exel\EQUIPOS_MEDICOS_ESTRUCTURADO_COMPLETO.xlsx'
    fichas_path = r'c:\Users\CRISTIAN MANUEL\.gemini\antigravity\scratch\hospital_system\backend\exel\FICHA_TECNICA_EQUIPOS_MEDICOS.xlsx'
    
    print('=== EQUIPOS (first 10) ===')
    df1 = pd.read_excel(equipos_path)
    print(df1.head(10).to_markdown())
    print('\nUnique Unidades:', df1['UNIDAD'].unique() if 'UNIDAD' in df1.columns else 'No UNIDAD column')
    
    print('\n=== FICHAS (first 10) ===')
    df2 = pd.read_excel(fichas_path)
    print(df2.head(10).to_markdown())

if __name__ == "__main__":
    main()
