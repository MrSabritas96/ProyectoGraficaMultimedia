import { CreateEquipmentForm } from '@/modules/equipment/ui/components/CreateEquipmentForm';

export default function NewEquipmentPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Gestión de Inventario</h1>
      <CreateEquipmentForm />
    </div>
  );
}
