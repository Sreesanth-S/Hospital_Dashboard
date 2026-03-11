import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, Settings, Heart, AlertTriangle
} from "lucide-react";
import { useAuthStore } from "@/store/auth";

const navItems = [
  { title: "Dashboard", path: "/", icon: LayoutDashboard },
  { title: "Patients", path: "/patients", icon: Users },
  { title: "Risk Assessment", path: "/risk-assessment", icon: AlertTriangle },
  { title: "Settings", path: "/settings", icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();
  const { user } = useAuthStore();

  const userInitials = user?.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen bg-sidebar border-r border-sidebar-border">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-sidebar-primary">
          <Heart className="w-5 h-5 text-sidebar-primary-foreground" />
        </div>
        <div>
          <h1 className="text-base font-bold text-sidebar-primary-foreground tracking-tight">Our Moment</h1>
          <p className="text-[11px] text-sidebar-muted leading-none">Maternal Health Platform</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              }`}
            >
              <item.icon className="w-[18px] h-[18px]" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center text-xs font-bold text-sidebar-primary-foreground">
            {userInitials}
          </div>
          <div>
            <p className="text-xs font-semibold text-sidebar-accent-foreground">{user?.name || "User"}</p>
            <p className="text-[11px] text-sidebar-muted capitalize">{user?.role || "Admin"}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
