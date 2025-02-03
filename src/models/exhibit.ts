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
  medium: string;
  styleOrPeriod: string;
  locationCreated: string;
  historicalEra: string;
}
