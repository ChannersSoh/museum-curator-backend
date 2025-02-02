import { determineHistoricalEra } from "../utils/utils"

describe("determineHistoricalEra", () => {
    it("should return 'Ancient' for a year less than 500", () => {
      expect(determineHistoricalEra("300-01-01")).toBe("Ancient");
    });
  
    it("should return 'Medieval' for a year between 500 and 1500", () => {
      expect(determineHistoricalEra("1000-01-01")).toBe("Medieval");
    });
  
    it("should return 'Early Modern' for a year between 1500 and 1800", () => {
      expect(determineHistoricalEra("1600-01-01")).toBe("Early Modern");
    });
  
    it("should return 'Modern' for a year after 1800", () => {
      expect(determineHistoricalEra("1900-01-01")).toBe("Modern");
    });
  
    it("should return 'Unknown' if the date is invalid", () => {
      expect(determineHistoricalEra("not-a-date")).toBe("Unknown");
    });
  });
