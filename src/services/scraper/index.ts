import { ScraperResult } from '../../types/odds.types';
import { createPage, closePage } from './utils/browser';
import logger from '../../utils/logger';
import { getSupportedBookmaker } from './utils/url-parser';

export const scrapeOdds = async (eventUrl: string): Promise<ScraperResult> => {
  let page = null; // declare page here for broader scope and closing in finally block.

  try {
    page = await createPage();
    logger.info('Starting scrape for URL', { eventUrl });

    // For now, we only support Ladbrokes as a bookmaker.
    // In future, we can extend this with more site-specific scrapers.
    // This is just an example for how we could could extend in the future.
    const scraperFunction = getSupportedBookmaker(eventUrl);
    const data = await scraperFunction(eventUrl);

    logger.info('Scrape completed successfully', { eventUrl, oddsScraped: data.horsesOddsData });
    return {
      success: true,
      data,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    logger.error('Error scraping odds', { eventUrl, error });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown scraping error',
      timestamp: new Date().toISOString()
    };
  } finally {
    if (page) {
      await closePage(page);
    }
  }
};