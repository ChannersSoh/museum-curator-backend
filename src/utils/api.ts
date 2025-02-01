import axios from "axios";
import { Exhibit } from "../models/exhibit";
import { determineHistoricalEra } from "./utils";
import { cache } from "./cache";

export const getHarvardObjects = async (
  query: string = "",
  page: number = 1,
  pageSize: number = 20
): Promise<Exhibit[]> => {
  const cacheKey = `harvard-${query}-${page}-${pageSize}`;
  const cachedData = cache.get<Exhibit[]>(cacheKey);
  if (cachedData) {
    console.log("Returning cached Harvard data");
    return cachedData;
  }

  try {
    const apiKey = process.env.HARVARD_API_KEY;
    const response = await axios.get("https://api.harvardartmuseums.org/object", {
      params: { apikey: apiKey, q: query || "*", size: pageSize, page },
    });

    const exhibits: Exhibit[] = response.data.records.map((item: any) => ({
      id: `harvard-${item.objectnumber}`,
      title: item.title || "Untitled",
      creator: item.people?.map((p: any) => p.displayname).join(", ") || "Unknown",
      date: item.dated || "Unknown",
      yearCreated: item.dated ? parseInt(item.dated.split("-")[0]) : null,
      description: item.description || "No description available",
      imageUrl: item.primaryimageurl || "",
      institution: "Harvard Art Museums",
      collection: item.classification || "Unknown",
      countryOfOrigin: item.culture || "Unknown",
      medium: item.medium || "Unknown",
      styleOrPeriod: item.period || "Unknown",
      subjectMatter: item.subjects?.map((s: any) => s.name) || [],
      locationCreated: item.place || "Unknown",
      historicalEra: determineHistoricalEra(item.dated),
    }));

    cache.set(cacheKey, exhibits);
    return exhibits;
  } catch (error) {
    console.error("Error fetching Harvard objects:", error);
    return [];
  }
};

export const getSmithsonianData = async (
  query: string = "",
  page: number = 1,
  pageSize: number = 20
): Promise<Exhibit[]> => {
  const cacheKey = `smithsonian-${query}-${page}-${pageSize}`;
  const cachedData = cache.get<Exhibit[]>(cacheKey);
  
  if (cachedData) {
    console.log("Returning cached Smithsonian data");
    return cachedData;
  }

  try {
    const apiKey = process.env.SMITHSONIAN_API_KEY;
    const start = (page - 1) * pageSize;

    const response = await axios.get("https://api.si.edu/openaccess/api/v1.0/search", {
      params: { api_key: apiKey, q: query || "*", start, rows: pageSize },
    });

    const rows = response.data.response?.rows;
    if (!rows) return [];

    const exhibits: Exhibit[] = rows.map((item: any) => ({
      id: `smithsonian-${item.id}`,
      title: item.title || "Untitled",
      creator: item.content?.freetext?.name?.[0]?.content || "Unknown",
      date: item.content?.freetext?.date?.[0]?.content || "Unknown",
      yearCreated: parseInt(item.content?.freetext?.date?.[0]?.content) || null,
      description: item.content?.descriptiveNonRepeating?.notes?.[0]?.text || "No description available",
      imageUrl: item.content?.descriptiveNonRepeating?.online_media?.media?.[0]?.content || "",
      institution: "Smithsonian",
      collection: item.content?.indexedStructured?.object_type?.[0] || "Unknown",
      countryOfOrigin: item.content?.indexedStructured?.geoLocation?.[0] || "Unknown",
      medium: item.content?.indexedStructured?.material?.[0] || "Unknown",
      styleOrPeriod: item.content?.freetext?.style?.[0]?.content || "Unknown",
      subjectMatter: item.content?.freetext?.topic?.map((t: any) => t.content) || [],
      locationCreated: item.content?.freetext?.place?.[0]?.content || "Unknown",
      historicalEra: determineHistoricalEra(item.content?.freetext?.date?.[0]?.content),
    }));

    cache.set(cacheKey, exhibits);

    return exhibits;
  } catch (error) {
    console.error("Error fetching Smithsonian data:", error);
    return [];
  }
};
