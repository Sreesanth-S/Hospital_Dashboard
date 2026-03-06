import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { useStore } from "@/store";
import type { Patient } from "@/types";
import { formatDistanceToNow } from "date-fns";

const col = createColumnHelper<Patient>();

const riskColors = {
  Low: "bg-risk-low/15 text-risk-low",
  Moderate: "bg-risk-moderate/15 text-risk-moderate",
  High: "bg-risk-high/15 text-risk-high",
};

export function PatientTable() {
  const { patients, searchQuery } = useStore();
  const navigate = useNavigate();

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
          return (
            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${riskColors[level]}`}>
              {level}
            </span>
          );
        },
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
          <button
            onClick={() => navigate(`/patient/${info.row.original.id}`)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            View
          </button>
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
  });

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-base font-semibold text-card-foreground">Patient Monitoring</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{filtered.length} patients being tracked</p>
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
    </div>
  );
}
