import { CreateWorkOrderForm } from '@/modules/work-orders/ui/components/CreateWorkOrderForm';

export default function NewWorkOrderPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Panel de Control</h1>
      <CreateWorkOrderForm />
    </div>
  );
}
