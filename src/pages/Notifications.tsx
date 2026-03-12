import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NotificationCenter } from "@/components/NotificationCenter";

export default function Notifications() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-foreground">Notifications</h2>
        <p className="text-sm text-muted-foreground">Unread alerts and system updates</p>
      </div>
      <NotificationCenter />
    </div>
  );
}
