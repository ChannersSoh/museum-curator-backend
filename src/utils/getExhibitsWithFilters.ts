import { getHarvardObjects, getSmithsonianData } from "./api";
import { Exhibit } from "../models/exhibit";

export const getExhibitsWithFilters = async (
  query: string,
  startPage: number,
  desiredCount: number,
  filters: {
    institution?: string;
    startYear?: number;
    endYear?: number;
    collection?: string;
    country?: string;
    medium?: string;
    style?: string;
  } = {}
): Promise<Exhibit[]> => {
  let exhibits: Exhibit[] = [];
  let currentPage = startPage;
  let attemptsWithoutNewResults = 0; // Counter to detect when no more matching results exist
  const maxAttempts = 5; // Stop searching if no results found after 5 iterations
  const fetchSize = Math.ceil(desiredCount * 1.5);

  while (exhibits.length < desiredCount && attemptsWithoutNewResults < maxAttempts) {
    const [harvardResults, smithsonianResults] = await Promise.all([
      getHarvardObjects(query, currentPage, fetchSize, filters),
      getSmithsonianData(query, currentPage, fetchSize, filters),
    ]);

    console.log(`Fetched Harvard results: ${harvardResults.length}`);
    console.log(`Fetched Smithsonian results: ${smithsonianResults.length}`);

    let combinedResults = [...harvardResults, ...smithsonianResults];

    // Ensure exhibits have images
    combinedResults = combinedResults.filter((exhibit) => exhibit.imageUrl && exhibit.imageUrl.trim() !== "");

    // Randomize the results for variety
    combinedResults = combinedResults.sort(() => Math.random() - 0.5);

    // Filter locally
    const filteredResults = combinedResults.filter((exhibit) => {
      return (
        (!filters.institution || exhibit.institution.toLowerCase() === filters.institution.toLowerCase()) &&
        (!filters.startYear || (exhibit.yearCreated && exhibit.yearCreated >= filters.startYear)) &&
        (!filters.endYear || (exhibit.yearCreated && exhibit.yearCreated <= filters.endYear)) &&
        (!filters.collection || exhibit.collection?.toLowerCase().includes(filters.collection.toLowerCase())) &&
        (!filters.country || exhibit.countryOfOrigin?.toLowerCase().includes(filters.country.toLowerCase())) &&
        (!filters.medium || exhibit.medium?.toLowerCase().includes(filters.medium.toLowerCase())) &&
        (!filters.style || exhibit.styleOrPeriod?.toLowerCase().includes(filters.style.toLowerCase()))
      );
    });

    // Track if we're still getting new results
    if (filteredResults.length === 0) {
      attemptsWithoutNewResults++;
    } else {
      attemptsWithoutNewResults = 0;
    }

    exhibits = exhibits.concat(filteredResults);

    if (combinedResults.length < fetchSize * 2) {
      console.log("No more pages to fetch. Stopping search.");
      break;
    }

    currentPage++;
  }

  console.log(`Final exhibits count: ${exhibits.length}`);
  return exhibits.slice(0, desiredCount);
};
