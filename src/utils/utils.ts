import { Exhibit } from "../models/exhibit";

export const determineType = (typeString: string | undefined): Exhibit["type"] => {
  if (!typeString) return "other";
  const lowerType = typeString.toLowerCase();
  if (lowerType.includes("painting")) return "painting";
  if (lowerType.includes("sculpture")) return "sculpture";
  if (lowerType.includes("photo") || lowerType.includes("photograph")) return "photograph";
  if (lowerType.includes("drawing")) return "drawing";
  if (lowerType.includes("manuscript")) return "manuscript";
  return "other";
};

export const determineHistoricalEra = (date: string | undefined): string => {
  if (!date) return "Unknown";
  const year = parseInt(date.split("-")[0]);
  if (isNaN(year)) return "Unknown";
  if (year < 500) return "Ancient";
  if (year < 1500) return "Medieval";
  if (year < 1800) return "Early Modern";
  return "Modern";
};
