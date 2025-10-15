import { Page } from 'puppeteer';
import { HorseOdds, HorseOddsScraperFunc } from '../../../types/odds.types';
import { createPage, closePage } from '../utils/browser';
import { gotoPageWithError, waitForSelectorWithError } from '../utils/scraper-utils';
import logger from '../../../utils/logger';

export const scrapeLadbrokes: HorseOddsScraperFunc = async (url) => {
  let page: Page | null = null;

  try {
    page = await createPage();

    // We go to the page and then wait for any selector that indicates the odds have loaded.
    // The custom errors these functions throw will be logged and then we can use them for retires and
    // for monitoring and alerts to triage and fix issues quicker.
    // dom content loaded is more reliable than waiting for networkidle as some resources may load slowly.
    await gotoPageWithError(page, url, { waitUntil: 'domcontentloaded' });
    await waitForSelectorWithError(page, '[data-crlat="oddsPrice"]', 10000);

    const horsesOddsData = await extractHorseOddsData(page);

    // Filter out non-runners and unnamed favorites as these are not actually horses that are going to run in the case of
    // unnamed favorites these are just placeholders. Non runners and withdrawn are assumed to be filtered out but if we 
    // want to include them we can add a flag to include them or remove the code if we always want them.
    const filteredHorsesData = filterValidHorses(horsesOddsData);

    logger.info('Horses data extracted and filtered', {
      totalHorses: horsesOddsData.length,
      validHorses: filteredHorsesData.length,
      filteredOut: horsesOddsData.length - filteredHorsesData.length
    });

    return {
      horsesOddsData: filteredHorsesData,
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

const extractHorseOddsData = async (page: Page): Promise<HorseOdds[]> => {
  // Extract horses data from each race card data-crlat used instead of class names which are more likely to change 
  return await page.evaluate(() => {
    const raceCardElements = document.querySelectorAll('[data-crlat="raceCard.odds"]');
    if (!raceCardElements || raceCardElements.length === 0) {
      throw new Error('No race cards found on the page');
    }

    return Array.from(raceCardElements).map((raceCard) => {
      const horseNameElement = raceCard.querySelector('[data-crlat="horseName"]');
      const oddsPriceElement = raceCard.querySelector('[data-crlat="oddsPrice"]');

      const horseName = horseNameElement?.textContent?.trim();
      const oddsPrice = oddsPriceElement?.textContent?.trim();

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
}

const filterValidHorses = (horsesData: { name: string; odds: string }[]) => {
  return horsesData.filter((horse) => {
    const horseName = horse.name.toLowerCase().trim();

    // TODO find out if we need to filter out non-runners and withdrawn or handle these differently.
    if (horseName.includes('non runner') ||
      horseName.includes('withdrawn') ||
      horseName.includes('scratched')) {
      logger.info('Filtered out non-runner', { horseName: horse.name });
      return false;
    }

    if (horseName.includes('unnamed favourite') ||
      horseName.includes('unnamed 2nd favourite') ||
      horseName.includes('unnamed 3rd favourite') ||
      horseName.match(/unnamed \d+(st|nd|rd|th) favourite?/)) {
      logger.info('Filtered out unnamed favorite placeholder', { horseName: horse.name });
      return false;
    }

    return true;
  });
};