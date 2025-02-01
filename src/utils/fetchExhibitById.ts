import axios from "axios";

export const fetchExhibitById = async (id: string) => {
  if (!id) throw new Error("Exhibit ID is required.");

  const [institution, ...idParts] = id.split("-");
  const actualId = idParts.join("-");

  try {
    if (institution === "harvard") {
      const apiKey = process.env.HARVARD_API_KEY;
      const response = await axios.get(`https://api.harvardartmuseums.org/object`, {
        params: { apikey: apiKey, q: actualId },
      });
    
      if (!response.data.records || response.data.records.length === 0) {
        throw new Error("No Harvard exhibit found.");
      }
    
      return response.data.records[0]; 
    }
    
    else if (institution === "smithsonian") {
      const apiKey = process.env.SMITHSONIAN_API_KEY;
      const response = await axios.get(`https://api.si.edu/openaccess/api/v1.0/content/${actualId}`, {
        params: { api_key: apiKey },
      });
      return response.data;
    } 
    else {
      throw new Error("Invalid institution prefix.");
    }
  } catch (error) {
    console.error(`Error fetching exhibit ${id}:`, error);
    throw new Error("Failed to fetch exhibit details.");
  }
};
