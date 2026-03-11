import { useState, useEffect } from "react";
import { Moon, Sun, Bell, Eye, Database, User, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

export default function Settings() {
  const [darkMode, setDarkMode] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [dataRetention, setDataRetention] = useState("30");
  const [hospitalsFilter, setHospitalsFilter] = useState("");
  const [doctorName, setDoctorName] = useState("Dr. Rebecca");
  const [specialization, setSpecialization] = useState("OB-GYN");
  const [isSaving, setIsSaving] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("appSettings");
    let isDarkMode = true;
    
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      isDarkMode = settings.darkMode ?? true;
      setDarkMode(isDarkMode);
      setEmailNotifications(settings.emailNotifications ?? true);
      setPushNotifications(settings.pushNotifications ?? true);
      setDataRetention(settings.dataRetention ?? "30");
      setHospitalsFilter(settings.hospitalsFilter ?? "");
      setDoctorName(settings.doctorName ?? "Dr. Rebecca");
      setSpecialization(settings.specialization ?? "OB-GYN");
    }

    // Apply dark mode
    applyDarkMode(isDarkMode);
  }, []);

  const applyDarkMode = (isDark: boolean) => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  };

  const handleDarkModeToggle = (value: boolean) => {
    setDarkMode(value);
    applyDarkMode(value);
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const settings = {
        darkMode,
        emailNotifications,
        pushNotifications,
        dataRetention,
        hospitalsFilter,
        doctorName,
        specialization,
      };
      localStorage.setItem("appSettings", JSON.stringify(settings));
      toast({
        title: "Success",
        description: "Settings saved successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetSettings = () => {
    localStorage.removeItem("appSettings");
    setDarkMode(true);
    setEmailNotifications(true);
    setPushNotifications(true);
    setDataRetention("30");
    setHospitalsFilter("");
    setDoctorName("Dr. Rebecca");
    setSpecialization("OB-GYN");
    applyDarkMode(true);
    toast({
      title: "Reset",
      description: "Settings have been reset to defaults",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your preferences and application settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-4">
          {/* Theme Settings */}
          <Card className="shadow-sm">
            <div className="p-6 border-b">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Sun className="w-5 h-5" /> Theme & Display
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {darkMode ? (
                    <Moon className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <Sun className="w-5 h-5 text-muted-foreground" />
                  )}
                  <div>
                    <Label className="text-sm font-medium text-foreground cursor-pointer">Dark Mode</Label>
                    <p className="text-xs text-muted-foreground">Enable dark theme for better viewing at night</p>
                  </div>
                </div>
                <Switch checked={darkMode} onCheckedChange={handleDarkModeToggle} />
              </div>
            </div>
          </Card>

          {/* Notification Settings */}
          <Card className="shadow-sm">
            <div className="p-6 border-b">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Bell className="w-5 h-5" /> Notifications
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <Label className="text-sm font-medium text-foreground cursor-pointer">Email Notifications</Label>
                    <p className="text-xs text-muted-foreground">Receive alerts via email</p>
                  </div>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>
              <div className="border-t pt-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <Label className="text-sm font-medium text-foreground cursor-pointer">Push Notifications</Label>
                    <p className="text-xs text-muted-foreground">Get instant alerts on your device</p>
                  </div>
                </div>
                <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
              </div>
            </div>
          </Card>

          {/* Data Settings */}
          <Card className="shadow-sm">
            <div className="p-6 border-b">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Database className="w-5 h-5" /> Data Management
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <Label className="text-sm font-medium text-foreground mb-2 block">
                  Data Retention Period (days)
                </Label>
                <Input
                  type="number"
                  value={dataRetention}
                  onChange={(e) => setDataRetention(e.target.value)}
                  placeholder="Enter number of days"
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Patient data older than this period will be archived
                </p>
              </div>
            </div>
          </Card>

          {/* Filter Settings */}
          <Card className="shadow-sm">
            <div className="p-6 border-b">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Eye className="w-5 h-5" /> View Filters
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <Label className="text-sm font-medium text-foreground mb-2 block">Hospital Filter</Label>
                <Input
                  type="text"
                  value={hospitalsFilter}
                  onChange={(e) => setHospitalsFilter(e.target.value)}
                  placeholder="Enter hospital name or leave empty for all"
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Filter patients by specific hospital or facility
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Profile & Security Settings */}
        <div className="space-y-4">
          {/* Profile Settings */}
          <Card className="shadow-sm">
            <div className="p-6 border-b">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <User className="w-5 h-5" /> Profile
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-2xl font-bold text-primary-foreground mx-auto">
                {doctorName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground uppercase">Doctor Name</Label>
                <Input
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="Enter your name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground uppercase">Specialization</Label>
                <Input
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="e.g., OB-GYN"
                  className="mt-1"
                />
              </div>
            </div>
          </Card>

          {/* Security Settings */}
          <Card className="shadow-sm">
            <div className="p-6 border-b">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Shield className="w-5 h-5" /> Security
              </h3>
            </div>
            <div className="p-6 space-y-3">
              <Button variant="outline" className="w-full text-sm">
                Change Password
              </Button>
              <Button variant="outline" className="w-full text-sm">
                Two-Factor Authentication
              </Button>
              <Button variant="outline" className="w-full text-sm">
                Manage Sessions
              </Button>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button onClick={handleSaveSettings} disabled={isSaving} className="w-full">
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
            <Button onClick={handleResetSettings} variant="outline" className="w-full text-sm">
              Reset to Defaults
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
