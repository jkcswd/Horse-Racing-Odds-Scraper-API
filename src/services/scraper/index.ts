import { ScraperResult } from '../../types/odds.types';
import { createPage, closePage } from './utils/browser';
import logger from '../../utils/logger';

// TODO Implement URL parsing and dispatch to different site-specific scrapers based on the eventUrl
// TODO implement filtering out or flagging non-runners like "Non Runner" or "Withdrawn"
// TODO filter out unnamed favorite placeholders
export const scrapeOdds = async (eventUrl: string): Promise<ScraperResult> => {
  const timestamp = new Date().toISOString();
  let page = null; // declare page here for broader scope and closing in finally block.
  
  try {
    page = await createPage();
    
    logger.info('Navigating to URL', { eventUrl });
    await page.goto(eventUrl, { waitUntil: 'domcontentloaded' }); // Better performance for most sites.

    // Wait for race cards to load
    await page.waitForSelector('[data-crlat="raceCard.odds"]', { timeout: 10000 });
    
    // Extract horses data from each race card
    const horsesOddsData = await page.evaluate(() => {
      const raceCardElements = document.querySelectorAll('[data-crlat="raceCard.odds"]');
      
      return Array.from(raceCardElements).map((raceCard) => { // as its a nodelist we cant directly map
        const horseNameElement = raceCard.querySelector('[data-crlat="horseName"]');
        const oddsPriceElement = raceCard.querySelector('[data-crlat="oddsPrice"]');
        
        const horseName = horseNameElement?.textContent?.trim() 
        const oddsPrice = oddsPriceElement?.textContent?.trim() 

        if (!horseName || !oddsPrice) {
          // This is unexpected behavior as there should be a name and odds on every horse!
          throw new Error('Failed to extract horse name or odds price');
        }
        
        return {
          name: horseName,
          odds: oddsPrice
        };
      });
    });
    
    
    return {
      success: true,
      data: {
        horsesOddsData,
        timestamp,
        eventUrl,
        bookmaker: 'ladbrookes'
      },
      timestamp
    };
    
  } catch (error) {
    logger.error('Error scraping odds', { eventUrl, error });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown scraping error',
      timestamp
    };
  } finally {
    if (page) {
      await closePage(page);
    }
  }
};