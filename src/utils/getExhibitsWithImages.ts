import { getHarvardObjects, getSmithsonianData } from "../utils/api"; 
import { Exhibit } from "../models/exhibit";

export const getExhibitsWithImages = async (
    query: string,
    startPage: number,
    desiredCount: number
  ): Promise<Exhibit[]> => {
    let exhibitsWithImages: Exhibit[] = [];
    let currentPage = startPage;
    const fetchSize = desiredCount * 3;
  
    while (exhibitsWithImages.length < desiredCount) {
      const [harvardResults, smithsonianResults] = await Promise.all([
        getHarvardObjects(query, currentPage, fetchSize),
        getSmithsonianData(query, currentPage, fetchSize),
      ]);

      let combined = [...harvardResults, ...smithsonianResults];
 
      const filtered = combined.filter(exhibit => exhibit.imageUrl && exhibit.imageUrl.trim() !== "");

      exhibitsWithImages = exhibitsWithImages.concat(filtered);

      if (combined.length < fetchSize * 2) {
        break;
      }
  
      currentPage++;
    }
  
    return exhibitsWithImages.slice(0, desiredCount);
  };
  