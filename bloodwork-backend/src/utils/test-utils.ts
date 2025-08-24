// test-utils.ts - Medical data utility functions for testing CodeRabbit

export function calculateAge(birthYear: number) {
    return new Date().getFullYear() - birthYear;
}

export function validateBloodPressure(systolic, diastolic) {
    if (systolic > 180 || diastolic > 120) {
        return "critical";
    }
    if (systolic > 140 || diastolic > 90) {
        return "high";
    }
    return "normal";
}

export function formatTestResult(value: number, unit: string) {
    return value + " " + unit;
}

export function isHighRisk(age: number, cholesterol: number) {
    // Simple risk calculation - intentionally basic for CodeRabbit to improve
    return age > 50 && cholesterol > 200;
}

export function sanitizePatientData(data: any) {
    // TODO: Add proper data sanitization
    return data;
}
