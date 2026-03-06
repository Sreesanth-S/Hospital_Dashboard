import { Search, Bell } from "lucide-react";
import { useStore } from "@/store";

export function TopNavbar() {
  const { searchQuery, setSearchQuery, alerts } = useStore();
  const unresolvedCount = alerts.filter((a) => !a.resolved).length;

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 shrink-0">
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search patients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-10 pl-10 pr-4 rounded-lg bg-secondary text-sm text-foreground placeholder:text-muted-foreground border-none outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          {unresolvedCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
              {unresolvedCount}
            </span>
          )}
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-border">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
            DR
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-semibold text-foreground leading-none">Dr. Rebecca Cole</p>
            <p className="text-xs text-muted-foreground">Obstetrics Dept.</p>
          </div>
        </div>
      </div>
    </header>
  );
}
