export interface HorseOdds {
  name: string;
  odds: string;
}

export interface HorseOddsWithNonRunner extends HorseOdds {
  nonRunner?: boolean;
}

export interface RaceData {
  horsesOddsData: HorseOdds[];
  eventUrl: string;
  bookmaker: string;
}

export interface ScraperResult {
  success: boolean;
  data?: RaceData;
  error?: string;
  timestamp: string;
}

export type HorseOddsScraperFunc = (url: string) => Promise<RaceData>;