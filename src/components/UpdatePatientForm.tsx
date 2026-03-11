import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Edit } from "lucide-react";
import { useStore } from "@/store";
import type { Patient } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
  heightCm: z.coerce.number().min(140, "Minimum height is 140cm").max(220, "Maximum height is 220cm"),
  systolic: z.coerce.number().int().min(60, "Systolic must be at least 60").max(200, "Systolic must not exceed 200"),
  diastolic: z.coerce.number().int().min(30, "Diastolic must be at least 30").max(120, "Diastolic must not exceed 120"),
  heartRate: z.coerce.number().int().min(40, "Heart rate must be at least 40").max(120, "Heart rate must not exceed 120"),
  gravida: z.coerce.number().int().min(0, "Gravida must be 0 or more").max(20, "Invalid gravida value"),
  sleepHours: z.coerce.number().min(0, "Sleep hours must be 0 or more").max(24, "Sleep hours must not exceed 24"),
  headache: z.boolean().default(false),
  swellingFace: z.boolean().default(false),
  swellingHand: z.boolean().default(false),
  swellingFeet: z.boolean().default(false),
  preeclampsiaHistory: z.boolean().default(false),
  preeclampsiaFamilyHistory: z.boolean().default(false),
  preeclampsiaFamilyRelationship: z.string().optional(),
  symptoms: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof schema>;

const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const familyRelationships = ["Mother", "Sister", "Grandmother", "Aunt", "Cousin"];

