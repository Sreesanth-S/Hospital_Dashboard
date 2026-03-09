import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserPlus } from "lucide-react";
import { useStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

const schema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  age: z.coerce.number().int().min(16, "Minimum age is 16").max(55, "Maximum age is 55"),
  bloodGroup: z.string().min(1, "Select a blood group"),
  pregnancyWeek: z.coerce.number().int().min(1, "Minimum week is 1").max(42, "Maximum week is 42"),
  weightKg: z.coerce.number().min(30, "Minimum weight is 30kg").max(200, "Maximum weight is 200kg"),
  symptoms: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof schema>;

const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

export function PatientRegistrationForm() {
  const [open, setOpen] = useState(false);
  const addPatient = useStore((s) => s.addPatient);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", age: undefined as any, bloodGroup: "", pregnancyWeek: undefined as any, weightKg: undefined as any, symptoms: "" },
  });

  const onSubmit = (values: FormValues) => {
    const symptoms = values.symptoms
      ? values.symptoms.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    addPatient({
      name: values.name,
      age: values.age,
      bloodGroup: values.bloodGroup,
      pregnancyWeek: values.pregnancyWeek,
      weightKg: values.weightKg,
      symptoms,
    });
    toast({ title: "Patient registered", description: `${values.name} has been added successfully.` });
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <UserPlus className="w-4 h-4" />
          Add Patient
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Register New Patient</DialogTitle>
          <DialogDescription>Enter the patient's details below to add them to the monitoring system.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl><Input placeholder="e.g. Jane Doe" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="age" render={({ field }) => (
                <FormItem>
                  <FormLabel>Age</FormLabel>
                  <FormControl><Input type="number" placeholder="28" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="bloodGroup" render={({ field }) => (
                <FormItem>
                  <FormLabel>Blood Group</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {bloodGroups.map((bg) => (
                        <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="pregnancyWeek" render={({ field }) => (
                <FormItem>
                  <FormLabel>Pregnancy Week</FormLabel>
                  <FormControl><Input type="number" placeholder="12" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="weightKg" render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight (kg)</FormLabel>
                  <FormControl><Input type="number" step="0.1" placeholder="65" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="symptoms" render={({ field }) => (
              <FormItem>
                <FormLabel>Symptoms (comma-separated)</FormLabel>
                <FormControl><Textarea placeholder="e.g. Headache, Nausea" rows={2} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <Button type="submit" className="w-full">Register Patient</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
