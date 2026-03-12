import { AlertPanel } from "@/components/AlertPanel";

export default function Alerts() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Alerts</h2>
        <p className="text-sm text-muted-foreground">Active critical alerts requiring attention</p>
      </div>
      <AlertPanel />
    </div>
  );
}
