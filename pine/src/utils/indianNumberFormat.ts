// Indian Number Formatting System
// Formats numbers in Indian lakhs/crores system

export const formatIndianNumber = (amount: number): string => {
  const absAmount = Math.abs(amount);
  const isNegative = amount < 0;
  const prefix = isNegative ? '-' : '+';
  
  if (absAmount >= 10000000) { // 1 crore
    const crores = absAmount / 10000000;
    return `${prefix}₹${crores.toFixed(crores >= 10 ? 0 : 1)}Cr`;
  } else if (absAmount >= 100000) { // 1 lakh
    const lakhs = absAmount / 100000;
    return `${prefix}₹${lakhs.toFixed(lakhs >= 10 ? 0 : 1)}L`;
  } else if (absAmount >= 1000) { // 1 thousand
    const thousands = absAmount / 1000;
    return `${prefix}₹${thousands.toFixed(thousands >= 10 ? 0 : 1)}K`;
  } else {
    return `${prefix}₹${absAmount}`;
  }
};

export const formatIndianNumberSimple = (amount: number): string => {
  const absAmount = Math.abs(amount);
  
  if (absAmount >= 10000000) { // 1 crore
    const crores = absAmount / 10000000;
    return `₹${crores.toFixed(crores >= 10 ? 0 : 1)}Cr`;
  } else if (absAmount >= 100000) { // 1 lakh
    const lakhs = absAmount / 100000;
    return `₹${lakhs.toFixed(lakhs >= 10 ? 0 : 1)}L`;
  } else if (absAmount >= 1000) { // 1 thousand
    const thousands = absAmount / 1000;
    return `₹${thousands.toFixed(thousands >= 10 ? 0 : 1)}K`;
  } else {
    return `₹${absAmount}`;
  }
};

export const calculateAnnualProjection = (dailyTotal: number): string => {
  // Realistic calculation: 8-hour workday, 40-hour workweek (5 days × 8 hours)
  // Only count productive hours, not 24-hour projections
  // Assumes 250 working days per year (5 days × 50 weeks)
  
  // If user has logged activities, calculate based on 8-hour productive day
  // Scale the logged activities to represent an 8-hour workday
  const workingHoursPerDay = 8;
  const totalDayHours = 24;
  
  // Scale daily total to represent realistic 8-hour workday output
  const scaledDailyTotal = (dailyTotal / totalDayHours) * workingHoursPerDay;
  const annualProjection = scaledDailyTotal * 250;
  
  return formatIndianNumberSimple(annualProjection);
};

export const getActivityImpactMessage = (hourlyValue: number): string => {
  const annualImpact = hourlyValue * 250; // Working days
  
  if (annualImpact >= 500000) { // ₹5L+
    return `🚀 This could add ${formatIndianNumberSimple(annualImpact)} to your annual income!`;
  } else if (annualImpact < 0) {
    return `⚠️ This could cost you ${formatIndianNumberSimple(Math.abs(annualImpact))} annually`;
  } else {
    return `📈 Annual impact: ${formatIndianNumber(annualImpact)}`;
  }
};

export const getValueDisplayWithSign = (value: number): { 
  text: string; 
  color: string; 
  isPositive: boolean; 
} => {
  const formatted = formatIndianNumber(value);
  const isPositive = value >= 0;
  
  return {
    text: formatted,
    color: isPositive ? '#34A853' : '#EA4335',
    isPositive
  };
};

export const getIncomeCalculationExplanation = (): string => {
  return `Income calculations are based on realistic work patterns:

• 8 hours productive work per day
• 40 hours per week (5 working days)
• 250 working days per year (50 weeks)

Your logged activities are scaled to represent a typical 8-hour workday, not 24-hour projections. This provides realistic income estimations based on sustainable work patterns.

The app tracks your time value to help you optimize how you spend your productive hours.`;
};