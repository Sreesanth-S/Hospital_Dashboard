import { useState, useMemo } from "react";
import { AlertTriangle, TrendingUp, ActivitySquare, Zap, Search } from "lucide-react";
import { useStore } from "@/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Cell, ScatterChart, Scatter
} from "recharts";

export default function RiskAssessment() {
  const { patients } = useStore();
  const [selectedPatient, setSelectedPatient] = useState(patients[0]);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPatients = useMemo(
    () =>
      patients.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [patients, searchQuery]
  );

  const getRiskColor = (percentage: number) => {
    if (percentage >= 70) return { bg: "bg-red-500", light: "bg-red-50", text: "text-red-700" };
    if (percentage >= 40) return { bg: "bg-yellow-500", light: "bg-yellow-50", text: "text-yellow-700" };
    return { bg: "bg-green-500", light: "bg-green-50", text: "text-green-700" };
  };

  const getClinicialRecommendation = (risk: number) => {
    if (risk >= 70) {
      return {
        level: "Critical",
        recommendation: "Immediate clinical evaluation and intervention required. Schedule urgent specialist consultation.",
        color: "text-red-600",
        bgColor: "bg-red-50",
      };
    }
    if (risk >= 40) {
      return {
        level: "High",
        recommendation: "Close monitoring recommended. Schedule follow-up within 48 hours with healthcare provider.",
        color: "text-amber-600",
        bgColor: "bg-amber-50",
      };
    }
    return {
      level: "Moderate",
      recommendation: "Routine monitoring. Continue with scheduled check-ups and prenatal care.",
      color: "text-green-600",
      bgColor: "bg-green-50",
    };
  };

  const overallRisk = useMemo(() => {
    if (!selectedPatient) return 0;
    return Math.round(
      (selectedPatient.preeclampsiaRisk +
        selectedPatient.hypertensionRisk +
        selectedPatient.stressRisk) /
        3
    );
  }, [selectedPatient]);

  const riskComparison = useMemo(() => {
    return patients.map((p) => ({
      name: p.name.split(" ")[0],
      preeclampsia: p.preeclampsiaRisk,
      hypertension: p.hypertensionRisk,
      stress: p.stressRisk,
      overall: (p.preeclampsiaRisk + p.hypertensionRisk + p.stressRisk) / 3,
    }));
  }, [patients]);

  const riskDistribution = [
    {
      name: "Low Risk",
      value: patients.filter((p) => {
        const risk = (p.preeclampsiaRisk + p.hypertensionRisk + p.stressRisk) / 3;
        return risk < 35;
      }).length,
      color: "#22c55e",
    },
    {
      name: "Moderate Risk",
      value: patients.filter((p) => {
        const risk = (p.preeclampsiaRisk + p.hypertensionRisk + p.stressRisk) / 3;
        return risk >= 35 && risk < 65;
      }).length,
      color: "#eab308",
    },
    {
      name: "High Risk",
      value: patients.filter((p) => {
        const risk = (p.preeclampsiaRisk + p.hypertensionRisk + p.stressRisk) / 3;
        return risk >= 65;
      }).length,
      color: "#ef4444",
    },
  ];

  const highRiskPatients = patients.filter((p) => {
    const risk = (p.preeclampsiaRisk + p.hypertensionRisk + p.stressRisk) / 3;
    return risk >= 65;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Risk Assessment</h2>
        <p className="text-sm text-muted-foreground">
          Comprehensive risk analysis and clinical recommendations for all patients
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Patient List */}
        <div className="lg:col-span-1">
          <Card className="shadow-sm">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-foreground mb-3">Patients</h3>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 text-sm"
                />
              </div>
            </div>

            <div className="divide-y max-h-[600px] overflow-y-auto">
              {filteredPatients.map((patient) => {
                const risk = (patient.preeclampsiaRisk + patient.hypertensionRisk + patient.stressRisk) / 3;
                const colors = getRiskColor(risk);
                return (
                  <button
                    key={patient.id}
                    onClick={() => setSelectedPatient(patient)}
                    className={`w-full p-3 text-left transition-colors hover:bg-muted ${
                      selectedPatient?.id === patient.id ? "bg-primary/10 border-l-2 border-l-primary" : ""
                    }`}
                  >
                    <p className="font-medium text-sm text-foreground">{patient.name}</p>
                    <p className="text-xs text-muted-foreground">{patient.id}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${colors.bg}`}
                          style={{ width: `${Math.min(risk, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-foreground">{Math.round(risk)}%</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Detailed Risk Analysis */}
        <div className="lg:col-span-3 space-y-4">
          {selectedPatient && (
            <>
              {/* Overall Risk Score */}
              <Card className="shadow-sm">
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Side - Risk Gauge */}
                    <div className="flex flex-col items-center justify-center">
                      <div className="relative w-32 h-32">
                        {/* Gauge Background */}
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                          <defs>
                            <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#22c55e" />
                              <stop offset="50%" stopColor="#eab308" />
                              <stop offset="100%" stopColor="#ef4444" />
                            </linearGradient>
                          </defs>
                          <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="url(#riskGradient)"
                            strokeWidth="8"
                            strokeDasharray={`${(overallRisk / 100) * 282.7} 282.7`}
                            strokeLinecap="round"
                            transform="rotate(-90 50 50)"
                          />
                          <text x="50" y="45" textAnchor="middle" className="text-3xl font-bold" fill="currentColor">
                            {overallRisk}%
                          </text>
                          <text x="50" y="65" textAnchor="middle" className="text-xs" fill="currentColor">
                            Overall Risk
                          </text>
                        </svg>
                      </div>
                    </div>

                    {/* Right Side - Patient Info */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-bold text-foreground">{selectedPatient.name}</h3>
                        <p className="text-sm text-muted-foreground">{selectedPatient.id}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Age</p>
                          <p className="text-lg font-semibold text-foreground">{selectedPatient.age} yrs</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Pregnancy Week</p>
                          <p className="text-lg font-semibold text-foreground">{selectedPatient.pregnancyWeek}w</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Blood Pressure</p>
                          <p className="text-lg font-semibold text-foreground">{selectedPatient.bloodPressure}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Heart Rate</p>
                          <p className="text-lg font-semibold text-foreground">{selectedPatient.heartRate} bpm</p>
                        </div>
                      </div>

                      <Badge className={getRiskColor(overallRisk).text}>
                        {overallRisk >= 70 ? "Critical Risk" : overallRisk >= 40 ? "High Risk" : "Moderate Risk"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Individual Risk Factors */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    label: "Preeclampsia Risk",
                    value: selectedPatient.preeclampsiaRisk,
                    icon: AlertTriangle,
                  },
                  {
                    label: "Hypertension Risk",
                    value: selectedPatient.hypertensionRisk,
                    icon: TrendingUp,
                  },
                  {
                    label: "Stress Risk",
                    value: selectedPatient.stressRisk,
                    icon: Zap,
                  },
                ].map((factor, idx) => {
                  const colors = getRiskColor(factor.value);
                  const Icon = factor.icon;
                  return (
                    <Card key={idx} className={`${colors.light} shadow-sm`}>
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-xs text-muted-foreground font-medium">{factor.label}</p>
                            <p className={`text-2xl font-bold mt-1 ${colors.text}`}>{factor.value}%</p>
                          </div>
                          <Icon className={`w-5 h-5 ${colors.text}`} />
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${colors.bg}`}
                            style={{ width: `${Math.min(factor.value, 100)}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {factor.value >= 70 ? "Critical" : factor.value >= 40 ? "High" : "Moderate"}
                        </p>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Clinical Recommendation */}
              <Card className="shadow-sm">
                <div className="p-6">
                  <h4 className="font-semibold text-foreground mb-3">Clinical Recommendation</h4>
                  <div className={`p-4 rounded-lg ${getClinicialRecommendation(overallRisk).bgColor}`}>
                    <p className={`font-semibold ${getClinicialRecommendation(overallRisk).color}`}>
                      {getClinicialRecommendation(overallRisk).level} Risk Level
                    </p>
                    <p className={`text-sm mt-2 ${getClinicialRecommendation(overallRisk).color}`}>
                      {getClinicialRecommendation(overallRisk).recommendation}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Risk Progression Chart */}
              <Card className="shadow-sm">
                <div className="p-4 border-b">
                  <h4 className="font-semibold text-foreground">Risk Score Progression</h4>
                </div>
                <div className="p-4">
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={selectedPatient.riskHistory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        dot={{ fill: "#f59e0b", r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Risk Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution */}
        <Card className="shadow-sm">
          <div className="p-4 border-b">
            <h4 className="font-semibold text-foreground">Risk Distribution</h4>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {riskDistribution.map((item, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{item.name}</span>
                    <span className="text-sm font-bold text-foreground">{item.value}</span>
                  </div>
                  <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full"
                      style={{ width: `${(item.value / patients.length) * 100}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* High Risk Patients Alert */}
        <Card className="shadow-sm">
          <div className="p-4 border-b">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" /> Critical Alert
            </h4>
          </div>
          <div className="p-4 space-y-3 max-h-[300px] overflow-y-auto">
            {highRiskPatients.length > 0 ? (
              highRiskPatients.map((patient) => {
                const risk = Math.round(
                  (patient.preeclampsiaRisk + patient.hypertensionRisk + patient.stressRisk) / 3
                );
                return (
                  <div
                    key={patient.id}
                    className="p-3 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-sm text-red-900">{patient.name}</p>
                        <p className="text-xs text-red-700 mt-1">{patient.id}</p>
                        <p className="text-xs text-red-600 mt-1">Weeks: {patient.pregnancyWeek}</p>
                      </div>
                      <Badge className="bg-red-600 hover:bg-red-700">{risk}%</Badge>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No high-risk patients detected
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Patient Risk Comparison */}
      <Card className="shadow-sm">
        <div className="p-4 border-b">
          <h4 className="font-semibold text-foreground">All Patients Risk Comparison</h4>
        </div>
        <div className="p-4">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={riskComparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="preeclampsia" fill="#ef4444" name="Preeclampsia" />
              <Bar dataKey="hypertension" fill="#f59e0b" name="Hypertension" />
              <Bar dataKey="stress" fill="#3b82f6" name="Stress" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
