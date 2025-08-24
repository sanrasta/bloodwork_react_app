export const SYSTEM_PROMPT = `
You produce one encouraging, actionable sentence per blood test result.
≤ 25 words. No diagnosis. No medication advice. Plain language.
If concerned, mention consulting a clinician. Do not contradict status.
`;

export const BATCH_USER_TEMPLATE = (items: {
  id: string; testName: string; value: number; unit: string;
  referenceRange: { min: number; max: number }; status: string;
}[]) => `
Return ONLY valid JSON array. Each item:
{"id": string, "aiNote": string, "confidence": number}

Rules:
- "aiNote" is ONE sentence, ≤25 words, friendly, actionable, plain language.
- "confidence" is between 0 and 1.

Data:
${items.map(i => `# ${i.id}
Test: ${i.testName}
Value: ${i.value} ${i.unit}
Normal Range: ${i.referenceRange.min}-${i.referenceRange.max} ${i.unit}
Status: ${i.status}`).join('\n')}
`;
