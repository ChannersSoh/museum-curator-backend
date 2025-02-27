import axios from "axios";
import { Exhibit } from "../models/exhibit";
import { determineHistoricalEra } from "./utils";
import { cache } from "./cache";

export const getHarvardObjects = async (
  query: string = "",
  page: number = 1,
  pageSize: number = 20,
  filters: {
    collection?: string;
    culture?: string;
    medium?: string;
  } = {}
): Promise<Exhibit[]> => {
  const cacheKey = `harvard-${query}-${page}-${pageSize}-${JSON.stringify(filters)}`;
  const cachedData = cache.get<Exhibit[]>(cacheKey);

  if (cachedData) {
    return cachedData;
  }

  try {
    const apiKey = process.env.HARVARD_API_KEY;
    
    const params: any = {
      apikey: apiKey,
      q: query || "*",
      size: pageSize * 2,
      page,
      classification: filters.collection || undefined, 
      culture: filters.culture || undefined,
      medium: filters.medium || undefined,
      hasimage: 1,
    };

    const { data } = await axios.get("https://api.harvardartmuseums.org/object", { params });

    if (!data.records || data.records.length === 0) return [];

    const exhibits: Exhibit[] = data.records
      .map((item: any) => ({
        id: `harvard-${item.objectnumber}`,
        title: item.title || "Untitled",
        creator: item.people?.map((p: any) => p.displayname).join(", ") || "Unknown",
        date: item.dated || "Unknown",
        yearCreated: item.dated ? parseInt(item.dated.split("-")[0]) : null,
        description: item.description || "No description available",
        imageUrl: item.primaryimageurl || "", 
        institution: "Harvard Art Museums",
        collection: item.classification || "Unknown",
        culture: item.culture || "Unknown",
        medium: item.medium || "Unknown",
        styleOrPeriod: item.period || "Unknown",
        locationCreated: item.place || "Unknown",
        historicalEra: determineHistoricalEra(item.dated),
      }))
      .filter((exhibit: Exhibit) => exhibit.imageUrl && exhibit.imageUrl.trim() !== ""); 

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
  pageSize: number = 20,
  filters: {
    collection?: string;
    culture?: string;
    medium?: string;
  } = {}
): Promise<Exhibit[]> => {
  const cacheKey = `smithsonian-${query}-${page}-${pageSize}-${JSON.stringify(filters)}`;
  const cachedData = cache.get<Exhibit[]>(cacheKey);

  if (cachedData) {
    return cachedData;
  }

  try {
    const apiKey = process.env.SMITHSONIAN_API_KEY;
    const start = (page - 1) * pageSize;

    let filterQuery = query || "*";
    if (filters.collection) filterQuery += ` AND object_type:"${filters.collection}"`;
    if (filters.culture) filterQuery += ` AND geoLocation.content:"${filters.culture}"`;
    if (filters.medium) filterQuery += ` AND indexedStructured.material:"${filters.medium}"`;

    const { data } = await axios.get("https://api.si.edu/openaccess/api/v1.0/search", {
      params: {
        api_key: apiKey,
        q: filterQuery,
        start,
        rows: pageSize * 2, 
        sort: "relevancy",
      },
    });

    const rows = data.response?.rows;
    if (!rows) return [];

    const exhibits: Exhibit[] = rows
      .map((exhibit: any) => ({
        id: `smithsonian-${exhibit.id}`,
        title: exhibit.title || "Untitled",
        creator: exhibit.content?.freetext?.name?.[0]?.content || "Unknown",
        date: exhibit.content?.freetext?.date?.[0]?.content || "Unknown",
        yearCreated: parseInt(exhibit.content?.freetext?.date?.[0]?.content) || null,
        description: exhibit.content?.descriptiveNonRepeating?.notes?.[0]?.text || "No description available",
        imageUrl: exhibit.content?.descriptiveNonRepeating?.online_media?.media?.[0]?.content || "",
        institution: "Smithsonian",
        collection: exhibit.content?.indexedStructured?.object_type?.[0] || "Unknown",
        culture: exhibit.content?.indexedStructured?.geoLocation?.map((geo: any) => geo.content).join(", ") || "Unknown",
        medium: exhibit.content?.indexedStructured?.material?.join(", ") || "Unknown",
        styleOrPeriod: exhibit.content?.freetext?.style?.[0]?.content || "Unknown",
        locationCreated: exhibit.content?.freetext?.place?.map((place: any) => place.content).join(", ") || "Unknown",
        historicalEra: determineHistoricalEra(exhibit.content?.freetext?.date?.[0]?.content),
      }))
      .filter((exhibit: Exhibit) => exhibit.imageUrl && exhibit.imageUrl.trim() !== ""); 

    cache.set(cacheKey, exhibits);
    return exhibits;
  } catch (error) {
    console.error("Error fetching Smithsonian data:", error);
    return [];
  }
};
