export function getDefaultNote(testName: string, status: string, value?: number, unit?: string): string {
  const normalizedTestName = testName.toLowerCase();
  
  if (normalizedTestName.includes('cholesterol')) {
    if (normalizedTestName.includes('hdl')) {
      return status === 'high' 
        ? 'Excellent HDL cholesterol! This "good" cholesterol helps protect your heart.'
        : status === 'low'
        ? 'HDL cholesterol could be higher - consider exercise and healthy fats.'
        : 'Good HDL cholesterol levels support cardiovascular health.';
    }
    if (normalizedTestName.includes('ldl')) {
      return status === 'high'
        ? 'LDL cholesterol is elevated - consider dietary changes and exercise.'
        : 'LDL cholesterol levels look good for heart health.';
    }
    return status === 'high'
      ? 'Total cholesterol is elevated - focus on heart-healthy lifestyle choices.'
      : 'Cholesterol levels support good cardiovascular health.';
  }
  
  if (normalizedTestName.includes('glucose') || normalizedTestName.includes('sugar')) {
    return status === 'high'
      ? 'Blood sugar is elevated - monitor carbs and stay active.'
      : status === 'low'
      ? 'Blood sugar is low - ensure regular, balanced meals.'
      : 'Blood sugar levels are well-controlled.';
  }
  
  if (normalizedTestName.includes('vitamin d')) {
    return status === 'low'
      ? 'Vitamin D is low - consider supplements and safe sun exposure.'
      : 'Vitamin D levels support bone and immune health.';
  }
  
  if (normalizedTestName.includes('hemoglobin') || normalizedTestName.includes('hgb')) {
    return status === 'low'
      ? 'Hemoglobin is low - ensure iron-rich foods and consult your doctor.'
      : status === 'high'
      ? 'Hemoglobin is elevated - stay hydrated and follow up if needed.'
      : 'Hemoglobin levels support healthy oxygen transport.';
  }
  
  // Generic fallbacks
  switch (status) {
    case 'high':
      return 'This value is elevated - discuss with your healthcare provider.';
    case 'low':
      return 'This value is below normal - consider follow-up with your doctor.';
    case 'critical':
      return 'This result needs immediate attention - contact your healthcare provider.';
    default:
      return 'This test result is within normal range.';
  }
}
