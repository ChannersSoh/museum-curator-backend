import axios from "axios";
import { getHarvardObjects, getSmithsonianData } from "../utils/api";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

beforeEach(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
  jest.resetAllMocks();
});

afterEach(() => {
  (console.error as jest.Mock).mockRestore();
});

describe("getHarvardObjects", () => {
  it("should return an empty array if the API call fails", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Network error"));
    const exhibits = await getHarvardObjects("painting", 1, 15);
    expect(exhibits).toEqual([]);
  });

  it("should return a list of exhibits when the API call is successful", async () => {
    const mockHarvardResponse = {
      data: {
        records: [
          {
            objectnumber: "001",
            title: "Test Painting",
            dcCreator: ["Artist 1"],
            dcDate: ["1900"],
            dcDescription: ["Test description"],
            edmPreview: ["http://example.com/image.jpg"],
            classification: ["Test Collection"],
          },
        ],
      },
    };

    mockedAxios.get.mockResolvedValue(mockHarvardResponse);

    const exhibits = await getHarvardObjects("painting", 1, 15);

    const expectedExhibit = {
      id: "harvard-001",
      title: "Test Painting",
      creator: "Unknown",
      date: "Unknown",
      description: "No description available",
      imageUrl: "",
      institution: "Harvard Art Museums",
      collection: ["Test Collection"],
      countryOfOrigin: "Unknown",
      medium: "Unknown",
      styleOrPeriod: "Unknown",
      subjectMatter: [],
      locationCreated: "Unknown",
      historicalEra: expect.any(String),
    };

    expect(exhibits).toHaveLength(1);
    expect(exhibits[0]).toMatchObject(expectedExhibit);
  });
});

describe("getSmithsonianData", () => {
  it("should return an empty array if the API call fails", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Network error"));
    const exhibits = await getSmithsonianData("painting", 1, 15);
    expect(exhibits).toEqual([]);
  });

  it("should return a list of exhibits when the API call is successful", async () => {
    const mockSmithsonianResponse = {
      data: {
        response: {
          rows: [
            {
              id: "002",
              title: "Test Smithsonian Exhibit",
              content: {
                freetext: {
                  name: [{ content: "Smithsonian Artist" }],
                  date: [{ content: "1950" }],
                  style: [{ content: "Contemporary" }],
                  topic: [{ content: "History" }],
                },
                descriptiveNonRepeating: {
                  notes: [{ text: "A Smithsonian test exhibit" }],
                  online_media: { media: [{ content: "http://example.com/smithsonian.jpg" }] },
                },
                indexedStructured: {
                  object_type: ["Test Object"],
                  geoLocation: ["Test Country"],
                  material: ["Bronze"],
                },
              },
            },
          ],
        },
      },
    };

    mockedAxios.get.mockResolvedValue(mockSmithsonianResponse);

    const exhibits = await getSmithsonianData("painting", 1, 15);

    const expectedExhibit = {
      id: "smithsonian-002",
      title: "Test Smithsonian Exhibit",
      creator: "Smithsonian Artist",
      date: "1950",
      description: "A Smithsonian test exhibit",
      imageUrl: "http://example.com/smithsonian.jpg",
      institution: "Smithsonian",
      collection: "Test Object", 
      countryOfOrigin: "Test Country",
      medium: "Bronze",
      styleOrPeriod: "Contemporary",
      subjectMatter: ["History"],
      locationCreated: "Unknown",
      historicalEra: expect.any(String),
    };

    expect(exhibits).toHaveLength(1);
    expect(exhibits[0]).toMatchObject(expectedExhibit);
  });
});
