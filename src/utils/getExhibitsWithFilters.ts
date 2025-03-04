import { getHarvardObjects, getSmithsonianData } from "./api";
import { Exhibit } from "../models/exhibit";

export const getExhibitsWithFilters = async (
  query: string,
  startPage: number,
  desiredCount: number,
  filters: {
    collection?: string;
    culture?: string;
    medium?: string;
  } = {}
): Promise<Exhibit[]> => {
  let exhibits: Exhibit[] = [];
  let currentPage = startPage;
  let attemptsWithoutNewResults = 0;
  const maxAttempts = 5;

  const fieldSpecific = /(?:title:|creator:)/i.test(query);
  let extractedTerms = "";
  if (fieldSpecific) {
    const titleMatch = query.match(/title:"([^"]+)"/i);
    const creatorMatch = query.match(/creator:"([^"]+)"/i);
    if (titleMatch) {
      extractedTerms += titleMatch[1].trim() + " ";
    }
    if (creatorMatch) {
      extractedTerms += creatorMatch[1].trim() + " ";
    }
    extractedTerms = extractedTerms.trim();
  }
  // Use the extracted terms if available, otherwise use the original query.
  const apiQuery = fieldSpecific && extractedTerms ? extractedTerms : query;

  while (exhibits.length < desiredCount && attemptsWithoutNewResults < maxAttempts) {
    const remainingCount = desiredCount - exhibits.length;
    const fetchSizePerAPI = Math.ceil(remainingCount / 2);

    const [harvardResults, smithsonianResults] = await Promise.all([
      getHarvardObjects(apiQuery, currentPage, fetchSizePerAPI, filters),
      getSmithsonianData(apiQuery, currentPage, fetchSizePerAPI, filters),
    ]);

    let validHarvard = harvardResults.filter(
      (exhibit) => exhibit.imageUrl && exhibit.imageUrl.trim() !== ""
    );
    let validSmithsonian = smithsonianResults.filter(
      (exhibit) => exhibit.imageUrl && exhibit.imageUrl.trim() !== ""
    );

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

  if (query && query.trim() !== "" && query !== "*") {
    let titleSearch: string | null = null;
    let creatorSearch: string | null = null;

    const titleMatch = query.match(/title:"([^"]+)"/i);
    if (titleMatch) {
      titleSearch = titleMatch[1].trim().toLowerCase();
    } else if (query.toLowerCase().startsWith("title:")) {
      titleSearch = query.substring("title:".length).trim().toLowerCase();
    }

    const creatorMatch = query.match(/creator:"([^"]+)"/i);
    if (creatorMatch) {
      creatorSearch = creatorMatch[1].trim().toLowerCase();
    } else if (query.toLowerCase().startsWith("creator:")) {
      creatorSearch = query.substring("creator:".length).trim().toLowerCase();
    }


    if (titleSearch || creatorSearch) {
      exhibits = exhibits.filter((exhibit) => {
        let matches = true;
        if (titleSearch) {
          matches = matches && exhibit.title?.toLowerCase().includes(titleSearch);
        }
        if (creatorSearch) {
          matches = matches && exhibit.creator?.toLowerCase().includes(creatorSearch);
        }
        return matches;
      });
    } else {
      const searchTerm = query.toLowerCase();
      exhibits = exhibits.filter((exhibit) => {
        return (
          (exhibit.title && exhibit.title.toLowerCase().includes(searchTerm)) ||
          (exhibit.description && exhibit.description.toLowerCase().includes(searchTerm)) ||
          (exhibit.creator && exhibit.creator.toLowerCase().includes(searchTerm))
        );
      });
    }
  }

  console.log(`Final exhibits count: ${exhibits.length}`);
  return exhibits.slice(0, desiredCount);
};
