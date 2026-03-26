export const getSeverityColor = (severity: number): string => {
  if (severity <= 3) return '#4caf50';
  if (severity <= 6) return '#ff9800';
  return '#f44336';
};

export const getSeverityLabel = (severity: number): string => {
  if (severity <= 2) return 'Very Mild';
  if (severity <= 4) return 'Mild';
  if (severity <= 6) return 'Moderate';
  if (severity <= 8) return 'Severe';
  return 'Very Severe';
};
