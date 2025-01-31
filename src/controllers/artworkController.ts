import { Request, Response } from "express";
import axios from "axios";
import { Artwork } from "../models/artwork";

const getEuropeanaData = async (query: string = "artwork"): Promise<Artwork[]> => {
    try {
      const response = await axios.get("https://api.europeana.eu/record/v2/search.json", {
        params: {
          wskey: process.env.EUROPEANA_API_KEY,
          query: query,
          rows: 10,
        },
      });
       
  
      return response.data.items.map((item: any) => ({
        title: item.title[0] || "Untitled",
        creator: item.dcCreator?.[0] || "Unknown",
        date: item.dcDate?.[0] || "Unknown",
        description: item.dcDescription?.[0] || "No description available",
        imageUrl: item.edmPreview?.[0] || null,
      }));
    } catch (error) {
      console.error("Error fetching data from Europeana API:", error);
      return [];
    }
  };


  const getSmithsonianData = async (query: string = "artwork"): Promise<Artwork[]> => {
  try {
    const response = await axios.get("https://api.si.edu/openaccess/api/v1.0/search", {
      params: {
        api_key: process.env.SMITHSONIAN_API_KEY,
        q: query,
        rows: 10,
      },
    });

    return response.data.response.rows.map((item: any) => ({
      title: item.title || "Untitled",
      creator: item.content?.freetext?.name?.[0]?.content || "Unknown",
      date: item.content?.freetext?.date?.[0]?.content || "Unknown",
      description: item.content?.descriptiveNonRepeating?.notes?.[0]?.text || "No description available",
      imageUrl: item.content?.descriptiveNonRepeating?.online_media?.media?.[0]?.content || null,
    }));
  } catch (error) {
    console.error("Error fetching data from Smithsonian API:", error);
    return [];
  }
};


  export const getArtworks = async (req: Request, res: Response) => {
    try {
      const searchQuery = req.query.query as string || "artwork"; 
  
      const europeanaArtworks = await getEuropeanaData(searchQuery);
      const smithsonianArtworks = await getSmithsonianData(searchQuery);
  
      const combinedArtworks = [...europeanaArtworks, ...smithsonianArtworks];
  
      res.json(combinedArtworks); 
    } catch (error) {
      console.error("Error fetching artwork data:", error);
      res.status(500).send("Error fetching artwork data");
    }
  };
  