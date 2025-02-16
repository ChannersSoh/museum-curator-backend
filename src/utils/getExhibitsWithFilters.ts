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

  while (exhibits.length < desiredCount && attemptsWithoutNewResults < maxAttempts) {
    const remainingCount = desiredCount - exhibits.length;
    const fetchSizePerAPI = Math.ceil(remainingCount / 2);

    console.log(`Fetching Harvard & Smithsonian: ${fetchSizePerAPI} each`);

    const [harvardResults, smithsonianResults] = await Promise.all([
      getHarvardObjects(query, currentPage, fetchSizePerAPI, filters),
      getSmithsonianData(query, currentPage, fetchSizePerAPI, filters),
    ]);

    let validHarvard = harvardResults.filter((exhibit) => exhibit.imageUrl && exhibit.imageUrl.trim() !== "");
    let validSmithsonian = smithsonianResults.filter((exhibit) => exhibit.imageUrl && exhibit.imageUrl.trim() !== "");

    console.log(`Fetched Harvard: ${validHarvard.length}, Smithsonian: ${validSmithsonian.length}`);

    if (validHarvard.length === 0 && validSmithsonian.length === 0) {
      attemptsWithoutNewResults++;

      if (attemptsWithoutNewResults >= maxAttempts) {
        console.log("Max attempts reached. Stopping search.");
        break;
      }
    } else {
      attemptsWithoutNewResults = 0; 
    }

    let mixedResults: Exhibit[] = [];
    let maxLength = Math.max(validHarvard.length, validSmithsonian.length);
    
    for (let i = 0; i < maxLength; i++) {
      if (validHarvard[i]) mixedResults.push(validHarvard[i]);
      if (validSmithsonian[i]) mixedResults.push(validSmithsonian[i]);
    }

    exhibits = exhibits.concat(mixedResults);

    if (exhibits.length >= desiredCount) {
      console.log("Reached desired count. Stopping search.");
      break;
    }

    currentPage++;
  }

  console.log(`Final exhibits count: ${exhibits.length}`);
  return exhibits.slice(0, desiredCount);
};
