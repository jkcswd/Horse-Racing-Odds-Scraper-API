export interface ScrapeOddsRequest {
  eventUrl: string;
}

export interface ScrapeOddsResponse {
  success: boolean;
  data?: {
    horsesOddsData: Array<{
      name: string;
      odds: string;
    }>;
    timestamp: string;
    eventUrl: string;
    bookmaker: string;
  };
  error?: string;
  message?: string;
}


export interface ApiError {
  status: number;
  message: string;
  code?: string;
}