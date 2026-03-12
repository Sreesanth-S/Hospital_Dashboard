import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, FileText, TrendingUp, UserRoundSearch } from "lucide-react";
import { useStore } from "@/store/supabaseStore";
import type { Patient } from "@/types";
import { formatDistanceToNow } from "date-fns";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function Patients() {
  const { patients } = useStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const filteredPatients = useMemo(
    () =>
      patients.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [patients, searchQuery]
  );

  useEffect(() => {
    if (!selectedPatient) {
      return;
    }

    const currentPatient = patients.find((patient) => patient.id === selectedPatient.id);
    const visiblePatient = filteredPatients.find((patient) => patient.id === selectedPatient.id);

    if (!currentPatient || !visiblePatient) {
      setSelectedPatient(null);
      return;
    }

    if (currentPatient !== selectedPatient) {
      setSelectedPatient(currentPatient);
    }
  }, [filteredPatients, patients, selectedPatient]);

  const getRiskBgColor = (level: string) => {
    switch (level) {
      case "Low":
        return "bg-green-50 border-green-200";
      case "Moderate":
        return "bg-yellow-50 border-yellow-200";
      case "High":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50";
    }
  };

  const getRiskTextColor = (level: string) => {
    switch (level) {
      case "Low":
        return "text-green-700 bg-green-100";
      case "Moderate":
        return "text-yellow-700 bg-yellow-100";
      case "High":
        return "text-red-700 bg-red-100";
      default:
        return "text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Patients</h2>
        <p className="text-sm text-muted-foreground">Browse all patients and view their medical reports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Patients List */}
        <div className="lg:col-span-2">
          <Card className="shadow-sm">
            <div className="p-6 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or patient ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Showing {filteredPatients.length} of {patients.length} patients
              </p>
            </div>

            <div className="divide-y max-h-[600px] overflow-y-auto">
              {filteredPatients.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  No patients found matching your search
                </div>
              ) : (
                filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    onClick={() => setSelectedPatient(patient)}
                    className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 border-l-4 ${
                      selectedPatient?.id === patient.id ? "bg-muted border-l-primary" : "border-l-transparent"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{patient.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{patient.id}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">
                            Age: {patient.age}
                          </span>
                          <span className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">
                            Week {patient.pregnancyWeek}
                          </span>
                          <Badge className={getRiskTextColor(patient.riskLevel)} variant="default">
                            {patient.riskLevel}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Patient Details & Report */}
        <div className="lg:col-span-2">
          {selectedPatient ? (
            <div className="space-y-4">
              {/* Basic Details Card */}
              <Card className={`${getRiskBgColor(selectedPatient.riskLevel)} border shadow-sm`}>
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-foreground">{selectedPatient.name}</h3>
                        <Badge className={getRiskTextColor(selectedPatient.riskLevel)}>
                          {selectedPatient.riskLevel} Risk
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">ID: {selectedPatient.id}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-lg font-bold text-primary-foreground">
                      {selectedPatient.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Age</p>
                      <p className="text-lg font-semibold text-foreground">{selectedPatient.age} years</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Blood Group</p>
                      <p className="text-lg font-semibold text-foreground">{selectedPatient.bloodGroup}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Pregnancy Week</p>
                      <p className="text-lg font-semibold text-foreground">{selectedPatient.pregnancyWeek}w</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Weight</p>
                      <p className="text-lg font-semibold text-foreground">{selectedPatient.weightKg} kg</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Current Vital Signs */}
              <Card className="shadow-sm">
                <div className="p-4 border-b">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> Current Vital Signs
                  </h4>
                </div>
                <div className="p-4 grid grid-cols-2 gap-3">
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">Blood Pressure</p>
                    <p className="text-base font-bold text-foreground">{selectedPatient.bloodPressure}</p>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">Heart Rate</p>
                    <p className="text-base font-bold text-foreground">{selectedPatient.heartRate} bpm</p>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">Follow-up Date</p>
                    <p className="text-base font-bold text-foreground">{selectedPatient.followUp}</p>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">Last Updated</p>
                    <p className="text-xs font-bold text-foreground">
                      {formatDistanceToNow(new Date(selectedPatient.lastUpdated), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Risk Factors */}
              <Card className="shadow-sm">
                <div className="p-4 border-b">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Risk Factors
                  </h4>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm text-muted-foreground">Preeclampsia Risk</p>
                      <span className="text-sm font-bold text-foreground">{selectedPatient.preeclampsiaRisk}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-red-500 h-2 rounded-full"
                        style={{ width: `${selectedPatient.preeclampsiaRisk}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm text-muted-foreground">Hypertension Risk</p>
                      <span className="text-sm font-bold text-foreground">{selectedPatient.hypertensionRisk}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-red-500 h-2 rounded-full"
                        style={{ width: `${selectedPatient.hypertensionRisk}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm text-muted-foreground">Stress Risk</p>
                      <span className="text-sm font-bold text-foreground">{selectedPatient.stressRisk}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-red-500 h-2 rounded-full"
                        style={{ width: `${selectedPatient.stressRisk}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Symptoms */}
              {selectedPatient.symptoms.length > 0 && (
                <Card className="shadow-sm">
                  <div className="p-4 border-b">
                    <h4 className="font-semibold text-foreground">Current Symptoms</h4>
                  </div>
                  <div className="p-4 flex flex-wrap gap-2">
                    {selectedPatient.symptoms.map((symptom, i) => (
                      <Badge key={i} variant="secondary">
                        {symptom}
                      </Badge>
                    ))}
                  </div>
                </Card>
              )}

              {/* Action Button */}
              <button
                onClick={() => navigate(`/patient/${selectedPatient.id}`)}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                View Full Profile
              </button>
            </div>
          ) : (
            <Card className="min-h-[600px] shadow-sm">
              <div className="flex h-full min-h-[600px] flex-col items-center justify-center px-8 text-center">
                <div className="mb-5 rounded-full bg-primary/10 p-4 text-primary">
                  <UserRoundSearch className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">No Patient Selected</h3>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  Select a patient from the list to view clinical details, current vitals, and medical reports.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Medical History Charts - shown when patient is selected */}
      {selectedPatient && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Medical History</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Blood Pressure Trend */}
            <Card className="shadow-sm">
              <div className="p-4 border-b">
                <h4 className="font-semibold text-foreground">Blood Pressure Trend</h4>
              </div>
              <div className="p-4">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={selectedPatient.bpHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" label={{ value: "Week", position: "insideBottomRight", offset: -5 }} />
                    <YAxis label={{ value: "mmHg", angle: -90, position: "insideLeft" }} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="systolic"
                      stroke="#e74c3c"
                      name="Systolic"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="diastolic"
                      stroke="#3498db"
                      name="Diastolic"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Weight Trend */}
            <Card className="shadow-sm">
              <div className="p-4 border-b">
                <h4 className="font-semibold text-foreground">Weight Trend</h4>
              </div>
              <div className="p-4">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={selectedPatient.weightHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" label={{ value: "Week", position: "insideBottomRight", offset: -5 }} />
                    <YAxis label={{ value: "kg", angle: -90, position: "insideLeft" }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="#27ae60"
                      name="Weight (kg)"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Risk Score Trend */}
            <Card className="shadow-sm">
              <div className="p-4 border-b">
                <h4 className="font-semibold text-foreground">Risk Score Trend</h4>
              </div>
              <div className="p-4">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={selectedPatient.riskHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" label={{ value: "Week", position: "insideBottomRight", offset: -5 }} />
                    <YAxis label={{ value: "Score", angle: -90, position: "insideLeft" }} domain={[0, 100]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#f39c12"
                      name="Risk Score"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Doctor Notes */}
            <Card className="shadow-sm">
              <div className="p-4 border-b">
                <h4 className="font-semibold text-foreground">Doctor Notes</h4>
              </div>
              <div className="p-4">
                {selectedPatient.doctorNotes ? (
                  <p className="text-sm text-foreground whitespace-pre-wrap">{selectedPatient.doctorNotes}</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No notes added yet</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