export function UpdatePatientForm({ patient }: { patient: Patient }) {
  const [open, setOpen] = useState(false);
  const [bmi, setBmi] = useState<number | null>(null);
  const updatePatient = useStore((s) => s.updatePatient);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: patient.name,
      age: patient.age,
      bloodGroup: patient.bloodGroup,
      pregnancyWeek: patient.pregnancyWeek,
      weightKg: patient.weightKg,
      heightCm: patient.heightCm,
      systolic: parseInt(patient.bloodPressure.split("/")[0]),
      diastolic: parseInt(patient.bloodPressure.split("/")[1]),
      heartRate: patient.heartRate,
      gravida: patient.gravida,
      sleepHours: patient.sleepHours,
      headache: patient.headache,
      swellingFace: patient.swelling.face,
      swellingHand: patient.swelling.hand,
      swellingFeet: patient.swelling.feet,
      preeclampsiaHistory: patient.preeclampsiaHistory,
      preeclampsiaFamilyHistory: patient.preeclampsiaFamilyHistory,
      preeclampsiaFamilyRelationship: patient.preeclampsiaFamilyRelationship,
      symptoms: patient.symptoms.join(", "),
    },
  });

  // Watch weight and height to calculate BMI
  const weightKg = form.watch("weightKg");
  const heightCm = form.watch("heightCm");

  const calculateBMI = (weight: number, height: number) => {
    if (weight && height) {
      const heightM = height / 100;
      const calculatedBmi = weight / (heightM * heightM);
      setBmi(parseFloat(calculatedBmi.toFixed(1)));
    }
  };

  useEffect(() => {
    calculateBMI(patient.weightKg, patient.heightCm);
  }, [patient]);

  const preeclampsiaFamilyHistory = form.watch("preeclampsiaFamilyHistory");

  const onSubmit = (values: FormValues) => {
    const symptoms = values.symptoms
      ? values.symptoms.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    // Validate systolic > diastolic
    if (values.systolic <= values.diastolic) {
      toast({ title: "Error", description: "Systolic BP must be greater than Diastolic BP", variant: "destructive" });
      return;
    }

    updatePatient(patient.id, {
      name: values.name,
      age: values.age,
      bloodGroup: values.bloodGroup,
      pregnancyWeek: values.pregnancyWeek,
      weightKg: values.weightKg,
      heightCm: values.heightCm,
      systolic: values.systolic,
      diastolic: values.diastolic,
      heartRate: values.heartRate,
      gravida: values.gravida,
      sleepHours: values.sleepHours,
      headache: values.headache,
      swelling: {
        face: values.swellingFace,
        hand: values.swellingHand,
        feet: values.swellingFeet,
      },
      preeclampsiaHistory: values.preeclampsiaHistory,
      preeclampsiaFamilyHistory: values.preeclampsiaFamilyHistory,
      preeclampsiaFamilyRelationship: values.preeclampsiaFamilyRelationship,
      symptoms,
    });
    toast({ title: "Success", description: `${values.name}'s details have been updated.` });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5">
          <Edit className="w-4 h-4" />
          Edit Details
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Patient Information</DialogTitle>
          <DialogDescription>Edit the patient's comprehensive medical details below.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information Section */}
            <div className="border-b pb-4">
              <h3 className="font-semibold text-sm mb-4 text-foreground">Basic Information</h3>
              <div className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl><Input placeholder="e.g. Jane Doe" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-3 gap-4">
                  <FormField control={form.control} name="age" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age (years)</FormLabel>
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
                  <FormField control={form.control} name="gravida" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gravida (# of pregnancies)</FormLabel>
                      <FormControl><Input type="number" placeholder="1" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>
            </div>

            {/* Pregnancy Information Section */}
            <div className="border-b pb-4">
              <h3 className="font-semibold text-sm mb-4 text-foreground">Pregnancy Information</h3>
              <div className="space-y-4">
                <FormField control={form.control} name="pregnancyWeek" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gestational Week</FormLabel>
                    <FormControl><Input type="number" placeholder="12" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>

            {/* Anthropometric Data Section */}
            <div className="border-b pb-4">
              <h3 className="font-semibold text-sm mb-4 text-foreground">Anthropometric Data</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="heightCm" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Height (cm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="165"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            calculateBMI(weightKg, parseFloat(e.target.value));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="weightKg" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (kg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="65"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            calculateBMI(parseFloat(e.target.value), heightCm);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                {bmi !== null && (
                  <div className="p-3 bg-secondary rounded-lg">
                    <p className="text-sm font-semibold text-foreground">
                      BMI: <span className="text-primary">{bmi}</span> kg/m²
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal weight" : bmi < 30 ? "Overweight" : "Obese"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Vital Signs Section */}
            <div className="border-b pb-4">
              <h3 className="font-semibold text-sm mb-4 text-foreground">Vital Signs</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <FormField control={form.control} name="systolic" render={({ field }) => (
                    <FormItem>
                      <FormLabel>BP Systolic (mmHg)</FormLabel>
                      <FormControl><Input type="number" placeholder="120" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="diastolic" render={({ field }) => (
                    <FormItem>
                      <FormLabel>BP Diastolic (mmHg)</FormLabel>
                      <FormControl><Input type="number" placeholder="80" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="heartRate" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Heart Rate (bpm)</FormLabel>
                      <FormControl><Input type="number" placeholder="72" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>
            </div>

            {/* Clinical Symptoms Section */}
            <div className="border-b pb-4">
              <h3 className="font-semibold text-sm mb-4 text-foreground">Clinical Symptoms</h3>
              <div className="space-y-4">
                <FormField control={form.control} name="headache" render={({ field }) => (
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="cursor-pointer">Headache</FormLabel>
                  </FormItem>
                )} />

                <div>
                  <FormLabel className="text-sm font-semibold mb-2 block">Swelling (select all that apply)</FormLabel>
                  <div className="space-y-2 ml-4">
                    <FormField control={form.control} name="swellingFace" render={({ field }) => (
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="cursor-pointer">Face</FormLabel>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="swellingHand" render={({ field }) => (
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="cursor-pointer">Hand</FormLabel>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="swellingFeet" render={({ field }) => (
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="cursor-pointer">Feet</FormLabel>
                      </FormItem>
                    )} />
                  </div>
                </div>

                <FormField control={form.control} name="sleepHours" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sleep Hours (per day)</FormLabel>
                    <FormControl><Input type="number" step="0.5" placeholder="8" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="symptoms" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Other Symptoms (comma-separated)</FormLabel>
                    <FormControl><Textarea placeholder="e.g. Nausea, Dizziness" rows={2} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>

            {/* Medical History Section */}
            <div className="border-b pb-4">
              <h3 className="font-semibold text-sm mb-4 text-foreground">Medical History</h3>
              <div className="space-y-4">
                <FormField control={form.control} name="preeclampsiaHistory" render={({ field }) => (
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="cursor-pointer">History of Preeclampsia</FormLabel>
                  </FormItem>
                )} />

                <FormField control={form.control} name="preeclampsiaFamilyHistory" render={({ field }) => (
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="cursor-pointer">Family History of Preeclampsia</FormLabel>
                  </FormItem>
                )} />

                {preeclampsiaFamilyHistory && (
                  <FormField control={form.control} name="preeclampsiaFamilyRelationship" render={({ field }) => (
                    <FormItem className="ml-6">
                      <FormLabel>Family Member Relationship</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select relationship" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {familyRelationships.map((rel) => (
                            <SelectItem key={rel} value={rel}>{rel}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1">Update Patient</Button>
              <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
