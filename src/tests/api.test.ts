import axios from "axios";
import { cache } from "../utils/cache"; 
import { fetchExhibitById } from "../utils/fetchExhibitById";
import { getHarvardObjects, getSmithsonianData } from "../utils/api"; 
import { Exhibit } from "../models/exhibit";

jest.mock("axios");

const mockedAxios = axios as jest.Mocked<typeof axios>;

beforeEach(() => {
    cache.flushAll();
    jest.resetAllMocks();
  });

describe("getHarvardObjects", () => {
    it("should return exhibits from Harvard when the API call is successful", async () => {
      const dummyResponse = {
        data: {
          records: [
            {
              objectnumber: "123",
              title: "Test Exhibit",
              people: [{ displayname: "Artist Name" }],
              dated: "1900-01-01",
              description: "A test exhibit.",
              primaryimageurl: "http://example.com/image.jpg",
              classification: "Test Collection",
              culture: "Test Culture",
              medium: "Oil on canvas",
              period: "Modern",
              subjects: [{ name: "Test Subject" }],
              place: "Test Place",
            },
          ],
        },
      };

      mockedAxios.get.mockResolvedValue(dummyResponse);
  
      const exhibits: Exhibit[] = await getHarvardObjects("painting", 1, 15);

      expect(exhibits.length).toBe(1);
      expect(exhibits[0].id).toEqual("harvard-123");
      expect(exhibits[0].title).toEqual("Test Exhibit");
      expect(exhibits[0].creator).toEqual("Artist Name");
      expect(exhibits[0].institution).toEqual("Harvard Art Museums");
    });
  
    it("should return an empty array if the API call fails", async () => {
      mockedAxios.get.mockRejectedValue(new Error("Network error"));
 
      const exhibits: Exhibit[] = await getHarvardObjects("painting", 1, 15);
  
      expect(exhibits).toEqual([]);
    });
  });

  describe("getSmithsonianData", () => {
    it("should return exhibits from Smithsonian when the API call is successful", async () => {
      const dummyResponse = {
        data: {
          response: {
            rows: [
              {
                id: "456",
                title: "Smithsonian Exhibit",
                content: {
                  freetext: {
                    name: [{ content: "Smithsonian Artist" }],
                    date: [{ content: "1950-01-01" }],
                    style: [{ content: "Modern" }],
                    topic: [{ content: "History" }],
                    place: [{ content: "Test Location" }],
                  },
                  descriptiveNonRepeating: {
                    notes: [{ text: "A Smithsonian test exhibit." }],
                    online_media: {
                      media: [{ content: "http://example.com/smithsonian.jpg" }],
                    },
                  },
                  indexedStructured: {
                    object_type: ["Sculpture"],
                    geoLocation: ["Test Country"],
                    material: ["Bronze"],
                  },
                },
              },
            ],
          },
        },
      };
 
      mockedAxios.get.mockResolvedValue(dummyResponse);
  
      const exhibits: Exhibit[] = await getSmithsonianData("sculpture", 1, 15);
  
      expect(exhibits.length).toBe(1);
      expect(exhibits[0].id).toEqual("smithsonian-456");
      expect(exhibits[0].title).toEqual("Smithsonian Exhibit");
      expect(exhibits[0].creator).toEqual("Smithsonian Artist");
      expect(exhibits[0].institution).toEqual("Smithsonian");
    });
  
    it("should return an empty array if there are no rows", async () => {
      const dummyResponse = {
        data: {
          response: {
            rows: [],
          },
        },
      };
      mockedAxios.get.mockResolvedValue(dummyResponse);

      const exhibits: Exhibit[] = await getSmithsonianData("sculpture", 1, 15);

      expect(exhibits).toEqual([]);
    });
  
    it("should return an empty array if the API call fails", async () => {
      mockedAxios.get.mockRejectedValue(new Error("Network error"));

      const exhibits: Exhibit[] = await getSmithsonianData("sculpture", 1, 15);

      expect(exhibits).toEqual([]);
    });
  });
  
  describe("fetchExhibitById", () => {
    it("should fetch Harvard exhibit details when given a Harvard ID", async () => {
      const dummyHarvardResponse = {
        data: {
          records: [
            {
              objectnumber: "123",
              title: "Test Harvard Exhibit",
            },
          ],
        },
      };

      mockedAxios.get.mockResolvedValueOnce(dummyHarvardResponse);

      const result = await fetchExhibitById("harvard-123");
  
      expect(mockedAxios.get).toHaveBeenCalledWith(
        "https://api.harvardartmuseums.org/object",
        {
          params: { apikey: process.env.HARVARD_API_KEY, q: "123" },
        }
      );
      expect(result).toEqual(dummyHarvardResponse.data.records[0]);
    });
  
    it("should fetch Smithsonian exhibit details when given a Smithsonian ID", async () => {
      const dummySmithsonianResponse = {
        data: { id: "456", title: "Test Smithsonian Exhibit" },
      };

      mockedAxios.get.mockResolvedValueOnce(dummySmithsonianResponse);
  
      const result = await fetchExhibitById("smithsonian-456");

      expect(mockedAxios.get).toHaveBeenCalledWith(
        "https://api.si.edu/openaccess/api/v1.0/content/456",
        {
          params: { api_key: process.env.SMITHSONIAN_API_KEY },
        }
      );
      expect(result).toEqual(dummySmithsonianResponse.data);
    });
  
    it("should throw an error if no Harvard exhibit is found", async () => {
      const dummyEmptyResponse = { data: { records: [] } };
      mockedAxios.get.mockResolvedValueOnce(dummyEmptyResponse);
  
      await expect(fetchExhibitById("harvard-999")).rejects.toThrow("No Harvard exhibit found.");
    });
  
    it("should throw an error if an invalid institution prefix is provided", async () => {
      await expect(fetchExhibitById("invalid-123")).rejects.toThrow("Invalid institution prefix.");
    });
  });
  

