export interface Engineer {
  id: string;
  name: string;
  uniqueCode: string;
  photo: string;
  specialty: string;
  status: 'Available' | 'Busy' | 'Offline';
  stats: {
    reparations: number;
    efficiency: number;
    avgTime: string;
  };
}

export interface TaskStep {
  id: number;
  label: string;
  completed: boolean;
}

export interface EquipmentInfo {
  id: string;
  name: string;
  brand: string;
  model: string;
  timeInUse: string;
  installDate: string;
  conditionOnArrival: string;
  lifespanYears: number;
  criticality: 'Alta' | 'Media' | 'Baja';
  department: string;
  reportingDoctor: string;
  totalRepairs: number;
  repairHistory: { date: string; issue: string; engineer: string }[];
  image: string;
}

export interface MaintenanceEvent {
  id: string;
  equipmentId: string;
  title: string;
  description: string;
  date: string; // ISO or short string
  startDate?: string;
  type: 'Preventivo' | 'Correctivo';
  status: 'fixed' | 'pending' | 'in_progress';
  engineerId?: string;
  reportContent?: string;
  steps?: TaskStep[];
}

export const mockDatabase = {
  equipments: [
    {
      id: '1',
      name: 'Tomógrafo Axial Computarizado (TAC)',
      brand: 'Siemens Healthineers',
      model: 'Somatom go.Up',
      timeInUse: '2 años, 4 meses',
      installDate: '2024-01-15',
      conditionOnArrival: 'Nuevo de Fábrica',
      lifespanYears: 10,
      criticality: 'Alta',
      department: 'Imagenología',
      reportingDoctor: 'Dr. Miguel Ángel (Jefe de Radiología)',
      totalRepairs: 3,
      repairHistory: [
        { date: '2025-06-12', issue: 'Cambio de tubo de rayos X', engineer: 'Ing. Carlos Ruiz' },
        { date: '2026-02-02', issue: 'Calibración de pantalla LCD', engineer: 'Ing. Ana Mendoza' }
      ],
      image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      id: '2',
      name: 'Sistema de Soporte Quirófano',
      brand: 'Dräger',
      model: 'Fabius Plus',
      timeInUse: '4 años, 1 mes',
      installDate: '2022-03-10',
      conditionOnArrival: 'Nuevo de Fábrica',
      lifespanYears: 12,
      criticality: 'Alta',
      department: 'Quirófano Central',
      reportingDoctor: 'Dra. Elena Vargas (Anestesióloga)',
      totalRepairs: 5,
      repairHistory: [
        { date: '2024-11-20', issue: 'Revisión de válvulas de mezcla', engineer: 'Ing. Luis Fernando' }
      ],
      image: 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    }
  ] as EquipmentInfo[],

  engineers: [
    {
      id: 'e1',
      name: 'Ing. Carlos Ruiz',
      uniqueCode: 'ENG-001',
      photo: 'https://i.pravatar.cc/150?u=carlos',
      specialty: 'Electromedicina e Imagenología',
      status: 'Available',
      stats: {
        reparations: 142,
        efficiency: 96,
        avgTime: '2.5 hrs'
      }
    },
    {
      id: 'e2',
      name: 'Ing. Ana Mendoza',
      uniqueCode: 'ENG-002',
      photo: 'https://i.pravatar.cc/150?u=ana',
      specialty: 'Soporte Vital y Quirófanos',
      status: 'Busy',
      stats: {
        reparations: 89,
        efficiency: 92,
        avgTime: '3.1 hrs'
      }
    },
    {
      id: 'e3',
      name: 'Ing. Luis Fernando',
      uniqueCode: 'ENG-003',
      photo: 'https://i.pravatar.cc/150?u=luis',
      specialty: 'Mecánica Clínica',
      status: 'Available',
      stats: {
        reparations: 205,
        efficiency: 98,
        avgTime: '1.8 hrs'
      }
    }
  ] as Engineer[],

  maintenanceOrders: [
    {
      id: 'm1',
      equipmentId: '1',
      title: 'Sensor de Presión',
      description: 'Reemplazo de válvula principal debido a fuga detectada.',
      date: '2026-03-15',
      type: 'Correctivo',
      status: 'fixed',
      engineerId: 'e1',
      reportContent: 'Se procedió al desarmado del bloque principal de presión. La junta tórica presentaba desgaste crítico. Se reemplazó por repuesto original ref: #OP-921. Pruebas de hermeticidad exitosas. Equipo operativo.',
      steps: [
        { id: 1, label: 'Desmontaje de bloque', completed: true },
        { id: 2, label: 'Reemplazo de junta tórica', completed: true },
        { id: 3, label: 'Prueba de hermeticidad', completed: true }
      ]
    },
    {
      id: 'm2',
      equipmentId: '1',
      title: 'Pantalla LCD',
      description: 'Calibración de colores y ajuste de brillo.',
      date: '2026-02-02',
      type: 'Preventivo',
      status: 'fixed',
      engineerId: 'e2',
      reportContent: 'Revisión semestral de la pantalla del operador. Valores de contraste y brillo restaurados a niveles de fábrica. No se encontraron pixeles muertos.'
    },
    {
      id: 'm3',
      equipmentId: '1',
      title: 'Motor de enfriamiento',
      description: 'Ruido inusual detectado. Requiere lubricación y posible cambio de rodamiento.',
      date: '2026-04-30',
      type: 'Correctivo',
      status: 'pending',
    },
    {
      id: 'm4',
      equipmentId: '2',
      title: 'Mantenimiento Semestral Quirófano',
      description: 'Revisión exhaustiva de sistemas de soporte vital.',
      date: '2026-04-28',
      startDate: '2026-04-27T08:00:00Z',
      type: 'Preventivo',
      status: 'in_progress',
      engineerId: 'e2',
      steps: [
        { id: 11, label: 'Verificar sistema de enfriamiento', completed: true },
        { id: 12, label: 'Calibrar válvulas de mezcla', completed: false },
        { id: 13, label: 'Prueba de software interno', completed: false }
      ]
    }
  ] as MaintenanceEvent[]
};

