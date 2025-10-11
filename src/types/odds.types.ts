export interface HorseOdds {
  name: string;
  odds: string;
}

export interface RaceData {
  horsesOddsData: HorseOdds[];
  timestamp: string;
  eventUrl: string;
  bookmaker: string;
}

export interface ScraperResult {
  success: boolean;
  data?: RaceData;
  error?: string;
  timestamp: string;
}