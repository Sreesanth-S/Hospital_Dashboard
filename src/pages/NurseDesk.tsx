import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PatientRegistrationForm } from "@/components/PatientRegistrationForm";
import { useAuthStore } from "@/store/auth";
import Appointments from "./Appointments";

export default function NurseDesk() {
  const { user } = useAuthStore();

  if (user?.role !== "nurse") {
    return (
      <Card className="shadow-sm">
        <div className="p-8 text-center text-sm text-muted-foreground">
          This workspace is available to nurse accounts only.
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Nurse Desk</h2>
        <p className="text-sm text-muted-foreground">Handle patient intake and appointment scheduling from one nurse workspace.</p>
      </div>

      <Tabs defaultValue="patients" className="space-y-4">
        <TabsList>
          <TabsTrigger value="patients">Add Patients</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
        </TabsList>

        <TabsContent value="patients">
          <Card className="shadow-sm">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-foreground">Add Patient</h3>
              <p className="text-xs text-muted-foreground mt-1">Register a new patient from the nurse intake desk.</p>
            </div>
            <div className="p-6">
              <PatientRegistrationForm />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="appointments">
          <Appointments />
        </TabsContent>
      </Tabs>
    </div>
  );
}
