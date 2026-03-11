import type { Patient, RiskLevel } from "@/types";

/**
 * Calculate risk level based on individual risk factors
 * Ensures consistency across the application
 */
export function calculateRiskLevel(
  preeclampsiaRisk: number,
  hypertensionRisk: number,
  stressRisk: number
): RiskLevel {
  const avgRisk = (preeclampsiaRisk + hypertensionRisk + stressRisk) / 3;
  return avgRisk > 55 ? "High" : avgRisk > 30 ? "Moderate" : "Low";
}

/**
 * Validate patient data is within acceptable ranges
 */
export function validatePatientData(data: Partial<Patient>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (data.age !== undefined) {
    if (data.age < 16) errors.push("Age must be at least 16");
    if (data.age > 55) errors.push("Age must not exceed 55");
  }

  if (data.pregnancyWeek !== undefined) {
    if (data.pregnancyWeek < 1) errors.push("Pregnancy week must be at least 1");
    if (data.pregnancyWeek > 42) errors.push("Pregnancy week must not exceed 42");
  }

  if (data.weightKg !== undefined) {
    if (data.weightKg < 30) errors.push("Weight must be at least 30kg");
    if (data.weightKg > 200) errors.push("Weight must not exceed 200kg");
  }

  if (data.heartRate !== undefined) {
    if (data.heartRate < 40) errors.push("Heart rate must be at least 40 bpm");
    if (data.heartRate > 120) errors.push("Heart rate must not exceed 120 bpm");
  }

  if (data.preeclampsiaRisk !== undefined) {
    if (data.preeclampsiaRisk < 0 || data.preeclampsiaRisk > 100) {
      errors.push("Preeclampsia risk must be between 0-100");
    }
  }

  if (data.hypertensionRisk !== undefined) {
    if (data.hypertensionRisk < 0 || data.hypertensionRisk > 100) {
      errors.push("Hypertension risk must be between 0-100");
    }
  }

  if (data.stressRisk !== undefined) {
    if (data.stressRisk < 0 || data.stressRisk > 100) {
      errors.push("Stress risk must be between 0-100");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Parse blood pressure string and validate format
 */
export function parseBloodPressure(bp: string): {
  valid: boolean;
  systolic?: number;
  diastolic?: number;
  errors: string[];
} {
  const errors: string[] = [];
  const parts = bp.split("/");

  if (parts.length !== 2) {
    return { valid: false, errors: ["Blood pressure must be in format: systolic/diastolic"] };
  }

  const systolic = parseInt(parts[0], 10);
  const diastolic = parseInt(parts[1], 10);

  if (isNaN(systolic) || isNaN(diastolic)) {
    return { valid: false, errors: ["Blood pressure values must be numbers"] };
  }

  if (systolic < 60 || systolic > 200) {
    errors.push("Systolic BP must be between 60-200 mmHg");
  }

  if (diastolic < 30 || diastolic > 120) {
    errors.push("Diastolic BP must be between 30-120 mmHg");
  }

  if (systolic <= diastolic) {
    errors.push("Systolic BP must be greater than diastolic BP");
  }

  return {
    valid: errors.length === 0,
    systolic,
    diastolic,
    errors,
  };
}

/**
 * Get recommendation text based on risk percentage
 */
export function getRiskRecommendation(riskPercentage: number): string {
  if (riskPercentage > 65) {
    return "Immediate clinical evaluation recommended.";
  } else if (riskPercentage > 35) {
    return "Schedule follow-up within 48 hours.";
  }
  return "Continue routine monitoring.";
}

/**
 * Format date for consistent display
 */
export function formatFollowUpDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  } catch {
    return dateString;
  }
}
