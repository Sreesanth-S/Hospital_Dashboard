import { AlertTriangle, Eye, CheckCircle, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/store";
import { formatDistanceToNow } from "date-fns";

export function AlertPanel() {
  const { alerts, resolveAlert } = useStore();
  const navigate = useNavigate();
  const unresolved = alerts.filter((a) => !a.resolved);

  if (unresolved.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-6 text-center">
        <CheckCircle className="w-10 h-10 text-risk-low mx-auto mb-2" />
        <p className="text-sm font-medium text-card-foreground">No active alerts</p>
        <p className="text-xs text-muted-foreground">All patients are stable</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-destructive/30 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-destructive/20 bg-destructive/5 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-destructive animate-pulse-slow" />
        <h3 className="text-sm font-semibold text-destructive">Critical Alerts ({unresolved.length})</h3>
      </div>
      <div className="divide-y divide-border max-h-80 overflow-y-auto scrollbar-thin">
        {unresolved.map((alert) => (
          <div key={alert.id} className="px-5 py-4 hover:bg-muted/30 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm font-semibold text-card-foreground">{alert.patientName}</p>
                <p className="text-xs text-muted-foreground">Week {alert.pregnancyWeek}</p>
              </div>
              <span className="text-[11px] text-muted-foreground">
                {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
              </span>
            </div>
            <p className="text-xs text-destructive font-medium mb-3">{alert.issue}</p>
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/patient/${alert.patientId}`)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
              >
                <Eye className="w-3 h-3" /> View
              </button>
              <button
                onClick={() => resolveAlert(alert.id)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-risk-low/10 text-risk-low text-xs font-medium hover:bg-risk-low/20 transition-colors"
              >
                <CheckCircle className="w-3 h-3" /> Resolve
              </button>
              <button className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition-colors">
                <Phone className="w-3 h-3" /> Contact
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
