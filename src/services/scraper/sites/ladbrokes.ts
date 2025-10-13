import { Page } from 'puppeteer';
import { RaceData } from '../../../types/odds.types';
import { createPage, closePage } from '../utils/browser';
import logger from '../../../utils/logger';


// TODO implement filtering out or flagging non-runners like "Non Runner" or "Withdrawn"
// TODO filter out unnamed favorite placeholders
export const scrapeLadbrokes = async (url: string): Promise<RaceData> => {
  let page: Page | null = null;
  
  try {
    page = await createPage();
    logger.info('Navigating to Ladbrokes URL', { url });

    await page.goto(url, { waitUntil: 'domcontentloaded' }); // Better performance for most sites.

    // Wait for horse odds cards to load
    await page.waitForSelector('[data-crlat="oddsPrice"]', { timeout: 10000 });
    
    // Extract horses data from each race card data-crlat used instead of class names which are more likely to change 
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
      horsesOddsData,
      eventUrl: url,
      bookmaker: 'ladbrokes'
    };
    
  } catch (error) {
    logger.error('Error scraping Ladbrokes', { url, error });
    throw new Error(`Failed to scrape Ladbrokes: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    if (page) {
      await closePage(page); // close the page to free up resources since we are pooling a single browser instance
    }
  }
};
