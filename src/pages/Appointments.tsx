import { useMemo, useState } from "react";
import { CalendarDays, Clock3, PlusCircle, Stethoscope } from "lucide-react";
import { useStore } from "@/store/supabaseStore";
import { useAuthStore } from "@/store/auth";
import { userService } from "@/lib/services/userService";
import { useEffect } from "react";
import type { User } from "@/types";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

const statusStyles = {
  scheduled: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function Appointments() {
  const { user } = useAuthStore();
  const { patients, appointments, addAppointment, updateAppointmentStatus } = useStore();
  const [doctors, setDoctors] = useState<User[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    patientId: "",
    doctorId: user?.role === "doctor" ? user.id : "",
    appointmentDate: "",
    startTime: "",
    endTime: "",
    notes: "",
  });

  useEffect(() => {
    userService
      .fetchAllUsers()
      .then((users) => setDoctors(users.filter((entry) => entry.role === "doctor")))
      .catch((error) => console.error("Error fetching doctors:", error));
  }, []);

  useEffect(() => {
    if (user?.role === "doctor") {
      setForm((current) => ({ ...current, doctorId: current.doctorId || user.id }));
    }
  }, [user]);

  const groupedAppointments = useMemo(() => {
    const sorted = [...appointments].sort((a, b) =>
      `${a.appointmentDate}T${a.startTime}`.localeCompare(`${b.appointmentDate}T${b.startTime}`)
    );

    return sorted.reduce<Record<string, typeof sorted>>((groups, appointment) => {
      if (!groups[appointment.appointmentDate]) {
        groups[appointment.appointmentDate] = [];
      }
      groups[appointment.appointmentDate].push(appointment);
      return groups;
    }, {});
  }, [appointments]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.patientId || !form.doctorId || !form.appointmentDate || !form.startTime || !form.endTime) {
      toast({
        title: "Missing details",
        description: "Choose a patient, doctor, date, and time window before saving.",
        variant: "destructive",
      });
      return;
    }

    if (form.startTime >= form.endTime) {
      toast({
        title: "Invalid time window",
        description: "End time must be later than start time.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await addAppointment(form);
      toast({
        title: "Appointment saved",
        description: `Scheduled for ${form.appointmentDate} from ${form.startTime} to ${form.endTime}.`,
      });
      setForm({
        patientId: "",
        doctorId: user?.role === "doctor" ? user.id : "",
        appointmentDate: "",
        startTime: "",
        endTime: "",
        notes: "",
      });
    } catch {
      toast({
        title: "Unable to save appointment",
        description: "Check the appointments table in Supabase and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Appointments</h2>
        <p className="text-sm text-muted-foreground">Doctors can publish dated visit windows and track scheduled patient reviews.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="shadow-sm xl:col-span-1">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-primary" />
              Create Appointment
            </h3>
            <p className="text-xs text-muted-foreground mt-1">Add the date and visit window when the doctor will be available.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="patientId">Patient</Label>
              <select
                id="patientId"
                value={form.patientId}
                onChange={(e) => handleChange("patientId", e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select patient</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="doctorId">Doctor</Label>
              <select
                id="doctorId"
                value={form.doctorId}
                onChange={(e) => handleChange("doctorId", e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                disabled={user?.role === "doctor"}
              >
                <option value="">Select doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="appointmentDate">Date</Label>
              <Input
                id="appointmentDate"
                type="date"
                value={form.appointmentDate}
                onChange={(e) => handleChange("appointmentDate", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={form.startTime}
                  onChange={(e) => handleChange("startTime", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={form.endTime}
                  onChange={(e) => handleChange("endTime", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                value={form.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Visit purpose, prep instructions, or room details"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Saving..." : "Save Appointment"}
            </button>
          </form>
        </Card>

        <div className="xl:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SummaryCard
              title="Scheduled"
              value={appointments.filter((item) => item.status === "scheduled").length}
              icon={CalendarDays}
            />
            <SummaryCard
              title="Today"
              value={appointments.filter((item) => item.appointmentDate === new Date().toISOString().split("T")[0]).length}
              icon={Clock3}
            />
            <SummaryCard
              title="Doctors"
              value={doctors.length}
              icon={Stethoscope}
            />
          </div>

          <Card className="shadow-sm">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-foreground">Scheduled Windows</h3>
              <p className="text-xs text-muted-foreground mt-1">Appointments are grouped by date so doctors can review their appearance windows quickly.</p>
            </div>

            <div className="p-6 space-y-6">
              {Object.keys(groupedAppointments).length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                  No appointments yet.
                </div>
              ) : (
                Object.entries(groupedAppointments).map(([date, items]) => (
                  <div key={date} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-foreground">{date}</h4>
                      <span className="text-xs text-muted-foreground">{items.length} scheduled</span>
                    </div>
                    <div className="space-y-3">
                      {items.map((appointment) => (
                        <div key={appointment.id} className="rounded-xl border border-border bg-card p-4">
                          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div className="space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-semibold text-foreground">{appointment.patientName ?? appointment.patientId}</p>
                                <Badge className={statusStyles[appointment.status]}>{appointment.status}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Dr. {appointment.doctorName ?? appointment.doctorId} • {appointment.startTime} - {appointment.endTime}
                              </p>
                              {appointment.notes ? (
                                <p className="text-sm text-foreground">{appointment.notes}</p>
                              ) : (
                                <p className="text-sm text-muted-foreground">No notes provided.</p>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => updateAppointmentStatus(appointment.id, "completed")}
                                disabled={appointment.status === "completed"}
                                className="rounded-md bg-green-100 px-3 py-1.5 text-xs font-medium text-green-700 disabled:opacity-60"
                              >
                                Complete
                              </button>
                              <button
                                onClick={() => updateAppointmentStatus(appointment.id, "cancelled")}
                                disabled={appointment.status === "cancelled"}
                                className="rounded-md bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 disabled:opacity-60"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="shadow-sm">
      <div className="p-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
        </div>
        <div className="rounded-lg bg-primary/10 p-3 text-primary">
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Card>
  );
}
