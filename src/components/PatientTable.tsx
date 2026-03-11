import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from "@tanstack/react-table";
import { Eye, Trash2 } from "lucide-react";
import { useStore } from "@/store";
import type { Patient } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { PatientRegistrationForm } from "@/components/PatientRegistrationForm";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";

const col = createColumnHelper<Patient>();

const riskColors = {
  Low: "bg-risk-low/15 text-risk-low",
  Moderate: "bg-risk-moderate/15 text-risk-moderate",
  High: "bg-risk-high/15 text-risk-high",
};

// Calculate risk score (average of all risk factors)
function calculateRiskScore(patient: Patient): number {
  return Math.round((patient.preeclampsiaRisk + patient.hypertensionRisk + patient.stressRisk) / 3);
}

export function PatientTable() {
  const { patients, searchQuery, deletePatient } = useStore();
  const navigate = useNavigate();
  const [deleteTarget, setDeleteTarget] = useState<Patient | null>(null);
  
  // Default sorting: by risk level (High > Moderate > Low) with high risk first, then by risk score (descending)
  const [sorting, setSorting] = useState<SortingState>([
    { id: "riskLevel", desc: false },
  ]);

  const columns = useMemo(
    () => [
      col.accessor("name", {
        header: "Patient Name",
        cell: (info) => <span className="font-semibold text-foreground">{info.getValue()}</span>,
      }),
      col.accessor("age", { header: "Age" }),
      col.accessor("pregnancyWeek", {
        header: "Week",
        cell: (info) => <span>{info.getValue()}w</span>,
      }),
      col.accessor("bloodPressure", { header: "BP" }),
      col.accessor("heartRate", {
        header: "HR",
        cell: (info) => <span>{info.getValue()} bpm</span>,
      }),
      col.accessor("riskLevel", {
        header: "Risk",
        cell: (info) => {
          const level = info.getValue();
          const patient = info.row.original;
          const score = calculateRiskScore(patient);
          return (
            <div className="flex flex-col gap-1">
              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${riskColors[level]}`}>
                {level}
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                Score: {score}%
              </span>
            </div>
          );
        },
        sortingFn: (a, b) => {
          // Custom sorting: High > Moderate > Low
          const riskOrder = { High: 3, Moderate: 2, Low: 1 };
          const riskDiff = riskOrder[b.original.riskLevel] - riskOrder[a.original.riskLevel];
          
          // If same risk level, sort by risk score
          if (riskDiff === 0) {
            return calculateRiskScore(b.original) - calculateRiskScore(a.original);
          }
          return riskDiff;
        },
      }),
      // Hidden column for risk score sorting
      col.accessor((row) => calculateRiskScore(row), {
        id: "riskScore",
        header: "",
        cell: (info) => null,
        enableSorting: true,
      }),
      col.accessor("lastUpdated", {
        header: "Updated",
        cell: (info) => (
          <span className="text-muted-foreground text-xs">
            {formatDistanceToNow(new Date(info.getValue()), { addSuffix: true })}
          </span>
        ),
      }),
      col.display({
        id: "actions",
        header: "Actions",
        cell: (info) => (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => navigate(`/patient/${info.row.original.id}`)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              View
            </button>
            <button
              onClick={() => setDeleteTarget(info.row.original)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-medium hover:bg-destructive/20 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ),
      }),
    ],
    [navigate]
  );

  const filtered = useMemo(
    () =>
      patients.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [patients, searchQuery]
  );

  const table = useReactTable({
    data: filtered,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
    },
    onSortingChange: setSorting,
  });

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-card-foreground">Patient Monitoring</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{filtered.length} patients being tracked</p>
        </div>
        <PatientRegistrationForm />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-border bg-muted/50">
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Patient</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <span className="font-semibold">{deleteTarget?.name}</span> from the system? This action cannot be undone and will also remove associated alerts.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) {
                  deletePatient(deleteTarget.id);
                  toast({ title: "Patient removed", description: `${deleteTarget.name} has been deleted.` });
                  setDeleteTarget(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
