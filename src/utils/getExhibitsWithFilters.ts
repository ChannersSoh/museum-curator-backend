import { getHarvardObjects, getSmithsonianData } from "./api";
import { Exhibit } from "../models/exhibit";

export const getExhibitsWithFilters = async (
  query: string,
  startPage: number,
  desiredCount: number,
  filters: {
    collection?: string;
    country?: string;
    medium?: string;
  } = {}
): Promise<Exhibit[]> => {
  let exhibits: Exhibit[] = [];
  let currentPage = startPage;
  let attemptsWithoutNewResults = 0;
  const maxAttempts = 5;
  const fetchSize = Math.ceil(desiredCount * 1.5);

  while (exhibits.length < desiredCount && attemptsWithoutNewResults < maxAttempts) {
    const [harvardResults, smithsonianResults] = await Promise.all([
      getHarvardObjects(query, currentPage, fetchSize, filters),
      getSmithsonianData(query, currentPage, fetchSize, filters),
    ]);

    let combinedResults = [...harvardResults, ...smithsonianResults];

    combinedResults = combinedResults.filter((exhibit) => exhibit.imageUrl && exhibit.imageUrl.trim() !== "");

    if (combinedResults.length === 0) {
      attemptsWithoutNewResults++;
      console.log(`No new results found (${attemptsWithoutNewResults}/${maxAttempts}).`);
      if (attemptsWithoutNewResults >= maxAttempts) {
        console.log("Max attempts reached. Stopping search.");
        break;
      }
    } else {
      attemptsWithoutNewResults = 0;
    }

    exhibits = exhibits.concat(combinedResults);

    if (exhibits.length >= desiredCount) {
      console.log("Reached desired count. Stopping search.");
      break;
    }

    currentPage++;
  }

  return exhibits.slice(0, desiredCount);
};
