export interface CreateCollectionBody {
  name: string;
  description: string;
  exhibitCount?: number;
}

  export interface SaveExhibitBody {
    collectionId: number;
    exhibitId: string;
    title: string;
    institution: string;
    imageUrl: string;
    creator: string;
    date: string;
    collection: string;
    culture: string;
    medium: string;
    styleOrPeriod: string;
    locationCreated: string;
    description: string;
  }
  