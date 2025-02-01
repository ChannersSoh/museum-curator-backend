
export const determineHistoricalEra = (date: string | undefined): string => {
  if (!date) return "Unknown";
  const year = parseInt(date.split("-")[0]);
  if (isNaN(year)) return "Unknown";
  if (year < 500) return "Ancient";
  if (year < 1500) return "Medieval";
  if (year < 1800) return "Early Modern";
  return "Modern";
};
