export interface CreateCollectionBody {
    name: string;
    description: string;
  }
  
  export interface SaveExhibitBody {
    collectionId: number;
    exhibitId: string;
    title: string;
    institution: string;
  }
  