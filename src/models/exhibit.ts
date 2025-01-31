export interface Exhibit {
  id: string;
  title: string;
  creator: string;
  date: string;
  yearCreated: number | null;
  description: string;
  imageUrl: string;
  institution: string;
  collection: string;
  countryOfOrigin: string;
  type: "painting" | "sculpture" | "photograph" | "drawing" | "manuscript" | "other";
  medium: string;
  styleOrPeriod: string;
  subjectMatter: string[];
  locationCreated: string;
  historicalEra: string;
}
