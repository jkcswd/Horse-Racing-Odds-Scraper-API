import { scrapeLadbrokes, scrapeBet365} from "../sites";
import { HorseOddsScraperFunc } from '../../../types/odds.types';
import logger from "../../../utils/logger";

export const parseUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return  urlObj.hostname.toLowerCase();

  } catch (error) {
    logger.error('Invalid URL provided', { url, error });
    throw new Error('Invalid URL');
  }
};

export const getSupportedBookmaker = (url: string): HorseOddsScraperFunc => {
  const domain = parseUrl(url);

  // Remove www. prefix for consistent matching
  const cleanDomain = domain.replace(/^www\./, '');

  const supportedBookmakers: Record<string, HorseOddsScraperFunc> = {
    'bet365.com': scrapeBet365,
    'ladbrokes.com': scrapeLadbrokes
  };

  const scraperFunction = supportedBookmakers[cleanDomain];
  if (!scraperFunction) {
    throw new Error(`Unsupported bookmaker: ${cleanDomain}`);
  }

  return scraperFunction;
};

