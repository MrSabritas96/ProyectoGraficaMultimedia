import os

def patch_file(filepath):
    if not os.path.exists(filepath):
        print(f"Not found: {filepath}")
        return

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add state variables for availability
    if 'const [estadoOperativo, setEstadoOperativo]' not in content:
        target_state = "  const [isLoading, setIsLoading] = useState(true);"
        replacement_state = """  const [isLoading, setIsLoading] = useState(true);
  const [estadoOperativo, setEstadoOperativo] = useState<string>('Desconectado');
  const [isToggling, setIsToggling] = useState(false);"""
        content = content.replace(target_state, replacement_state)

    # 2. Add fetch Availability in useEffect
    if 'fetchAvailability' not in content:
        target_effect = "    const fetchEquipment = async () => {"
        replacement_effect = """    const fetchAvailability = async () => {
      try {
        const token = Cookies.get('token');
        const res = await fetch('http://localhost:8000/api/users/me/', { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setEstadoOperativo(data.role_name === 'Doctor' ? 'N/A' : (data.estado_operativo || 'Desconectado'));
        }
      } catch (e) { console.error(e); }
    };
    fetchAvailability();

    const fetchEquipment = async () => {"""
        content = content.replace(target_effect, replacement_effect)

    # 3. Add toggleAvailability function
    if 'const toggleAvailability = async () => {' not in content:
        target_func = "  return ("
        replacement_func = """  const toggleAvailability = async () => {
    if (estadoOperativo === 'Ocupado' || isToggling) return;
    setIsToggling(true);
    try {
      const token = Cookies.get('token');
      const newState = estadoOperativo === 'Disponible' ? 'Fuera de Unidad' : 'Disponible';
      const res = await fetch('http://localhost:8000/api/users/me/availability/', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ estado: newState })
      });
      if (res.ok) {
        const data = await res.json();
        setEstadoOperativo(data.estado);
      } else {
        const err = await res.json();
        alert(err.error || 'Error al cambiar estado');
      }
    } catch (e) { console.error(e); }
    setIsToggling(false);
  };

  return ("""
        content = content.replace(target_func, replacement_func)

    # 4. Add UI for the toggle in Header
    if 'Estado Actual' not in content:
        # Find where to inject the toggle UI. Usually right after the H1/P section.
        target_ui = """      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>"""
        
        replacement_ui = """      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>"""

        # Wait, let's inject it into the right side of the flex box.
        # Find the closing tag of motion.div for the left side header.
        
        target_right = """        </motion.div>
      </div>"""
        
        replacement_right = """        </motion.div>
        
        <div className="flex flex-col items-end gap-2 bg-[#050010] p-4 rounded-2xl border border-slate-800">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Estado Actual Operativo</p>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold uppercase tracking-widest ${
              estadoOperativo === 'Disponible' ? 'text-emerald-400' :
              estadoOperativo === 'Ocupado' ? 'text-rose-500' :
              'text-amber-500'
            }`}>
              {estadoOperativo === 'Disponible' ? 'EN ÁREA (DISPONIBLE)' :
               estadoOperativo === 'Ocupado' ? 'EN MANTENIMIENTO' :
               'FUERA DE ÁREA (OFF)'}
            </span>
            <button 
              onClick={toggleAvailability}
              disabled={estadoOperativo === 'Ocupado' || isToggling}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                estadoOperativo === 'Disponible' ? 'bg-emerald-500/20 border border-emerald-500' :
                estadoOperativo === 'Ocupado' ? 'bg-rose-500/20 border border-rose-500 opacity-50 cursor-not-allowed' :
                'bg-slate-800 border border-slate-700'
              }`}
            >
              <div className={`absolute top-1 left-1 w-5 h-5 rounded-full transition-transform ${
                estadoOperativo === 'Disponible' ? 'translate-x-7 bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.8)]' :
                estadoOperativo === 'Ocupado' ? 'translate-x-3.5 bg-rose-500' :
                'translate-x-0 bg-slate-500'
              }`} />
            </button>
          </div>
        </div>
      </div>"""
        content = content.replace(target_right, replacement_right)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        print(f"Patched {filepath}")

patch_file('../frontend/src/app/dashboard/engineer/page.tsx')
patch_file('../frontend/src/app/dashboard/jefe/page.tsx')
