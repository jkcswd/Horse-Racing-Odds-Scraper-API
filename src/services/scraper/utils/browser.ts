import puppeteer, { Browser, Page } from 'puppeteer';
import logger from '../../../utils/logger';

// TODO add browser refresh at interval to avoid memory leaks
// To pool a single browser instance across multiple scraping tasks. This works for low
// volume scraping however if we want to scale up we should implement a proper browser pool
// or preferably use a micro service architecture for scaling.
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
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-background-timer-throttling',
        '--disable-ipc-flooding-protection'
      ],
    });
  }
  return browserInstance;
};

export const createPage = async (): Promise<Page> => {
  try {
    const browser = await getBrowser();
    const page = await browser.newPage();

    await page.emulate({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: {
        width: 1366,
        height: 768,
        deviceScaleFactor: 1,
        isMobile: false,
        hasTouch: false,
        isLandscape: true
      }
    });

    // Block unnecessary resources for better performance, can turn off if it is causing detection issues
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      const resourceType = request.resourceType();
      if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
        request.abort();
      } else {
        request.continue();
      }
    });

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