// Helper functions to fetch and mutate data
export const getEngineer = (id: string) => mockDatabase.engineers.find(e => e.id === id);
export const getEngineerByName = (name: string) => mockDatabase.engineers.find(e => e.name === name);
export const getMaintenanceEvent = (id: string) => mockDatabase.maintenanceOrders.find(m => m.id === id);
export const getAvailableEngineers = () => mockDatabase.engineers.filter(e => e.status === 'Available');
export const getBusyEngineers = () => mockDatabase.engineers.filter(e => e.status === 'Busy');
export const getActiveOrdersForEngineer = (engineerId: string) => mockDatabase.maintenanceOrders.filter(m => m.engineerId === engineerId && m.status === 'in_progress');
export const getEquipmentInfo = (id: string) => mockDatabase.equipments.find(e => e.id === id);

export const assignOrder = (eventId: string, engineerId: string) => {
  const event = mockDatabase.maintenanceOrders.find(m => m.id === eventId);
  const engineer = mockDatabase.engineers.find(e => e.id === engineerId);
  
  if (event && engineer) {
    event.status = 'in_progress';
    event.engineerId = engineerId;
    event.startDate = new Date().toISOString();
    // Initialize default steps if none exist
    if (!event.steps) {
      event.steps = [
        { id: Math.random(), label: 'Diagnóstico inicial', completed: false },
        { id: Math.random(), label: 'Resolución de falla', completed: false },
        { id: Math.random(), label: 'Pruebas de calidad', completed: false }
      ];
    }
    engineer.status = 'Busy';
  }
};

export const toggleTaskStep = (eventId: string, stepId: number) => {
  const event = mockDatabase.maintenanceOrders.find(m => m.id === eventId);
  if (event && event.steps) {
    const step = event.steps.find(s => s.id === stepId);
    if (step) {
      step.completed = !step.completed;
    }
    // Check if all steps are completed
    const allCompleted = event.steps.every(s => s.completed);
    if (allCompleted) {
      event.status = 'fixed';
      const engineer = mockDatabase.engineers.find(e => e.id === event.engineerId);
      if (engineer) {
        engineer.status = 'Available';
        engineer.stats.reparations += 1;
      }
    } else {
      event.status = 'in_progress';
    }
  }
};
