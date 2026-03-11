import { useNavigate } from "react-router-dom";
import { useStore } from "@/store";
import { AlertTriangle, Info, CheckCircle, AlertCircle, X, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { NotificationType } from "@/types";

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case "alert":
      return <AlertTriangle className="w-5 h-5 text-destructive" />;
    case "warning":
      return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    case "success":
      return <CheckCircle className="w-5 h-5 text-risk-low" />;
    case "info":
      return <Info className="w-5 h-5 text-primary" />;
    default:
      return <Info className="w-5 h-5 text-primary" />;
  }
}

function getNotificationStyles(type: NotificationType) {
  switch (type) {
    case "alert":
      return "bg-destructive/10 border-l-4 border-destructive";
    case "warning":
      return "bg-yellow-500/10 border-l-4 border-yellow-500";
    case "success":
      return "bg-risk-low/10 border-l-4 border-risk-low";
    case "info":
      return "bg-primary/10 border-l-4 border-primary";
    default:
      return "bg-secondary border-l-4 border-border";
  }
}

export function NotificationCenter() {
  const navigate = useNavigate();
  const { notifications, dismissNotification, markNotificationAsRead } = useStore();
  const unreadCount = notifications.filter((n) => !n.read).length;

  if (notifications.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-6 text-center">
        <CheckCircle className="w-10 h-10 text-risk-low mx-auto mb-2" />
        <p className="text-sm font-medium text-card-foreground">No notifications</p>
        <p className="text-xs text-muted-foreground">You're all caught up!</p>
      </div>
    );
  }

  const handleNotificationClick = (notification: (typeof notifications)[0]) => {
    if (!notification.read) {
      markNotificationAsRead(notification.id);
    }
    if (notification.action?.path) {
      navigate(notification.action.path);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with count */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto scrollbar-thin">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`${getNotificationStyles(notification.type)} rounded-lg p-4 hover:shadow-md transition-all cursor-pointer ${!notification.read ? "opacity-100" : "opacity-75"}`}
            onClick={() => handleNotificationClick(notification)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <div className="mt-0.5">{getNotificationIcon(notification.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{notification.title}</p>
                    {!notification.read && (
                      <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-card-foreground mt-1">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                  </p>

                  {/* Action Button */}
                  {notification.action && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNotificationClick(notification);
                      }}
                      className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
                    >
                      {notification.action.label}
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Dismiss Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  dismissNotification(notification.id);
                }}
                className="p-1.5 rounded-md hover:bg-muted transition-colors flex-shrink-0"
                title="Dismiss"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
