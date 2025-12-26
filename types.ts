
export interface CompetitorListing {
  url: string;
  title: string;
  bullets: string;
}

export interface ProductImage {
  data: string; // base64
  mimeType: string;
}

export interface ListingInputData {
  abaFileContent?: string;
  sellerSpriteContent?: string;
  competitors: CompetitorListing[];
  reviewFileContent: string;
  productName: string;
  productDesc: string;
  images?: ProductImage[];
}

export interface AnalysisResults {
  keywordAnalysis: {
    roots: string[];
    highFreq: { word: string; count: number }[];
    coreKeywords: string[];
  };
  competitorInsights: {
    writingStyles: string;
    coreKeywordUsage: string;
    sellingPoints: string[];
  };
  reviewInsights: {
    painPoints: string[];
    defects: string[];
  };
  listings: {
    version1: AmazonListing;
    version2: AmazonListing;
  };
}

export interface AmazonListing {
  title: string;
  bullets: string[];
  description: string;
}

export enum AppStep {
  INPUT = 'INPUT',
  ANALYZING = 'ANALYZING',
  RESULTS = 'RESULTS'
}
