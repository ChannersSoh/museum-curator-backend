import axios from "axios";
import { Exhibit } from "../models/exhibit";
import { determineHistoricalEra } from "./utils";

interface Person {
  displayname: string;
}

interface Location {
  content: string;
}

export const fetchExhibitById = async (id: string): Promise<Exhibit> => {
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

      const record = response.data.records[0];

      const exhibit: Exhibit = {
        id: `harvard-${record.objectnumber}`,
        title: record.title || "Untitled",
        creator: record.people?.map((person: Person) => person.displayname).join(", ") || "Unknown",
        date: record.dated || "Unknown",
        yearCreated: record.yearcreated ? parseInt(record.yearcreated) : null,
        description: record.description || "No description available",
        imageUrl: record.primaryimageurl || "https://via.placeholder.com/150",
        institution: "Harvard Art Museums",
        collection: record.classification || "Unknown",
        countryOfOrigin: record.culture || "Unknown",
        medium: record.medium || "Unknown",
        styleOrPeriod: record.period || "Unknown",
        locationCreated: record.place || "Unknown",
        historicalEra: determineHistoricalEra(record.dated || "Unknown"),
      };

      return exhibit;
    } else if (institution === "smithsonian") {
      const apiKey = process.env.SMITHSONIAN_API_KEY;
      const response = await axios.get(`https://api.si.edu/openaccess/api/v1.0/content/${actualId}`, {
        params: { api_key: apiKey },
      });

      if (!response.data || !response.data.response) {
        throw new Error("No Smithsonian exhibit found.");
      }

      const exhibitData = response.data.response;

      const exhibit: Exhibit = {
        id: `smithsonian-${exhibitData.id}`,
        title: exhibitData.title || "No Title Available",
        creator: exhibitData.content?.freetext?.name
          ? exhibitData.content.freetext.name.map((n: any) => n.content).join(", ")
          : "Unknown",
        date: exhibitData.content?.freetext?.date?.[0]?.content || "Unknown",
        yearCreated: parseInt(exhibitData.content?.freetext?.date?.[0]?.content) || null,
        description: exhibitData.content?.descriptiveNonRepeating?.notes?.[0]?.text || "No description available",
        imageUrl: exhibitData.content?.descriptiveNonRepeating?.online_media?.media?.[0]?.content || "https://via.placeholder.com/150",
        institution: "Smithsonian",
        collection: exhibitData.content?.indexedStructured?.object_type?.join(", ") || "Unknown",
        countryOfOrigin: exhibitData.content?.geoLocation
          ? exhibitData.content.geoLocation.map((loc: Location) => loc.content).join(", ")
          : "Unknown",
        medium: exhibitData.content?.indexedStructured?.material?.join(", ") || "Unknown",
        styleOrPeriod: exhibitData.content?.freetext?.style?.[0]?.content || "Unknown",
        locationCreated: exhibitData.content?.freetext?.place
          ? exhibitData.content.freetext.place.map((p: any) => p.content).join(", ")
          : "Unknown",
        historicalEra: determineHistoricalEra(
          exhibitData.content?.freetext?.date?.[0]?.content || "Unknown"
        ),
      };

      return exhibit;
    } else {
      throw new Error("Invalid institution prefix.");
    }
  } catch (error) {
    console.error(`Error fetching exhibit ${id}:`, error);
    throw error;
  }
};
