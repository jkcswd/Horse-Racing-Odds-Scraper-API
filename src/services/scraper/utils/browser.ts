import puppeteer, { Browser, Page } from 'puppeteer';
import logger from '../../../utils/logger';

// To pool a single browser instance across multiple scraping tasks.
let browserInstance: Browser | null = null;

export const getBrowser = async (): Promise<Browser> => {
  if (!browserInstance) {
    logger.info('Launching new browser instance');
    browserInstance = await puppeteer.launch({
      headless: process.env['PUPPETEER_HEADLESS'] === 'true',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
  }
  return browserInstance;
};

export const createPage = async (): Promise<Page> => {
  try {
    const browser = await getBrowser();
    const page = await browser.newPage();
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    await page.setViewport({ width: 1920, height: 1080 });
    
    logger.debug('New page created successfully');
    return page;
  } catch (error) {
    logger.error('Failed to create page', { error });
    throw error;
  }
};

export const closePage = async (page: Page): Promise<void> => {
  if (page && !page.isClosed()) {
    await page.close();
    logger.debug('Page closed successfully');
  }
};

export const closeBrowser = async (): Promise<void> => {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
    logger.info('Browser instance closed');
  }
};

