import { Page } from 'puppeteer';
import logger from '../../../utils/logger';

/**
 * Custom error for when a selector is not found on the page. Does not bother with original error as it's not useful.
 */
export class SelectorNotFoundError extends Error {
  constructor(selector: string, timeout: number) {
    super(`Selector "${selector}" not found within ${timeout}ms timeout`);
    this.name = 'SelectorNotFoundError';
  }
}

/**
 * Custom error for page loading failures. Has original error as useful context may be contained.
 */
export class PageLoadError extends Error {
  public readonly originalError?: Error | undefined;
  
  constructor(url: string, originalError?: Error) {
    super(`Failed to load page: ${url}${originalError ? ` - ${originalError.message}` : ''}`);
    this.name = 'PageLoadError';
    if (originalError) {
      this.originalError = originalError;
    }
  }
}

export const waitForSelectorWithError = async (
  page: Page, 
  selector: string, 
  timeout: number = 10000
): Promise<void> => {
  try {
    logger.info('Waiting for selector', { selector, timeout });
    await page.waitForSelector(selector, { timeout });
    logger.info('Selector found successfully', { selector });
  } catch (error) {
    logger.error('Selector not found', { selector, timeout, error });
    throw new SelectorNotFoundError(selector, timeout);
  }
};


export const gotoPageWithError = async (
  page: Page, 
  url: string, 
  options: { 
    waitUntil?: 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2',
    timeout?: number 
  } = { waitUntil: 'domcontentloaded', timeout: 30000 }
): Promise<void> => {
  try {
    logger.info('Navigating to URL', { url, options });
    
    const response = await page.goto(url, options);
    
    if (!response) {
      // This can happen with multiple redirects or certain URL types
      logger.warn('Navigation returned null response, but page may have loaded', { url });
      return;
    }
    
    if (!response.ok()) {
      throw new Error(`HTTP ${response.status()}: ${response.statusText()}`);
    }
    
    logger.info('Page loaded successfully', { 
      url, 
      status: response.status(), 
      finalUrl: response.url() 
    });
    
  } catch (error) {
    logger.error('Failed to load page', { url, error });
    throw new PageLoadError(url, error instanceof Error ? error : undefined);
  }
};