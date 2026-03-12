# Component Migration Guide - Old Store to Supabase

This guide shows how to update your components to use the new Supabase-integrated store.

## Example: Dashboard.tsx

### Before (Using Mock Data)

```typescript
import { useStore } from "@/store";
import { useCallback } from "react";

export default function Dashboard() {
  const { patients, alerts, notifications } = useStore((state) => ({
    patients: state.patients,
    alerts: state.alerts,
    notifications: state.notifications,
  }));

  const highRiskCount = patients.filter((p) => p.riskLevel === "High").length;
  const unreadAlerts = alerts.filter((a) => !a.resolved).length;

  return (
    <div>
      <h1>Dashboard</h1>
      <p>High Risk Patients: {highRiskCount}</p>
      <p>Alerts: {unreadAlerts}</p>
    </div>
  );
}
```

### After (Using Supabase)

```typescript
import { useStore } from "@/store/supabaseStore";
import { useEffect } from "react";

export default function Dashboard() {
  const { patients, alerts, isLoading, error, fetchAllPatients, fetchAllAlerts } = 
    useStore((state) => ({
      patients: state.patients,
      alerts: state.alerts,
      isLoading: state.isLoading,
      error: state.error,
      fetchAllPatients: state.fetchAllPatients,
      fetchAllAlerts: state.fetchAllAlerts,
    }));

  // Fetch data on component mount
  useEffect(() => {
    fetchAllPatients();
    fetchAllAlerts();
  }, [fetchAllPatients, fetchAllAlerts]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const highRiskCount = patients.filter((p) => p.riskLevel === "High").length;
  const unreadAlerts = alerts.filter((a) => !a.resolved).length;

  return (
    <div>
      <h1>Dashboard</h1>
      <p>High Risk Patients: {highRiskCount}</p>
      <p>Alerts: {unreadAlerts}</p>
    </div>
  );
}
```

## Example: PatientTable.tsx (Async Operations)

### Before

```typescript
export default function PatientTable() {
  const { patients, deletePatient } = useStore((state) => ({
    patients: state.patients,
    deletePatient: state.deletePatient,
  }));

  const handleDelete = (id: string) => {
    deletePatient(id); // Synchronous
  };

  return (
    <table>
      {patients.map((patient) => (
        <tr key={patient.id}>
          <td>{patient.name}</td>
          <td>
            <button onClick={() => handleDelete(patient.id)}>Delete</button>
          </td>
        </tr>
      ))}
    </table>
  );
}
```

### After

```typescript
import { useCallback } from "react";

export default function PatientTable() {
  const { patients, deletePatient } = useStore((state) => ({
    patients: state.patients,
    deletePatient: state.deletePatient,
  }));

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deletePatient(id); // Now async
      // Success toast notification
    } catch (error) {
      console.error("Failed to delete patient:", error);
      // Error toast notification
    }
  }, [deletePatient]);

  return (
    <table>
      {patients.map((patient) => (
        <tr key={patient.id}>
          <td>{patient.name}</td>
          <td>
            <button onClick={() => handleDelete(patient.id)}>Delete</button>
          </td>
        </tr>
      ))}
    </table>
  );
}
```

## Example: UpdatePatientForm.tsx (Form Submission)

### Before

```typescript
export default function UpdatePatientForm({ patientId }: { patientId: string }) {
  const { updatePatient } = useStore();

  const handleSubmit = (data: NewPatientInput) => {
    updatePatient(patientId, data);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
    </form>
  );
}
```

### After

```typescript
import { useState } from "react";
import { useStore } from "@/store/supabaseStore";

export default function UpdatePatientForm({ patientId }: { patientId: string }) {
  const { updatePatient } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: NewPatientInput) => {
    try {
      setIsLoading(true);
      setError(null);
      await updatePatient(patientId, data);
      // Show success toast
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update patient";
      setError(message);
      // Show error toast
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit(formData);
    }}>
      {/* form fields */}
      {error && <div className="text-red-500">{error}</div>}
      <button disabled={isLoading}>
        {isLoading ? "Updating..." : "Update"}
      </button>
    </form>
  );
}
```

## Example: PatientProfile.tsx (Detailed Data)

### Before

```typescript
export default function PatientProfile({ patientId }: Props) {
  const { patients, updateDoctorNotes } = useStore();
  const patient = patients.find((p) => p.id === patientId);

  const handleNotesChange = (notes: string) => {
    updateDoctorNotes(patientId, notes);
  };

  return <div>{patient?.name}</div>;
}
```

### After

```typescript
import { useEffect, useCallback } from "react";
import { useStore } from "@/store/supabaseStore";

export default function PatientProfile({ patientId }: Props) {
  const { patients, updateDoctorNotes, fetchAllPatients } = useStore();
  const patient = patients.find((p) => p.id === patientId);

  // Load data on mount
  useEffect(() => {
    fetchAllPatients();
  }, [fetchAllPatients]);

  const handleNotesChange = useCallback(async (notes: string) => {
    try {
      await updateDoctorNotes(patientId, notes);
    } catch (error) {
      console.error("Failed to update notes:", error);
    }
  }, [patientId, updateDoctorNotes]);

  if (!patient) return <div>Patient not found</div>;

  return <div>{patient.name}</div>;
}
```

## Key Differences Summary

| Aspect | Old Store | Supabase Store |
|--------|-----------|----------------|
| Import | `@/store` | `@/store/supabaseStore` |
| Data | In-memory arrays | Fetched from Supabase |
| Operations | Synchronous | Async (with await) |
| Initial Load | Auto (mock data) | Manual via `fetchAll*()` or `initializeData()` |
| Loading State | Not available | `state.isLoading` |
| Error State | Not available | `state.error` |
| Persistence | Lost on refresh | Saved to database |
| Real-time | Not available | Available via subscriptions |

## Best Practices

1. **Always use async/await** for mutations:
   ```typescript
   await store.addPatient(data);
   await store.updatePatient(id, data);
   ```

2. **Handle errors gracefully**:
   ```typescript
   try {
     await store.updatePatient(id, data);
   } catch (error) {
     showErrorToast(error.message);
   }
   ```

3. **Show loading states**:
   ```typescript
   const isLoading = useStore((state) => state.isLoading);
   return <button disabled={isLoading}>Save</button>;
   ```

4. **Fetch data on mount**:
   ```typescript
   useEffect(() => {
     const { fetchAllPatients } = useStore.getState();
     fetchAllPatients();
   }, []);
   ```

5. **Use queries for complex filters**:
   ```typescript
   const highRiskPatients = patients.filter(p => p.riskLevel === "High");
   ```

## Component Checklist

- [ ] Import from `@/store/supabaseStore`
- [ ] Add async/await to all operations
- [ ] Handle loading states with `isLoading`
- [ ] Handle errors with try/catch
- [ ] Call fetch methods on component mount
- [ ] Update UI to show loading/error states
- [ ] Test data persistence (refresh browser)

---

Once you update all components, your app will be fully connected to Supabase! 🎉
